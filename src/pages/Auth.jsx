import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, mockSpecializations } from '../data/mockData';
import {
  requestPasswordReset,
  resendSignupConfirmation,
  signInUser,
  signUpUser,
  updatePassword,
} from '../lib/supabaseService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(() => (
    new URLSearchParams(window.location.search).get('mode') === 'recovery' ||
    window.location.hash.includes('type=recovery')
  ));
  const [confirmationPending, setConfirmationPending] = useState(false);

  // حقول الحساب
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [specialization, setSpecialization] = useState('genie-informatique');
  const [level, setLevel] = useState('S1');

  // تنبيهات الخطأ والنجاح
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
        setError('');
        setSuccess('Choisissez un nouveau mot de passe pour votre compte.');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRecovery) {
      if (password.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      if (password !== passwordConfirmation) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
    } else if (isLogin && (!email.trim() || !password.trim())) {
      setError('Veuillez remplir votre e-mail et mot de passe.');
      return;
    } else if (!isLogin && (!username.trim() || !email.trim() || !password.trim())) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    try {
      if (isRecovery) {
        await updatePassword(password);
        setIsRecovery(false);
        setPassword('');
        setPasswordConfirmation('');
        setSuccess('Mot de passe modifié. Vous pouvez maintenant vous connecter.');
        navigate('/auth', { replace: true });
      } else if (isLogin) {
        // تسجيل الدخول بالبريد الإلكتروني
        if (isSupabaseConfigured) {
          await signInUser(email, password);
        } else {
          loginUser(email, password);
        }

        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
          const origin = location.state?.from || '/profile';
          navigate(origin, { replace: true });
          window.location.reload(); // تحديث الهيدر
        }, 800);
      } else {
        // تسجيل حساب جديد
        if (isSupabaseConfigured) {
          const result = await signUpUser(username, password, specialization, level, email.trim());
          setConfirmationPending(result.requiresEmailConfirmation);
          setSuccess(result.requiresEmailConfirmation
            ? `Compte créé. Un lien de confirmation a été envoyé à ${email.trim()}. Vérifiez aussi le dossier spam.`
            : 'Compte créé avec succès. Vous pouvez maintenant vous connecter.');
        } else {
          registerUser(username, password, specialization, level);
          setConfirmationPending(false);
          setSuccess('Compte local créé. Les e-mails de confirmation ne sont pas disponibles en mode local.');
        }

        setIsLogin(true);
        setPassword('');
        setPasswordConfirmation('');
      }
    } catch (err) {
      console.error(err);
      if (err.message?.includes('Email not confirmed')) {
        setConfirmationPending(true);
        setError('Votre adresse e-mail n’est pas encore confirmée. Renvoyez le lien de confirmation ci-dessous.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Adresse e-mail ou mot de passe incorrect.');
      } else {
        setError(err.message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Saisissez votre adresse e-mail pour renvoyer le lien.');
      return;
    }

    setLoading(true);
    try {
      await resendSignupConfirmation(email);
      setSuccess(`Un nouveau lien de confirmation a été envoyé à ${email.trim()}.`);
    } catch (err) {
      setError(err.message || 'Impossible de renvoyer le lien de confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Saisissez votre adresse e-mail pour recevoir le lien de réinitialisation.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccess(`Si un compte correspond à cette adresse, un lien de réinitialisation a été envoyé à ${email.trim()}.`);
    } catch (err) {
      setError(err.message || 'Impossible d’envoyer le lien de réinitialisation.');
    } finally {
      setLoading(false);
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
            {isRecovery ? 'Réinitialiser le mot de passe' : isLogin ? 'Connexion à UniShare' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {isRecovery
              ? 'Choisissez un nouveau mot de passe pour votre compte.'
              : isLogin ? 'Accédez rapidement à vos ressources' : 'Rejoignez la communauté étudiante'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-xl text-center">
            Mode local : la confirmation et la récupération par e-mail ne sont pas disponibles.
          </div>
        )}

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
            {!isRecovery && (
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                  {isSupabaseConfigured ? 'Adresse e-mail' : 'Nom d’utilisateur (mode local)'}
                </label>
                <input
                  id="email"
                  type={isSupabaseConfigured ? 'email' : 'text'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSupabaseConfigured ? 'etudiant@univ.edu' : 'Ex: student'}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* اسم المستخدم — فقط عند إنشاء حساب جديد */}
            {!isLogin && !isRecovery && (
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: amino"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                {isRecovery ? 'Nouveau mot de passe' : 'Mot de passe'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isRecovery ? 'new-password' : isLogin ? 'current-password' : 'new-password'}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
              />
            </div>

            {isRecovery && (
              <div>
                <label htmlFor="password-confirmation" className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="password-confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600 focus:border-transparent transition text-slate-900 dark:text-white"
                />
              </div>
            )}

            {!isLogin && !isRecovery && (
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

          {isLogin && !isRecovery && isSupabaseConfigured && (
            <div className="flex flex-col items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handlePasswordResetRequest}
                disabled={loading}
                className="text-blue-900 dark:text-blue-400 font-semibold hover:underline disabled:opacity-60"
              >
                Mot de passe oublié ? Recevoir un lien de réinitialisation
              </button>
              {confirmationPending && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="text-blue-900 dark:text-blue-400 font-semibold hover:underline disabled:opacity-60"
                >
                  Renvoyer l’e-mail de confirmation
                </button>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-blue-900 dark:bg-blue-600 text-white font-semibold hover:bg-blue-800 dark:hover:bg-blue-500 transition shadow-sm hover:shadow-md text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Chargement en cours...'
                : isRecovery ? 'Enregistrer le nouveau mot de passe'
                  : isLogin ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>
        </form>

        {!isRecovery && (
        <div className="text-center pt-4 border-t border-slate-100 dark:border-zinc-700/50">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setConfirmationPending(false);
              setError('');
              setSuccess('');
            }}
            className="text-xs text-blue-900 dark:text-blue-400 font-semibold hover:underline"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà inscrit ? Se connecter'}
          </button>
        </div>
        )}

        {isRecovery && (
          <div className="text-center pt-4 border-t border-slate-100 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => {
                setIsRecovery(false);
                setError('');
                setSuccess('');
                navigate('/auth', { replace: true });
              }}
              className="text-xs text-blue-900 dark:text-blue-400 font-semibold hover:underline"
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
