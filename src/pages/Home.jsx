import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  mockSpecializations,
  getFilieres as getLocalFilieres,
  resourceCategoryLabels,
  getSubjectsData,
  getUploadedResources,
  getCurrentUser,
} from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getSearchableApprovedResources,
  getFilieres,
  saveFiliere,
  removeFiliere,
  getActiveProfile,
} from '../lib/supabaseService';

const cycleLabels = {
  deust: 'DEUST (Tronc Commun)',
  licence: 'Licence (LST - S5 & S6)',
  master: 'Master (MST)',
};

export default function Home() {
  const { cycleId } = useParams();
  const isCyclePage = Boolean(cycleId);
  const isStudyCyclePage = cycleId === 'deust' || cycleId === 'licence' || cycleId === 'master';
  const cycleLabel = cycleLabels[cycleId] || cycleId?.toUpperCase();

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [allResources, setAllResources] = useState([]);
  const [filieres, setFilieres] = useState(() => getLocalFilieres(cycleId));

  // حالات نافذة إدارة الشعب (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingFiliere, setEditingFiliere] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formModulesCount, setFormModulesCount] = useState(12);

  // مزامنة حالة المستخدم الحالي
  useEffect(() => {
    getActiveProfile().then((p) => {
      if (p) setCurrentUser(p);
    });
  }, []);

  // جلب الشعب للطور المحدد
  useEffect(() => {
    let active = true;
    getFilieres(cycleId)
      .then((items) => {
        if (active) setFilieres(items);
      })
      .catch((error) => console.error('Error loading filières:', error));
    return () => {
      active = false;
    };
  }, [cycleId]);

  useEffect(() => {
    let isMounted = true;

    const loadResources = async () => {
      try {
        const resources = isSupabaseConfigured
          ? await getSearchableApprovedResources()
          : getUploadedResources().filter((resource) => resource.status === 'approved');
        if (isMounted) setAllResources(resources);
      } catch (error) {
        console.error('Error loading searchable resources:', error);
      }
    };

    loadResources();
    return () => {
      isMounted = false;
    };
  }, []);

  // تهيئة المواد للبحث وتسطيحها (Flattening)
  const allSubjects = useMemo(() => {
    const subjects = [];
    Object.entries(getSubjectsData()).forEach(([specId, semesters]) => {
      const spec = mockSpecializations.find((s) => s.id === specId);
      if (!spec) return;
      Object.entries(semesters).forEach(([semesterId, list]) => {
        list.forEach((subject) => {
          subjects.push({
            ...subject,
            specId,
            specName: spec.name,
            semesterId,
          });
        });
      });
    });

    return subjects;
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // تصفية النتائج بناءً على نص البحث
  const searchResults = useMemo(() => {
    if (!query) return { specs: [], subjects: [], resources: [] };

    const specs = mockSpecializations.filter(
      (spec) =>
        spec.name.toLowerCase().includes(query) ||
        spec.description.toLowerCase().includes(query)
    );

    const subjects = allSubjects.filter(
      (sub) =>
        sub.name.toLowerCase().includes(query) ||
        sub.specName.toLowerCase().includes(query)
    );

    const resources = allResources.filter(
      (res) =>
        res.title.toLowerCase().includes(query) ||
        (res.author && res.author.toLowerCase().includes(query)) ||
        (res.channel && res.channel.toLowerCase().includes(query))
    );

    return { specs, subjects, resources };
  }, [query, allSubjects, allResources]);

  const hasResults =
    searchResults.specs.length > 0 ||
    searchResults.subjects.length > 0 ||
    searchResults.resources.length > 0;

  // دوال إدارة الشعب للمشرف
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingFiliere(null);
    setFormName('');
    setFormDescription('');
    setFormModulesCount(cycleId === 'licence' ? 12 : 24);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, filiere) => {
    e.preventDefault();
    e.stopPropagation();
    setModalMode('edit');
    setEditingFiliere(filiere);
    setFormName(filiere.name);
    setFormDescription(filiere.description || '');
    setFormModulesCount(filiere.modulesCount || 12);
    setIsModalOpen(true);
  };

  const handleDeleteFiliere = async (e, filiere) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la filière "${filiere.name}" ?`
    );
    if (!confirmed) return;

    try {
      await removeFiliere(filiere.id, cycleId);
      setFilieres((prev) => prev.filter((item) => item.id !== filiere.id));
    } catch (err) {
      console.error('Error removing filière:', err);
      alert(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Veuillez entrer un nom pour la filière.');
      return;
    }

    const cleanId = formName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const id = modalMode === 'edit' ? editingFiliere.id : cleanId || `filiere-${Date.now()}`;

    const newFiliere = {
      id,
      cycleId: cycleId || 'deust',
      name: formName.trim(),
      description: formDescription.trim(),
      modulesCount: Number(formModulesCount) || 12,
    };

    try {
      await saveFiliere(newFiliere, modalMode === 'edit' ? editingFiliere : null);
      if (modalMode === 'edit') {
        setFilieres((prev) =>
          prev.map((item) => (item.id === editingFiliere.id ? newFiliere : item))
        );
      } else {
        setFilieres((prev) => [...prev, newFiliere]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving filière:', err);
      alert(`Erreur lors de l'enregistrement: ${err.message}`);
    }
  };

  return (
    <div className="space-y-12">
      {!isCyclePage && (
        <>
          <section className="text-center max-w-3xl mx-auto space-y-4 py-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white animate-fade-in">
              Toutes vos ressources académiques au <span className="text-blue-900 dark:text-blue-500">même endroit</span>.
            </h1>
            <p className="text-lg text-slate-500 dark:text-zinc-400">
              Accédez aux cours, TDs, examens archivés et tutoriels recommandés par vos pairs.
            </p>

            <div className="relative max-w-xl mx-auto pt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un module, un cours, une spécialité..."
                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-sm text-slate-900 dark:text-white"
              />
              <div className="absolute left-4 top-7 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </section>

          {/* نتائج البحث */}
          {query ? (
            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-800/80 backdrop-blur border border-slate-200 dark:border-zinc-700 rounded-2xl p-6 shadow-lg space-y-6 text-left transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-700 pb-3">
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200">
                  Résultats de recherche pour "{searchQuery}"
                </h3>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline"
                >
                  Effacer
                </button>
              </div>

              {!hasResults ? (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
                  Aucun résultat trouvé pour votre recherche. Essayez avec d'autres mots-clés.
                </div>
              ) : (
                <div className="space-y-6">
                  {searchResults.specs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Spécialités ({searchResults.specs.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchResults.specs.map((spec) => (
                          <Link
                            key={spec.id}
                            to={`/specializations/${spec.id}`}
                            className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-xl hover:border-blue-900 dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition flex items-center justify-between"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200 block truncate">
                                {spec.name}
                              </span>
                              <p className="text-xs text-slate-400 dark:text-zinc-500 line-clamp-1">
                                {spec.description}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 flex-shrink-0">
                              Spécialité
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.subjects.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Modules / Matières ({searchResults.subjects.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchResults.subjects.map((sub) => (
                          <Link
                            key={`${sub.specId}-${sub.semesterId}-${sub.id}`}
                            to={`/specializations/${sub.specId}/semesters/${sub.semesterId}/subjects/${sub.id}`}
                            className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-xl hover:border-blue-900 dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition flex items-center justify-between"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200 block truncate">
                                {sub.name}
                              </span>
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                {sub.specName} ({sub.semesterId})
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 flex-shrink-0">
                              Module
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.resources.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Cours & Documents ({searchResults.resources.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {searchResults.resources.map((res) => {
                          const categoryLabel = resourceCategoryLabels[res.category] || 'Document';
                          const resourceCycle = ['S5', 'S6'].includes(res.semesterId) ? 'licence' : 'deust';
                          const detailPath = `/specializations/${res.specId}/semesters/${res.semesterId}/subjects/${res.subjectId}?cycle=${resourceCycle}`;
                          return (
                            <Link
                              key={`${res.category}-${res.id}`}
                              to={detailPath}
                              className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-xl hover:border-blue-900 dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-4">
                                <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200 block truncate">
                                  {res.title}
                                </span>
                                <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                  {res.author || res.channel || 'UniShare'} • {res.size || res.duration || ''}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 flex-shrink-0">
                                {categoryLabel}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <section className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-center">
              {[
                { label: 'Spécialités', val: mockSpecializations.length },
                { label: 'Ressources disponibles', val: allResources.length },
                { label: 'Matières', val: allSubjects.length },
              ].map((metric) => (
                <div key={metric.label} className="p-4 bg-slate-100 dark:bg-zinc-800/50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-500">{metric.val}</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{metric.label}</div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {/* عرض الشعب لكل طور (DEUST, Licence, Master) */}
      {isStudyCyclePage && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div>
              <p className="text-xs uppercase font-semibold text-blue-900 dark:text-blue-400">
                {cycleLabel}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Filières & Spécialisations</h2>
            </div>

            {currentUser?.role === 'admin' && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une filière
              </button>
            )}
          </div>

          {filieres.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-500">
              Aucune filière répertoriée pour ce cycle.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filieres.map((spec) => (
                <div
                  key={spec.id}
                  className="relative p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl hover:shadow-md transition group flex flex-col justify-between"
                >
                  <Link
                    to={`/specializations/${spec.id}?cycle=${cycleId}`}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2 pr-12">
                        <h3 className="font-semibold text-base text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">
                          {spec.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {spec.description}
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-4">
                      {spec.modulesCount || 12} Modules répertoriés
                    </div>
                  </Link>

                  {/* أزرار الإدارة للمشرف (تعديل وحذف) */}
                  {currentUser?.role === 'admin' && (
                    <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-lg p-1 border border-slate-200 dark:border-zinc-700 shadow-xs">
                      <button
                        onClick={(e) => handleOpenEditModal(e, spec)}
                        className="p-1 text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition cursor-pointer"
                        title="Modifier la filière"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteFiliere(e, spec)}
                        className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Supprimer la filière"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal نافذة إضافة / تعديل الشعبة للمشرف */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-zinc-700 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-700/60 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {modalMode === 'add'
                  ? `Ajouter une filière (${cycleLabels[cycleId] || cycleId})`
                  : `Modifier la filière`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                  Nom de la filière
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: MIP ou LST Génie Informatique"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brève description de la filière et de ses débouchés..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                  Nombre approximatif de modules
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formModulesCount}
                  onChange={(e) => setFormModulesCount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition shadow-sm"
                >
                  {modalMode === 'add' ? 'Créer la filière' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
