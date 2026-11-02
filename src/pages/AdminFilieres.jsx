import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProfile, getFilieres, removeFiliere, saveFiliere } from '../lib/supabaseService';

const blank = { id: '', cycleId: 'deust', name: '', description: '', modulesCount: 0 };

export default function AdminFilieres() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => setItems(await getFilieres());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await getActiveProfile();
        if (profile?.role !== 'admin') { navigate('/'); return; }
        const filieres = await getFilieres();
        if (active) setItems(filieres);
      } catch (err) { if (active) setError(err.message); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError('');
    const record = { ...form, id: form.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-'), name: form.name.trim(), description: form.description.trim() };
    try {
      await saveFiliere(record, editing);
      await refresh();
      setForm(blank); setEditing(null);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const edit = (item) => { setForm({ ...item }); setEditing({ id: item.id, cycleId: item.cycleId }); };
  const remove = async (item) => {
    if (!window.confirm(`Supprimer la filière « ${item.name} » ?`)) return;
    setError('');
    try { await removeFiliere(item.id, item.cycleId); await refresh(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <h1 className="text-2xl font-bold">Gestion des filières</h1>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 p-5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <select value={form.cycleId} onChange={(e) => setForm({ ...form, cycleId: e.target.value })} className="rounded-lg border p-2 dark:bg-zinc-700">
          <option value="deust">DEUST</option><option value="licence">Licence</option><option value="master">Master</option>
        </select>
        <input required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="Identifiant (ex. genie-informatique)" disabled={Boolean(editing)} className="rounded-lg border p-2 dark:bg-zinc-700" />
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom de la filière" className="rounded-lg border p-2 dark:bg-zinc-700" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-lg border p-2 dark:bg-zinc-700" />
        <div className="sm:col-span-2 flex gap-2">
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-blue-700 text-white disabled:opacity-50">{editing ? 'Enregistrer les modifications' : 'Ajouter la filière'}</button>
          {editing && <button type="button" onClick={() => { setForm(blank); setEditing(null); }} className="px-4 py-2 rounded-lg border">Annuler</button>}
        </div>
        {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      </form>
      {loading ? <p>Chargement...</p> : <div className="space-y-3">{items.map((item) => (
        <article key={`${item.cycleId}-${item.id}`} className="flex flex-wrap justify-between gap-3 items-center p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.cycleId.toUpperCase()} · {item.id}</p><p className="text-sm text-slate-500">{item.description}</p></div>
          <div className="flex gap-2"><button onClick={() => edit(item)} className="px-3 py-1.5 rounded-lg border">Modifier</button><button onClick={() => remove(item)} className="px-3 py-1.5 rounded-lg border text-red-600">Supprimer</button></div>
        </article>
      ))}</div>}
    </div>
  );
}
