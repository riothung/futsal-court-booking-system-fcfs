import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { fetcher } from "../../../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetcher<{ message: string; data: User[] }>("/auth/getAllUsers");
      setUsers(res.data);
    } catch {
      setError("Failed to load users");
    }
  }

  function openEdit(user: User) {
    setEditing(user);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPhone(user.phone_number);
    setFormRole(user.role);
    setError("");
  }

  async function handleSave() {
    if (!editing) return;
    setError("");
    try {
      await fetcher("/auth/updateUser", {
        method: "PUT",
        body: JSON.stringify({
          id: editing.id,
          username: formUsername,
          email: formEmail,
          phone_number: formPhone,
          role: formRole,
        }),
      });
      setEditing(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  }

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This will also delete their bookings.`)) return;
    setError("");
    try {
      await fetcher("/auth/deleteUser", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Users" />

      {error && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Daftar User</h3>

        {editing && (
          <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
            <h4 className="font-medium mb-3 dark:text-white">Edit User: {editing.username}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Save
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">No</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Username</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Phone</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Role</th>
                <th className="text-right py-3 px-2 text-sm font-medium dark:text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="border-b dark:border-gray-800">
                  <td className="py-3 px-2 text-sm dark:text-gray-400">{i + 1}</td>
                  <td className="py-3 px-2 text-sm dark:text-white">{u.username}</td>
                  <td className="py-3 px-2 text-sm dark:text-gray-300">{u.email}</td>
                  <td className="py-3 px-2 text-sm dark:text-gray-300">{u.phone_number}</td>
                  <td className="py-3 px-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-right">
                    <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(u.id, u.username)} className="text-red-600 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Belum ada user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
