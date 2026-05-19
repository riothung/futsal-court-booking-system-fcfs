import { useState, useEffect } from "react";
import { FutsalBookingCard } from "../../components/cards/FutsalBookingCard";
import { BookingModal } from "../../components/modals/BookingModal";
import lapanganTanahMerah from "../../assets/images/lapangan-tanah-merah.jpg";
import { getCourts, Court } from "../../../services/court/court.service";

export default function Booking() {
  const [courts, setCourts] = useState<Court[]>([]);

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
    <>
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
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          courtId={selectedCourt.id}
          courtName={selectedCourt.name}
          pricePerHour={selectedCourt.price}
        />
      )}
    </>
  );
}
