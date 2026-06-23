import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUsers,
  updateUserRole,
  getCurrentUser,
  logoutUser,
} from '../data/mockData';

// French role labels for display
const roleLabels = {
  admin: 'Administrateur',
  teacher: 'Enseignant',
  student: 'Étudiant',
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser] = useState(() => getCurrentUser());

  // Load users
  const loadUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [currentUser, navigate]);

  const handleRoleChange = (username, newRole) => {
    updateUserRole(username, newRole);
    loadUsers();
  };

  const handleLogout = () => {
    logoutUser();
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
            {users.map((user) => (
              <tr key={user.username} className="border-b border-slate-200 dark:border-zinc-700/60">
                <td className="px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-zinc-400">{user.specialization}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-zinc-400">{user.level}</td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.username, e.target.value)}
                    className="rounded border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 p-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">{roleLabels.student}</option>
                    <option value="teacher">{roleLabels.teacher}</option>
                    <option value="admin">{roleLabels.admin}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
