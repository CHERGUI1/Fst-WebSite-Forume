create table if not exists public.filieres (
  cycle_id text not null check (cycle_id in ('deust', 'licence', 'master')),
  id text not null,
  name text not null,
  description text not null default '',
  modules_count integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (cycle_id, id)
);

alter table public.filieres enable row level security;

drop policy if exists "Anyone can read filieres" on public.filieres;
create policy "Anyone can read filieres" on public.filieres
  for select to anon, authenticated using (true);

drop policy if exists "Admins manage filieres" on public.filieres;
create policy "Admins manage filieres" on public.filieres
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.filieres (cycle_id, id, name, description, modules_count) values
  ('deust', 'genie-informatique', 'Génie Informatique', 'Software engineering, systems, and algorithms.', 42),
  ('deust', 'genie-mecanique', 'Génie Mécanique', 'Fluid mechanics, solid mechanics, and manufacturing.', 38),
  ('deust', 'genie-electrique', 'Génie Électrique', 'Electronics, automation, and power systems.', 40),
  ('deust', 'genie-industriel', 'Génie Industriel', 'Supply chain, quality control, and optimization.', 35),
  ('licence', 'genie-informatique', 'Génie Informatique', 'Software engineering, systems, and algorithms.', 42),
  ('licence', 'genie-mecanique', 'Génie Mécanique', 'Fluid mechanics, solid mechanics, and manufacturing.', 38),
  ('licence', 'genie-electrique', 'Génie Électrique', 'Electronics, automation, and power systems.', 40),
  ('licence', 'genie-industriel', 'Génie Industriel', 'Supply chain, quality control, and optimization.', 35)
on conflict (cycle_id, id) do nothing;
