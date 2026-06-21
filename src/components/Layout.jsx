import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getCurrentUser } from '../data/mockData';


const cycles = [
  { label: 'DEUST', to: '/cycles/deust' },
  { label: 'Licence', to: '/cycles/licence' },
  { label: 'Master', to: '/cycles/master' },
];

export default function Layout({ children }) {
  const [currentUser] = useState(() => getCurrentUser());

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('unishare-theme');

    if (savedTheme) return savedTheme === 'dark';

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('unishare-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 flex flex-col gap-3 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:py-0">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center space-x-3">
                <img src="/favicon.svg" alt="UniShare logo" className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-blue-600" />
                <span className="font-semibold text-lg tracking-tight text-blue-900 dark:text-white">UniShare</span>
              </Link>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="md:hidden px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition text-sm font-medium"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>

            <nav className="flex items-center gap-1 overflow-x-auto">
              {cycles.map((cycle) => (
                <NavLink
                  key={cycle.to}
                  to={cycle.to}
                  className={({ isActive }) => (
                    `px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-900 text-white dark:bg-blue-600'
                        : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-blue-900 dark:hover:text-white'
                    }`
                  )}
                >
                  {cycle.label}
                </NavLink>
              ))}
              <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-zinc-800" aria-hidden="true"></span>
              <NavLink
                to="/about"
                className={({ isActive }) => (
                  `px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-900 text-white dark:bg-blue-600'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-blue-900 dark:hover:text-white'
                  }`
                )}
              >
                À propos
              </NavLink>
              <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-zinc-800" aria-hidden="true"></span>
              {currentUser ? (
                <NavLink
                  to="/profile"
                  className={({ isActive }) => (
                    `px-3 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-900 text-white dark:bg-blue-600'
                        : 'text-blue-900 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-blue-900 dark:hover:text-white'
                    }`
                  )}
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[10px] font-bold text-blue-900 dark:text-blue-300">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </span>
                  {currentUser.username}
                </NavLink>
              ) : (
                <NavLink
                  to="/auth"
                  className={({ isActive }) => (
                    `px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-900 text-white dark:bg-blue-600'
                        : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-blue-900 dark:hover:text-white'
                    }`
                  )}
                >
                  Connexion
                </NavLink>
              )}
            </nav>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hidden md:inline-flex px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition text-sm font-medium"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
