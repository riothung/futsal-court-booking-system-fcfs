// import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
// import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
// import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";
import { FutsalBookingCard } from "../../components/cards/FutsalBookingCard";
import { BookingModal } from "../../components/modals/BookingModal";
import lapanganTanahMerah from "../../assets/images/lapangan-tanah-merah.jpg";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);

  const pricePerHour = 175000;

  const handleOpen = (courtName: string) => {
    setSelectedCourt(courtName);
    setIsOpen(true);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto p-6">
        <FutsalBookingCard image={lapanganTanahMerah} title="Lapangan Tanah Merah" price={175000} onBook={handleOpen}></FutsalBookingCard>
        {selectedCourt && <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} courtName={selectedCourt} pricePerHour={pricePerHour}></BookingModal>}
      </div>
    </>
  );
}
