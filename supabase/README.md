# Supabase setup

1. Create a Supabase project and open its SQL Editor.
2. Run `migrations/202611010001_initial_schema.sql`.
3. Create the first account using the app, then promote it to admin from the SQL Editor:

```sql
update public.profiles
set role = 'admin'
where username = 'YOUR_USERNAME';
```

4. Copy the project URL and the publishable/anon key into a local `.env` file using `.env.example` as a guide. Never put a `service_role` key in the browser app or commit `.env`.

The migration creates shared profiles, resources, comments, row-level security policies, and a private file bucket. The browser app still needs to be connected to these tables and storage before cloud accounts, uploads, reviews, and comments work across devices.
