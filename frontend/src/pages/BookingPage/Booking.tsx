import { useState, useEffect } from "react";
import { FutsalBookingCard } from "../../components/cards/FutsalBookingCard";
import { BookingModal } from "../../components/modals/BookingModal";
import lapanganTanahMerah from "../../assets/images/lapangan-tanah-merah.jpg";
import { getCourts, Court } from "../../../services/court/court.service";

export default function Booking() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    getCourts().then(setCourts);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<{ id: number; name: string; price: number } | null>(null);

  const handleOpen = (courtId: number, courtName: string, price: number) => {
    setSelectedCourt({ id: courtId, name: courtName, price });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto p-6 pb-0">
        <div className="flex items-center gap-4 mb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pilih Tanggal:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <p className="text-xs text-gray-400">Jam operasional: 09:00 - 22:00</p>
      </div>
      {courts.map((court) => (
        <div key={court.id} className="max-w-5xl mx-auto p-6">
          <FutsalBookingCard
            image={lapanganTanahMerah}
            title={court.court_name}
            price={court.price_per_hour}
            courtId={court.id}
            onBook={handleOpen}
          />
        </div>
      ))}
      {selectedCourt && (
        <BookingModal
          key={`${selectedCourt.id}-${selectedDate}`}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          courtId={selectedCourt.id}
          courtName={selectedCourt.name}
          pricePerHour={selectedCourt.price}
        />
      )}
    </div>
  );
}
