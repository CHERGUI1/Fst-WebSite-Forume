-- The old self-update policy queried profiles from its own WITH CHECK clause,
-- which caused PostgreSQL to recursively evaluate profiles RLS policies.
-- Administrators retain profile and role management through "Admins manage profiles".
drop policy if exists "Users update own basic profile" on public.profiles;
