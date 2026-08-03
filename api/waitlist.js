const dns = require('node:dns').promises;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const BLOCKED_DOMAINS = new Set([
  'example.com','example.org','example.net','test.com','mailinator.com',
  'guerrillamail.com','10minutemail.com','tempmail.com','yopmail.com'
]);

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function domainAcceptsEmail(domain) {
  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 503, { error: 'Waitlist setup is not complete yet.' });
  }

  const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
  const email = rawEmail.trim().toLowerCase();
  const source = typeof req.body?.source === 'string' ? req.body.source.slice(0, 80) : 'website';

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json(res, 400, { error: 'Enter a valid email address.' });
  }

  const domain = email.split('@')[1];
  if (BLOCKED_DOMAINS.has(domain)) {
    return json(res, 400, { error: 'Please use a real email address.' });
  }

  if (!(await domainAcceptsEmail(domain))) {
    return json(res, 400, { error: 'That email domain cannot receive mail.' });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ email, source })
  });

  if (response.ok) {
    return json(res, 201, { ok: true, message: "You're on the Kairox waitlist." });
  }

  const details = await response.text();
  if (response.status === 409 || details.includes('duplicate key')) {
    return json(res, 200, { ok: true, duplicate: true, message: "You're already on the waitlist." });
  }

  console.error('Supabase waitlist insert failed:', response.status, details);
  return json(res, 500, { error: 'We could not save your email. Please try again.' });
};
