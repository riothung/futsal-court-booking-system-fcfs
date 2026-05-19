import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { getAllBookings, updateBookingStatus, Booking } from "../../../services/booking/booking.service";

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      setError("Failed to load bookings");
    }
  }

  async function handleStatus(id: number, status: string) {
    try {
      await updateBookingStatus({ id, status });
      loadBookings();
    } catch (err) {
      setError("Failed to update status");
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Bookings" />

      {error && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Semua Booking</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">No</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">User</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Lapangan</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Tanggal</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Jam</th>
                <th className="text-left py-3 px-2 text-sm font-medium dark:text-gray-300">Status</th>
                <th className="text-right py-3 px-2 text-sm font-medium dark:text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const start = new Date(b.start_time);
                const end = new Date(b.end_time);
                const dateStr = start.toLocaleDateString("id-ID");
                const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;

                return (
                  <tr key={b.id} className="border-b dark:border-gray-800">
                    <td className="py-3 px-2 text-sm dark:text-gray-400">{i + 1}</td>
                    <td className="py-3 px-2 text-sm dark:text-white">
                      {b.user?.username || "Unknown"}
                      <div className="text-xs text-gray-500">{b.user?.email}</div>
                    </td>
                    <td className="py-3 px-2 text-sm dark:text-gray-300">{b.court.court_name}</td>
                    <td className="py-3 px-2 text-sm dark:text-gray-300">{dateStr}</td>
                    <td className="py-3 px-2 text-sm dark:text-gray-300">{timeStr}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {b.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatus(b.id, "CONFIRMED")}
                            className="text-green-600 hover:underline mr-3"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatus(b.id, "CANCELLED")}
                            className="text-red-600 hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status !== "PENDING" && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    Belum ada booking
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
