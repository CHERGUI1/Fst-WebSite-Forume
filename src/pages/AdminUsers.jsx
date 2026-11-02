import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, getUsers, updateUserRole } from '../data/mockData';
import { getActiveProfile, signOutUser, getAllProfiles, updateProfileRole } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

// French role labels for display
const roleLabels = {
  admin: 'Administrateur',
  teacher: 'Enseignant',
  student: 'Étudiant',
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // userId being updated

  // Load users from Supabase or localStorage
  const loadUsers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const profiles = await getAllProfiles();
        setUsers(profiles);
      } else {
        setUsers(getUsers());
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      let user = getCurrentUser();
      if (isSupabaseConfigured) {
        const profile = await getActiveProfile();
        if (profile) user = profile;
      }
      setCurrentUser(user);

      if (!user || user.role !== 'admin') {
        navigate('/');
        return;
      }
      await loadUsers();
    };
    init();
  }, [navigate]);

  const handleRoleChange = async (userIdOrUsername, newRole) => {
    try {
      if (isSupabaseConfigured) {
        setUpdating(userIdOrUsername);
        await updateProfileRole(userIdOrUsername, newRole);
        await loadUsers();
      } else {
        updateUserRole(userIdOrUsername, newRole);
        setUsers(getUsers());
      }
    } catch (err) {
      console.error('Error updating role:', err);
      alert(`Erreur lors du changement de rôle: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await signOutUser();
    } else {
      logoutUser();
    }
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <section className="flex justify-between items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Gestion des comptes
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition"
        >
          Se déconnecter
        </button>
      </section>

      {/* Users table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 shadow-sm">
        {loading ? (
          <div className="text-center py-10 text-slate-400 dark:text-zinc-500">
            Chargement des utilisateurs...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-zinc-500">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-slate-50 dark:bg-zinc-900/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Nom d'utilisateur</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Spécialité</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Niveau</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-zinc-400">Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const key = isSupabaseConfigured ? user.id : user.username;
                const isUpdating = updating === key;
                return (
                  <tr key={key} className="border-b border-slate-200 dark:border-zinc-700/60">
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 font-medium">{user.username}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-zinc-400">{user.specialization}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-zinc-400">{user.level}</td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(key, e.target.value)}
                        disabled={isUpdating || (isSupabaseConfigured && user.id === currentUser?.id)}
                        className="rounded border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 p-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="student">{roleLabels.student}</option>
                        <option value="teacher">{roleLabels.teacher}</option>
                        <option value="admin">{roleLabels.admin}</option>
                      </select>
                      {isUpdating && (
                        <span className="ml-2 text-xs text-blue-500">...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
