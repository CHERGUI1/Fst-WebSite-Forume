import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { getSemestersForCycle, getFilieres as getLocalFilieres } from '../data/mockData';
import { getFilieres } from '../lib/supabaseService';

const cycleNames = {
  deust: 'DEUST',
  licence: 'Licence (LST)',
  master: 'Master (MST)',
};

export default function Specialization() {
  const { specId } = useParams();
  const [searchParams] = useSearchParams();
  const cycleId = searchParams.get('cycle') || 'deust';
  const [spec, setSpec] = useState(() => getLocalFilieres().find((item) => item.id === specId));
  const [loading, setLoading] = useState(true);
  const semesters = getSemestersForCycle(cycleId);

  useEffect(() => {
    let active = true;
    getFilieres(cycleId)
      .then((items) => {
        if (active) setSpec(items.find((item) => item.id === specId) || null);
      })
      .catch((error) => console.error('Error loading filière:', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [specId, cycleId]);

  if (loading) return <p className="text-center py-10 text-slate-500">Chargement...</p>;
  if (!spec) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
        <span className="text-xs uppercase font-bold text-blue-900 dark:text-blue-400 tracking-wider">
          {cycleNames[cycleId] || cycleId.toUpperCase()}
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{spec.name}</h1>
        {spec.description && (
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl">
            {spec.description}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-600 dark:text-zinc-400 mb-4">
          Sélectionnez un semestre pour accéder aux modules :
        </h2>

        <div className={`grid gap-4 ${
          semesters.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-xl'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}>
          {semesters.map((sem) => (
            <Link
              key={sem.id}
              to={`/specializations/${spec.id}/semesters/${sem.id}?cycle=${cycleId}`}
              className="p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-center hover:border-blue-900 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center font-bold text-lg text-slate-800 dark:text-zinc-200 mx-auto group-hover:bg-blue-900 dark:group-hover:bg-blue-600 group-hover:text-white transition shadow-xs">
                {sem.id}
              </div>
              <h3 className="font-bold text-base mt-4 text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">
                {sem.name}
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{sem.period}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
