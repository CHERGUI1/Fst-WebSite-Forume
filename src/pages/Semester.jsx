import { Link, Navigate, useParams } from 'react-router-dom';
import { getSemesterById, getSpecializationById, getSubjectsForSemester } from '../data/mockData';

export default function Semester() {
  const { specId, semesterId } = useParams();
  const spec = getSpecializationById(specId);
  const semester = getSemesterById(semesterId);
  const subjects = getSubjectsForSemester(specId, semesterId);

  if (!spec || !semester) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{semester.name}</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Spécialité: {spec.name}</p>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Aucun module répertorié pour ce semestre.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <Link
              key={sub.id}
              to={`/specializations/${spec.id}/semesters/${semester.id}/subjects/${sub.id}`}
              className="p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-between hover:shadow-sm cursor-pointer transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-900 dark:bg-blue-500"></div>
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">
                  {sub.name}
                </h3>
              </div>
              <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
