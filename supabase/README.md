# Supabase setup

1. Create a Supabase project and open its SQL Editor.
2. Run `migrations/202611010001_initial_schema.sql`.
3. If the project was already set up, run the newer migrations in `migrations/` in date order. Run `202611020001_fix_profile_role_policy.sql` to remove the recursive profile policy that blocks role changes, `202611030001_manage_filieres.sql` to enable shared filière management, then `202611040001_refresh_filiere_catalog.sql` to update the cycle-specific catalogue.
4. Create the first account using the app, then promote it to admin from the SQL Editor:

```sql
update public.profiles
set role = 'admin'
where username = 'YOUR_USERNAME';
```

5. Copy the project URL and the publishable/anon key into a local `.env` file using `.env.example` as a guide. Never put a `service_role` key in the browser app or commit `.env`.

The migration creates shared profiles, resources, comments, row-level security policies, and a private file bucket. The browser app still needs to be connected to these tables and storage before cloud accounts, uploads, reviews, and comments work across devices.
