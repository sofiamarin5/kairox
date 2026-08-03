function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, DELETE');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const supplied = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  if (!adminPassword || supplied !== adminPassword) {
    return json(res, 401, { error: 'Unauthorized.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 503, { error: 'Database setup is incomplete.' });
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  if (req.method === 'DELETE') {
    const id = typeof req.query?.id === 'string' ? req.query.id : '';
    if (!id) return json(res, 400, { error: 'Missing signup ID.' });

    const response = await fetch(`${supabaseUrl}/rest/v1/waitlist?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) return json(res, 500, { error: 'Could not delete signup.' });
    return json(res, 200, { ok: true });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/waitlist?select=id,email,source,created_at&order=created_at.desc`, {
    headers
  });
  if (!response.ok) {
    const details = await response.text();
    console.error('Supabase admin fetch failed:', response.status, details);
    return json(res, 500, { error: 'Could not load the waitlist.' });
  }

  const signups = await response.json();
  return json(res, 200, { signups, total: signups.length });
};
