import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, mockSpecializations } from '../data/mockData';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  // حقول الحساب
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('genie-informatique');
  const [level, setLevel] = useState('S1');

  // تنبيهات الخطأ والنجاح
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      if (isLogin) {
        // تسجيل الدخول
        loginUser(username, password);
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
          // الانتقال للصفحة التي طلبها أو للملف الشخصي
          const origin = location.state?.from || '/profile';
          navigate(origin, { replace: true });
          window.location.reload(); // تحديث الهيدر
        }, 1000);
      } else {
        // تسجيل حساب جديد
        registerUser(username, password, specialization, level);
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* خلفية جمالية متوهجة */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-900/10 dark:bg-blue-600/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-3xl p-8 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-sm">
            U
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            {isLogin ? 'Connexion à UniShare' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {isLogin ? 'Accédez rapidement à vos ressources' : 'Rejoignez la communauté étudiante'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl text-center">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: student1"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
              />
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="specialization" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Spécialité
                    </label>
                    <select
                      id="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
                    >
                      {mockSpecializations.map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Semestre / Niveau
                    </label>
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
                    >
                      {semesters.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-5 py-3 rounded-xl bg-blue-900 dark:bg-blue-600 text-white font-semibold hover:bg-blue-800 dark:hover:bg-blue-500 transition shadow-sm hover:shadow-md text-sm cursor-pointer"
            >
              {isLogin ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 dark:border-zinc-700/50">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-xs text-blue-900 dark:text-blue-400 font-semibold hover:underline"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà inscrit ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
