import { useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string;
  pricePerHour: number;
}

export const BookingModal = ({ isOpen, onClose, courtName, pricePerHour }: BookingModalProps) => {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(1);

  const total = pricePerHour * hours;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 dark:text-white rounded-2xl p-6 w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold">Booking {courtName}</h2>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium">
              Booking Date
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 border rounded-lg p-2" />
          </div>

          {/* Hours */}
          <div>
            <label htmlFor="hours" className="block text-sm font-medium">
              Hours
            </label>
            <input type="number" min={1} value={hours} onChange={(e) => setHours(Number(e.target.value))} />

            {/* Total */}
            <div className="text-lg font-semibold text-green-600">Total: Rp {total.toLocaleString("id-ID")}</div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border-2 rounded-lg py-2">
                Cancel
              </button>

              <button
                onClick={() => {
                  alert("Booking Success!");
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
