import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  logoutUser,
  getUploadedResources,
  approveResource,
  rejectResource,
  getSpecializationById,
  resourceCategoryLabels,
} from '../data/mockData';

export default function Profile() {
  const navigate = useNavigate();

// State hooks
const [currentUser] = useState(() => getCurrentUser());
const [pendingUploads, setPendingUploads] = useState(() => {
  const user = getCurrentUser();
  if (user && user.role === 'admin') {
    return getUploadedResources().filter((r) => r.status === 'pending');
  }
  return [];
});
const [userContributions, setUserContributions] = useState(() => {
  const user = getCurrentUser();
  if (user && user.role !== 'admin') {
    return getUploadedResources().filter((r) => r.author === user.username);
  }
  return [];
});

// Navigation to admin pages
const goToAdminUsers = () => navigate('/admin/users');
const goToAdminUploads = () => navigate('/admin/uploads');

// Refresh pending uploads after actions
const refreshPending = () => {
  const user = getCurrentUser();
  if (user && user.role === 'admin') {
    setPendingUploads(getUploadedResources().filter((r) => r.status === 'pending'));
  }
};

const handleApprove = (id) => {
  approveResource(id);
  refreshPending();
};

const handleReject = (id) => {
  const reason = window.prompt('سبب الرفض (اختياري)') || '';
  rejectResource(id, reason);
  refreshPending();
};


  useEffect(() => {
    if (!getCurrentUser()) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    window.location.reload();
  };

// Duplicate handlers removed – using the earlier definitions with refreshPending




  if (!currentUser) return null;

  const specDetail = getSpecializationById(currentUser.specialization);

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* كارت معلومات الملف الشخصي */}
      <section className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-900 dark:text-blue-400 font-extrabold text-2xl">
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {currentUser.username}
              {currentUser.role === 'admin' && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                  Modérateur
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {currentUser.role === 'admin'
                ? 'Administration de la plateforme'
                : `Filière: ${specDetail?.name || 'Générale'} • Semestre: ${currentUser.level}`}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition text-sm cursor-pointer border border-red-100 dark:border-red-900/50"
        >
          Se déconnecter
        </button>
      </section>

      {/* لوحة تحكم المشرف (Admin Moderation Panel) */}
      {currentUser.role === 'admin' && (
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Modération des Ressources</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Validez ou rejetez les ressources téléversées par les étudiants.
            </p>
          </div>

          {pendingUploads.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-zinc-800/30 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400">
              Aucune ressource en attente de modération.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUploads.map((res) => (
                <div
                  key={res.id}
                  className="p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition"
                >
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 uppercase">
                        {resourceCategoryLabels[res.category] || 'Document'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                        Proposé par {res.author} le {res.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-zinc-100 truncate text-base">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Module: <span className="font-semibold">{res.subjectId}</span> ({res.semesterId} - {res.specId})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleApprove(res.id)}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition text-xs cursor-pointer shadow-sm"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(res.id)}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 font-semibold transition text-xs cursor-pointer border border-slate-200 dark:border-zinc-600"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* لوحة تحكم الطالب (Student Contributions) */}
      {currentUser.role !== 'admin' && (
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mes Contributions</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Suivez l'état des documents que vous avez partagés sur UniShare.
            </p>
          </div>

          {userContributions.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-zinc-800/30 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400">
              Vous n'avez pas encore partagé de ressources. Vos contributions aideront vos pairs !
            </div>
          ) : (
            <div className="space-y-3">
              {userContributions.map((res) => (
                <div
                  key={res.id}
                  className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-xl flex justify-between items-center"
                >
                  <div className="min-w-0 pr-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 uppercase mr-2">
                      {resourceCategoryLabels[res.category]}
                    </span>
                    <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200 truncate inline-block align-middle max-w-[200px] sm:max-w-md">
                      {res.title}
                    </span>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                      Partagé le {res.date} • Module: {res.subjectId}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      res.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900'
                    }`}
                  >
                    {res.status === 'approved' ? 'En ligne' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
