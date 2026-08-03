-- Run this once in Supabase: SQL Editor -> New query -> Run

create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_unique
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- No public browser access is granted. The Vercel API uses the server-only
-- Supabase service-role key, which bypasses RLS. Never expose that key in HTML.

comment on table public.waitlist is
  'Kairox early-access signups collected through the Vercel serverless API.';
