import { useState } from "react";
import { fetcher } from "../../../services/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtId: number;
  courtName: string;
  pricePerHour: number;
}

export const BookingModal = ({ isOpen, onClose, courtId, courtName, pricePerHour }: BookingModalProps) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = pricePerHour * hours;

  const handleConfirm = async () => {
    setError("");

    if (!date || !startTime) {
      setError("Please select date and start time!");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

    setLoading(true);

    try {
      await fetcher("/data/createBooking", {
        method: "POST",
        body: JSON.stringify({
          id_court: courtId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }),
      });

      alert("Booking created! Waiting for admin confirmation.");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 dark:text-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Booking {courtName}</h2>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="date" className="block text-sm font-medium">
            Booking Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label htmlFor="hours" className="block text-sm font-medium">
            Duration (hours)
          </label>
          <input
            type="number"
            min={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full mt-1 border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="text-lg font-semibold text-green-600">
          Total: Rp {total.toLocaleString("id-ID")}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-2 rounded-lg py-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
