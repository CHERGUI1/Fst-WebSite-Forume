import { Link, matchPath, useLocation } from 'react-router-dom';
import {
  getResourceByCategoryAndId,
  getSemesterById,
  getSpecializationById,
  getSubjectById,
  resourceCategoryLabels,
} from '../data/mockData';

const routePattern = '/specializations/:specId/semesters/:semesterId/subjects/:subjectId/resources/:category/:resourceId';
const subjectPattern = '/specializations/:specId/semesters/:semesterId/subjects/:subjectId';
const semesterPattern = '/specializations/:specId/semesters/:semesterId';
const specPattern = '/specializations/:specId';

function getRouteParams(pathname) {
  return (
    matchPath(routePattern, pathname)?.params ||
    matchPath(subjectPattern, pathname)?.params ||
    matchPath(semesterPattern, pathname)?.params ||
    matchPath(specPattern, pathname)?.params ||
    {}
  );
}

export default function Navigation() {
  const location = useLocation();
  const { specId, semesterId, subjectId, category, resourceId } = getRouteParams(location.pathname);

  if (location.pathname === '/') return null;

  const spec = getSpecializationById(specId);
  const semester = getSemesterById(semesterId);
  const subject = getSubjectById(specId, semesterId, subjectId);
  const resource = getResourceByCategoryAndId(category, resourceId);

  const paths = [
    spec && { label: spec.name, to: `/specializations/${spec.id}` },
    spec && semester && { label: semester.name, to: `/specializations/${spec.id}/semesters/${semester.id}` },
    spec && semester && subject && { label: subject.name, to: `/specializations/${spec.id}/semesters/${semester.id}/subjects/${subject.id}` },
    resource && { label: resourceCategoryLabels[category] || 'Ressource', to: location.pathname },
  ].filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm font-medium text-slate-500 dark:text-zinc-400 mb-6 overflow-x-auto whitespace-nowrap py-1">
      <Link to="/" className="hover:text-blue-900 dark:hover:text-blue-400 transition">
        Accueil
      </Link>
      {paths.map((path, idx) => {
        const isCurrent = idx === paths.length - 1;

        return (
          <div key={path.to} className="flex items-center space-x-2">
            <span>/</span>
            {isCurrent ? (
              <span className="text-slate-900 dark:text-white font-semibold">{path.label}</span>
            ) : (
              <Link to={path.to} className="hover:text-blue-900 dark:hover:text-blue-400 transition">
                {path.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
