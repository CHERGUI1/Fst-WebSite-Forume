import { Link, Navigate, useParams } from 'react-router-dom';
import { getSpecializationById, mockSemesters } from '../data/mockData';

export default function Specialization() {
  const { specId } = useParams();
  const spec = getSpecializationById(specId);

  if (!spec) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{spec.name}</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Sélectionnez un semestre pour voir les modules associés.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {mockSemesters.map((sem) => (
          <Link
            key={sem.id}
            to={`/specializations/${spec.id}/semesters/${sem.id}`}
            className="p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-center hover:border-blue-900 dark:hover:border-blue-500 hover:shadow-sm cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-zinc-700 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-200 mx-auto group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">
              {sem.id}
            </div>
            <h3 className="font-semibold text-sm mt-3 text-slate-800 dark:text-zinc-200">{sem.name}</h3>
            <p className="text-[10px] text-slate-400 mt-1">{sem.period}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
