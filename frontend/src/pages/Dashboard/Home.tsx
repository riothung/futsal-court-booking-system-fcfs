import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { fetcher } from "../../../services/api";

interface Stats {
  totalCourts: number;
  totalUsers: number;
  totalRevenue: number;
  totalBookings: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetcher<{ message: string; data: Stats }>("/data/getStats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Total Lapangan",
      value: stats?.totalCourts ?? 0,
      color: "bg-blue-500",
    },
    {
      label: "Total User",
      value: stats?.totalUsers ?? 0,
      color: "bg-green-500",
    },
    {
      label: "Booking Terkonfirmasi",
      value: stats?.totalBookings ?? 0,
      color: "bg-purple-500",
    },
    {
      label: "Total Pendapatan",
      value: `Rp ${(stats?.totalRevenue ?? 0).toLocaleString("id-ID")}`,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              <span className="text-white text-lg font-bold">
                {card.label === "Total Pendapatan" ? "Rp" : typeof card.value === "number" ? card.value : "0"}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-semibold dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
