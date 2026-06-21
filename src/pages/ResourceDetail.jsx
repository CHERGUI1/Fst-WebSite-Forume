import { Link, Navigate, useParams } from 'react-router-dom';
import {
  getResourceByCategoryAndId,
  getSemesterById,
  getSpecializationById,
  getSubjectById,
  resourceCategoryLabels,
} from '../data/mockData';

export default function ResourceDetail() {
  const { specId, semesterId, subjectId, category, resourceId } = useParams();
  const spec = getSpecializationById(specId);
  const semester = getSemesterById(semesterId);
  const subject = getSubjectById(specId, semesterId, subjectId);
  const resource = getResourceByCategoryAndId(category, resourceId);

  if (!spec || !semester || !subject || !resource) return <Navigate to="/" replace />;

  const subjectPath = `/specializations/${spec.id}/semesters/${semester.id}/subjects/${subject.id}`;
  const categoryLabel = resourceCategoryLabels[category] || 'Ressource';
  const details = [
    { label: 'Type', value: categoryLabel },
    { label: 'Spécialité', value: spec.name },
    { label: 'Semestre', value: semester.name },
    { label: 'Module', value: subject.name },
    { label: 'Date', value: resource.date || 'Non précisée' },
    { label: 'Taille', value: resource.size || 'Non précisée' },
    { label: 'Format', value: resource.format || 'Document' },
    { label: 'Source', value: resource.author || resource.channel || 'Communauté UniShare' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <span className="inline-flex text-xs font-semibold px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300">
          {categoryLabel}
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{resource.title}</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Détails de la ressource sélectionnée.</p>
      </div>

      <section className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl divide-y divide-slate-100 dark:divide-zinc-700">
        {details.map((item) => (
          <div key={item.label} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-slate-500 dark:text-zinc-400">{item.label}</dt>
            <dd className="col-span-2 text-slate-800 dark:text-zinc-100">{item.value}</dd>
          </div>
        ))}
        {typeof resource.hasCorrection === 'boolean' && (
          <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-slate-500 dark:text-zinc-400">Correction</dt>
            <dd className="col-span-2 text-slate-800 dark:text-zinc-100">
              {resource.hasCorrection ? 'Disponible' : 'Non disponible'}
            </dd>
          </div>
        )}
        {resource.duration && (
          <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-slate-500 dark:text-zinc-400">Durée</dt>
            <dd className="col-span-2 text-slate-800 dark:text-zinc-100">{resource.duration}</dd>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to={subjectPath} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition text-sm font-medium">
          Retour au module
        </Link>
        <button className="px-4 py-2 rounded-lg bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition text-sm font-medium">
          Télécharger
        </button>
      </div>
    </div>
  );
}
