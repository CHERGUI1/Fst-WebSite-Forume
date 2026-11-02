import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUploadedResources,
  approveResource,
  rejectResource,
  deleteUploadedResource,
  getCurrentUser,
  logoutUser
} from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getAdminUploads,
  approveUpload,
  rejectUpload,
  deleteUpload,
  getActiveProfile,
  signOutUser
} from '../lib/supabaseService';

export default function AdminUploads() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const cloudItems = await getAdminUploads();
        setUploads(cloudItems);
      } else {
        setUploads(getUploadedResources());
      }
    } catch (err) {
      console.error('Error fetching admin uploads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      let user = getCurrentUser();
      if (isSupabaseConfigured) {
        user = await getActiveProfile();
      }

      if (!user || user.role !== 'admin') {
        navigate('/');
        return;
      }

      await fetchUploads();
    };

    init();
  }, [fetchUploads, navigate]);

  const handleApprove = async (id) => {
    try {
      if (isSupabaseConfigured) {
        await approveUpload(id);
      } else {
        approveResource(id);
      }
      await fetchUploads();
    } catch (err) {
      alert(err.message || 'Erreur lors de l’approbation.');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('سبب الرفض (اختياري)') || '';
    try {
      if (isSupabaseConfigured) {
        await rejectUpload(id, reason);
      } else {
        rejectResource(id, reason);
      }
      await fetchUploads();
    } catch (err) {
      alert(err.message || 'Erreur lors du rejet.');
    }
  };

  const handleDelete = async (up) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      try {
        if (isSupabaseConfigured) {
          await deleteUpload(up.id, up.filePath);
        } else {
          deleteUploadedResource(up.id);
        }
        await fetchUploads();
      } catch (err) {
        alert(err.message || 'Erreur lors de la suppression.');
      }
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await signOutUser();
    } else {
      logoutUser();
    }
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      <section className="flex justify-between items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Téléversements</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {isSupabaseConfigured ? '🟢 Connecté au Cloud Supabase' : 'Mode Local'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 text-sm cursor-pointer"
        >
          Se déconnecter
        </button>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 shadow-sm">
        <table className="w-full table-auto">
          <thead className="bg-slate-50 dark:bg-zinc-900/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Titre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Auteur</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Catégorie</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400 dark:text-zinc-500">
                  Chargement des ressources...
                </td>
              </tr>
            ) : uploads.map((up) => (
              <tr key={up.id} className="border-t border-slate-200 dark:border-zinc-700/60">
                <td className="px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 font-medium">
                  <div>{up.title}</div>
                  <div className="text-xs text-slate-400 dark:text-zinc-500">{up.specId} • {up.semesterId} • {up.subjectId}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-zinc-400">{up.author}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-zinc-400 uppercase text-xs font-semibold">{up.category}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    up.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                      : up.status === 'rejected'
                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900'
                  }`}>
                    {up.status === 'approved' ? 'Approuvé' : up.status === 'rejected' ? 'Rejeté' : 'En attente'}
                  </span>
                  {up.status === 'rejected' && up.rejectionReason && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 italic">Motif: {up.rejectionReason}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm space-x-2">
                  {up.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(up.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(up.id)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Rejeter
                      </button>
                    </>
                  )}
                  {up.fileUrl && (
                    <a
                      href={up.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Prévisualiser / Télécharger
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(up)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {!loading && uploads.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400 dark:text-zinc-500">
                  Aucun téléversement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
