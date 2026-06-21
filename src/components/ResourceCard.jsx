import { Link } from 'react-router-dom';

export default function ResourceCard({ title, date, size, type, hasCorrection, detailPath }) {
  return (
    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 hover:shadow-md transition group flex flex-col justify-between h-36">
      <div>
        <div className="flex items-start justify-between space-x-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 uppercase">
            {type}
          </span>
          {hasCorrection && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              + Corrigé
            </span>
          )}
        </div>
        <h4 className="font-medium text-sm text-slate-800 dark:text-zinc-100 mt-2 line-clamp-2 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">
          {title}
        </h4>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500 pt-2 border-t border-slate-100 dark:border-zinc-700/50">
        <span>{date} - {size}</span>
        <Link to={detailPath} className="text-blue-900 dark:text-blue-400 font-semibold hover:underline">
          Détails
        </Link>
      </div>
    </div>
  );
}
