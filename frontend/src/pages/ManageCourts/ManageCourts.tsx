import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { getCourts, createCourt, updateCourt, deleteCourt, Court } from "../../../services/court/court.service";

export default function ManageCourts() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Court | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourts();
  }, []);

  async function loadCourts() {
    try {
      const data = await getCourts();
      setCourts(data);
    } catch (err) {
      setError("Failed to load courts");
    }
  }

  function openAdd() {
    setEditing(null);
    setFormName("");
    setFormPrice("");
    setShowForm(true);
    setError("");
  }

  function openEdit(court: Court) {
    setEditing(court);
    setFormName(court.court_name);
    setFormPrice(court.price_per_hour.toString());
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    setError("");
    if (!formName.trim() || !formPrice.trim()) {
      setError("All fields are required!");
      return;
    }
    try {
      if (editing) {
        await updateCourt({ id: editing.id, court_name: formName, price_per_hour: Number(formPrice) });
      } else {
        await createCourt({ court_name: formName, price_per_hour: Number(formPrice) });
      }
      setShowForm(false);
      loadCourts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save court");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this court?")) return;
    try {
      await deleteCourt(id);
      loadCourts();
    } catch (err) {
      setError("Failed to delete court");
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Courts" />

      {error && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Daftar Lapangan</h3>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + Tambah Lapangan
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
            <h4 className="font-medium mb-3 dark:text-white">{editing ? "Edit Lapangan" : "Tambah Lapangan"}</h4>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm mb-1 dark:text-gray-300">Nama Lapangan</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 dark:text-gray-300">Harga per Jam (Rp)</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  {editing ? "Update" : "Simpan"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm">
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">No</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Nama Lapangan</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Harga/Jam</th>
                <th className="text-right py-3 px-2 text-sm font-medium dark:text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {courts.map((court, i) => (
                <tr key={court.id} className="border-b dark:border-gray-800">
                  <td className="py-3 px-2 text-sm dark:text-gray-400">{i + 1}</td>
                  <td className="py-3 px-2 text-sm dark:text-white">{court.court_name}</td>
                  <td className="py-3 px-2 text-sm dark:text-gray-300">
                    Rp {court.price_per_hour.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-2 text-sm text-right">
                    <button onClick={() => openEdit(court)} className="text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(court.id)} className="text-red-600 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {courts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Belum ada lapangan
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
