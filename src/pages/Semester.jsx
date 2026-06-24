import { useState, useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  getSemesterById,
  getSpecializationById,
  getSubjectsForSemester,
  getCurrentUser,
  addSubject,
  updateSubjectName,
  deleteSubject,
} from '../data/mockData';

export default function Semester() {
  const { specId, semesterId } = useParams();
  const spec = getSpecializationById(specId);
  const semester = getSemesterById(semesterId);

  const [currentUser] = useState(() => getCurrentUser());
  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    if (spec && semester) {
      setSubjectsList(getSubjectsForSemester(specId, semesterId));
    }
  }, [specId, semesterId, spec, semester]);

  if (!spec || !semester) return <Navigate to="/" replace />;

  const handleAddSubject = () => {
    const name = window.prompt("Nom du nouveau module :");
    if (!name || !name.trim()) return;

    const cleanId = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = cleanId || `module-${Date.now()}`;

    if (subjectsList.some(s => s.id === id)) {
      alert("Un module avec un identifiant similaire existe déjà.");
      return;
    }

    addSubject(specId, semesterId, id, name.trim());
    setSubjectsList(getSubjectsForSemester(specId, semesterId));
  };

  const handleEditSubject = (e, subjectId, currentName) => {
    e.preventDefault();
    e.stopPropagation();
    const newName = window.prompt("Nouveau nom du module :", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;

    updateSubjectName(specId, semesterId, subjectId, newName.trim());
    setSubjectsList(getSubjectsForSemester(specId, semesterId));
  };

  const handleDeleteSubject = (e, subjectId, subjectName) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le module "${subjectName}" ?\n` +
      `Cela effacera définitivement tous les fichiers téléversés et les discussions du forum associés.`
    );
    if (!confirmDelete) return;

    deleteSubject(specId, semesterId, subjectId);
    setSubjectsList(getSubjectsForSemester(specId, semesterId));
  };

  return (
    <div className="space-y-6 px-2 py-4">
      {/* Header card */}
      <section className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{semester.name}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Spécialité: {spec.name}</p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={handleAddSubject}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Ajouter un module
          </button>
        )}
      </section>

      {/* Modules listing */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Modules d'études</h2>
        {subjectsList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm">
            Aucun module répertorié pour ce semestre.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectsList.map((sub) => (
              <div
                key={sub.id}
                className="p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-xl flex items-center justify-between hover:shadow-sm hover:border-slate-300 dark:hover:border-zinc-600 transition group"
              >
                <Link
                  to={`/specializations/${spec.id}/semesters/${semester.id}/subjects/${sub.id}`}
                  className="flex items-center space-x-3 flex-1 min-w-0"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-900 dark:bg-blue-500 flex-shrink-0"></div>
                  <h3 className="font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition truncate text-sm">
                    {sub.name}
                  </h3>
                </Link>

                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  {currentUser?.role === 'admin' ? (
                    <>
                      <button
                        onClick={(e) => handleEditSubject(e, sub.id, sub.name)}
                        className="p-1.5 text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition cursor-pointer"
                        title="Modifier le nom"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubject(e, sub.id, sub.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Supprimer le module"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </>
                  ) : (
                    <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
