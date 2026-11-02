-- Replace only the original generic DEUST seed rows. Resource records are untouched.
delete from public.filieres
where cycle_id = 'deust'
  and id in ('genie-informatique', 'genie-mecanique', 'genie-electrique', 'genie-industriel');

insert into public.filieres (cycle_id, id, name, description, modules_count) values
  ('deust', 'mip', 'MIP (Maths, Info, Physique)', 'Tronc commun d’accès aux filières d’informatique et d’ingénierie.', 24),
  ('deust', 'mipc', 'MIPC (Maths, Info, Physique, Chimie)', 'Tronc commun axé sur les sciences physiques et chimiques appliquées.', 24),
  ('deust', 'bcg', 'BCG (Biologie, Chimie, Géologie)', 'Sciences de la vie, de la matière et de l’environnement.', 24),
  ('deust', 'ge-gm', 'GE-GM (Génie Électrique & Mécanique)', 'Sciences fondamentales et technologies de l’ingénieur.', 24)
on conflict (cycle_id, id) do update set
  name = excluded.name,
  description = excluded.description,
  modules_count = excluded.modules_count;

insert into public.filieres (cycle_id, id, name, description, modules_count) values
  ('licence', 'genie-informatique', 'LST Génie Informatique', 'Génie logiciel, architectures web, bases de données et réseaux.', 12),
  ('licence', 'genie-mecanique', 'LST Génie Mécanique', 'Conception mécanique, modélisation et productique industrielle.', 12),
  ('licence', 'genie-electrique', 'LST Génie Électrique', 'Électronique avancée, automatique et systèmes communicants.', 12),
  ('licence', 'genie-industriel', 'LST Génie Industriel', 'Supply chain, gestion de la qualité et optimisation de production.', 12),
  ('master', 'mst-ia', 'MST Intelligence Artificielle & Data', 'Apprentissage profond, big data analytics et vision artificielle.', 16),
  ('master', 'mst-iot', 'MST Systèmes Embarqués & IoT', 'Conception de cartes intelligentes, protocoles temps réel et IoT.', 16)
on conflict (cycle_id, id) do update set
  name = excluded.name,
  description = excluded.description,
  modules_count = excluded.modules_count;
