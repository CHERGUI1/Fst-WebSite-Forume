import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../data/mockData';

const roleMap = {
  student: 'Étudiant',
  teacher: 'Enseignant',
  admin: 'Administrateur',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleChange = (username, newRole) => {
    updateUserRole(username, newRole);
    setUsers(getUsers());
  };

  return (
    <div className= max-w-4xl mx-auto p-6 space-y-6>
      <h2 className=text-2xl font-bold>Gestion des utilisateurs</h2>
      <table className=w-full border-collapse>
        <thead>
          <tr className=bg-gray-100 dark:bg-zinc-700>
            <th className=border p-2 text-left>Nom d'utilisateur</th>
            <th className=border p-2 text-left>Rôle</th>
            <th className=border p-2 text-left>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.username} className=border-t>
              <td className=border p-2>{u.username}</td>
              <td className=border p-2>{roleMap[u.role] || u.role}</td>
              <td className=border p-2>
                <select
                  value={u.role}
                  onChange={(e) => handleChange(u.username, e.target.value)}
                  className=border rounded p-1
                >
                  <option value=student>Étudiant</option>
                  <option value=teacher>Enseignant</option>
                  <option value=admin>Administrateur</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
