-- UniShare shared data model. Run this migration in the Supabase SQL editor.
-- The first administrator is assigned manually after creating their Auth account.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  specialization text not null default 'genie-informatique',
  level text not null default 'S1',
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, specialization, level)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'specialization', ''), 'genie-informatique'),
    coalesce(nullif(new.raw_user_meta_data ->> 'level', ''), 'S1')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.create_profile_for_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('courses', 'td', 'exams', 'youtube')),
  specialization_id text not null,
  semester_id text not null,
  subject_id text not null,
  uploader_id uuid references public.profiles (id) on delete set null,
  author_name text not null,
  file_path text,
  external_url text,
  file_name text,
  file_size bigint,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  constraint resources_file_or_link check (
    (category = 'youtube' and external_url is not null and file_path is null)
    or (category <> 'youtube' and file_path is not null)
  )
);

create index if not exists resources_subject_status_idx
  on public.resources (specialization_id, semester_id, subject_id, status, created_at desc);
create index if not exists resources_uploader_idx on public.resources (uploader_id, created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null,
  username text not null,
  user_id uuid references public.profiles (id) on delete set null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists comments_subject_created_idx on public.comments (subject_id, created_at);

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.comments enable row level security;

create policy "Profiles visible to self or admins" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Users update own basic profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select role from public.profiles p where p.id = (select auth.uid())));
create policy "Admins manage profiles" on public.profiles
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone can read approved resources" on public.resources
  for select to anon, authenticated using (status = 'approved' or uploader_id = (select auth.uid()) or (select public.is_admin()));
create policy "Signed in users submit pending resources" on public.resources
  for insert to authenticated with check (
    uploader_id = (select auth.uid()) and status = 'pending' and reviewed_by is null and reviewed_at is null
  );
create policy "Admins manage resources" on public.resources
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone can read comments" on public.comments
  for select to anon, authenticated using (true);
create policy "Signed in users add comments as themselves" on public.comments
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Admins manage comments" on public.comments
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('unishare-resources', 'unishare-resources', false, 52428800,
  array['application/pdf', 'image/png', 'image/jpeg', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload files into their own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'unishare-resources' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users read approved resource files and admins read all" on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'unishare-resources' and (
      exists (select 1 from public.resources r where r.file_path = name and r.status = 'approved')
      or exists (select 1 from public.resources r where r.file_path = name and r.uploader_id = (select auth.uid()))
      or (select public.is_admin())
    )
  );
create policy "Admins delete resource files" on storage.objects
  for delete to authenticated using (bucket_id = 'unishare-resources' and (select public.is_admin()));
