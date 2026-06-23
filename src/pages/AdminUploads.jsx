import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUploadedResources, approveResource, rejectResource, getCurrentUser, logoutUser } from '../data/mockData';

export default function AdminUploads() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [currentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    setUploads(getUploadedResources());
  }, [currentUser, navigate]);

  const handleApprove = (id) => {
    approveResource(id);
    setUploads(getUploadedResources());
  };

  const handleReject = (id) => {
    const reason = window.prompt('سبب الرفض (اختياري)') || '';
    rejectResource(id, reason);
    setUploads(getUploadedResources());
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      <section className="flex justify-between items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Téléversements</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-950/40"
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
            {uploads.map((up) => (
              <tr key={up.id} className="border-t border-slate-200 dark:border-zinc-700/60">
                <td className="px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 font-medium">{up.title}</td>
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
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={() => handleReject(up.id)} 
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition"
                      >
                        Rejeter
                      </button>
                    </>
                  )}
                  {up.fileUrl && (
                    <a 
                      href={up.fileUrl} 
                      download={up.fileName || 'file'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Télécharger
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {uploads.length === 0 && (
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
