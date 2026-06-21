import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { mockSpecializations, mockSubjects, mockResources, resourceCategoryLabels } from '../data/mockData';

const cycleLabels = {
  deust: 'DEUST',
  licence: 'Licence',
  master: 'Master',
};

export default function Home() {
  const { cycleId } = useParams();
  const isCyclePage = Boolean(cycleId);
  const isDeustPage = cycleId === 'deust';
  const cycleLabel = cycleLabels[cycleId];

  const [searchQuery, setSearchQuery] = useState('');

  // تهيئة البيانات للبحث وتسطيحها (Flattening)
  const { allSubjects, allResources } = useMemo(() => {
    const subjects = [];
    Object.entries(mockSubjects).forEach(([specId, semesters]) => {
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

    const resources = [];
    Object.entries(mockResources).forEach(([category, list]) => {
      list.forEach((resource) => {
        // تعيين التخصص والمادة الافتراضية لعرض الروابط بشكل صحيح في الموك
        let subjectId = 'algebre';
        let specId = 'genie-informatique';
        let semesterId = 'S1';

        const titleLower = resource.title.toLowerCase();
        if (titleLower.includes('analyse') || titleLower.includes('espaces vectoriels') || titleLower.includes('chapitre 1')) {
          subjectId = 'analyse';
        } else if (titleLower.includes('matériaux') || titleLower.includes('science')) {
          specId = 'genie-mecanique';
          subjectId = 'materiaux';
        } else if (titleLower.includes('circuits') || titleLower.includes('électrique')) {
          specId = 'genie-electrique';
          subjectId = 'circuits';
        } else if (titleLower.includes('production') || titleLower.includes('gestion')) {
          specId = 'genie-industriel';
          subjectId = 'gestion-production';
          semesterId = 'S2';
        } else if (titleLower.includes('c') && !titleLower.includes('matrices')) {
          subjectId = 'programmation-c';
          semesterId = 'S2';
        }

        resources.push({
          ...resource,
          category,
          specId,
          semesterId,
          subjectId,
        });
      });
    });

    return { allSubjects: subjects, allResources: resources };
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
                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-sm"
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
                          const detailPath = `/specializations/${res.specId}/semesters/${res.semesterId}/subjects/${res.subjectId}/resources/${res.category}/${res.id}`;
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
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
              {[
                { label: 'Spécialités', val: '4' },
                { label: 'Cours & Documents', val: '1,200+' },
                { label: 'Vidéos de Soutien', val: '340+' },
                { label: 'Étudiants Actifs', val: '5K+' },
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

      {isDeustPage && (
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
            <p className="text-xs uppercase font-semibold text-blue-900 dark:text-blue-400">{cycleLabel}</p>
            <h2 className="text-xl font-bold">Filières & Spécialisations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockSpecializations.map((spec) => (
              <Link
                key={spec.id}
                to={`/specializations/${spec.id}`}
                className="p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-base group-hover:text-blue-900 dark:group-hover:text-blue-400 transition mb-2">
                    {spec.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {spec.description}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-4">
                  {spec.modulesCount} Modules disponibles
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {isCyclePage && !isDeustPage && (
        <section className="text-center py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">{cycleLabel}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
            Les filières de ce cycle seront ajoutées prochainement.
          </p>
        </section>
      )}
    </div>
  );
}
