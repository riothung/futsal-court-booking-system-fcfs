import { useState, useEffect, useCallback } from "react";
import {
  getCourtSchedule,
  createBookingWithLock,
  confirmPayment,
  Booking,
  CreateBookingResponse,
} from "../../../services/booking/booking.service";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtId: number;
  courtName: string;
  pricePerHour: number;
}

const ALL_HOURS = Array.from({ length: 13 }, (_, i) => i + 9);
const DURATIONS = [1, 2, 3, 4];
const LOCK_MINUTES = 15;

function formatTime(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function getAvailableHours(today: string, date: string) {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  if (date !== today) return ALL_HOURS;
  return ALL_HOURS.filter((h) => h > currentHour);
}

function isSlotBooked(schedule: Booking[], startH: number, endH: number) {
  return schedule.some((b) => {
    const bs = new Date(b.start_time).getHours();
    const be = new Date(b.end_time).getHours();
    return bs < endH && be > startH;
  });
}

function getSlotStatus(schedule: Booking[], startH: number, endH: number) {
  const overlapping = schedule.filter((b) => {
    const bs = new Date(b.start_time).getHours();
    const be = new Date(b.end_time).getHours();
    return bs < endH && be > startH;
  });
  if (overlapping.length === 0) return "free";
  if (overlapping.some((b) => b.status === "LOCKED")) return "locked";
  if (overlapping.some((b) => b.status === "DP" || b.status === "CONFIRMED")) return "booked";
  return "booked";
}

export const BookingModal = ({ isOpen, onClose, courtId, courtName, pricePerHour }: BookingModalProps) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [step, setStep] = useState<"form" | "payment">("form");
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("");
  const [hours, setHours] = useState(1);
  const [schedule, setSchedule] = useState<Booking[]>([]);
  const [lockedBooking, setLockedBooking] = useState<CreateBookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSchedule = useCallback(async () => {
    if (!date) return;
    try {
      const data = await getCourtSchedule(courtId, date);
      setSchedule(data);
    } catch {
      setSchedule([]);
    }
  }, [courtId, date]);

  useEffect(() => {
    if (isOpen) {
      loadSchedule();
      setStep("form");
      setStartTime("");
      setHours(1);
      setLockedBooking(null);
      setError("");
    }
  }, [isOpen, loadSchedule]);

  const startHour = startTime ? Number(startTime) : 0;
  const endHour = startHour + hours;
  const validHours = endHour <= 22;
  const total = pricePerHour * hours;

  const checkAvailability = (sH: number, dur: number) => {
    const eH = sH + dur;
    return !isSlotBooked(schedule, sH, eH);
  };

  const handleSlotClick = (h: number) => {
    setStartTime(String(h));
  };

  const handleBook = async () => {
    setError("");

    if (!date || !startTime) {
      setError("Pilih tanggal dan jam mulai!");
      return;
    }
    if (startHour < 9) {
      setError("Jam booking mulai pukul 09:00!");
      return;
    }
    if (endHour > 22) {
      setError(`Lapangan tutup jam 22:00! Durasi maksimal untuk jam ${formatTime(startHour)} adalah ${String(22 - startHour)} jam.`);
      return;
    }
    if (!checkAvailability(startHour, hours)) {
      setError("Slot sudah dibooking! Pilih jam lain.");
      return;
    }

    const start = `${date}T${String(startHour).padStart(2, "0")}:00:00`;
    const end = `${date}T${String(endHour).padStart(2, "0")}:00:00`;

    setLoading(true);
    try {
      const result = await createBookingWithLock({
        id_court: courtId,
        start_time: start,
        end_time: end,
      });
      setLockedBooking(result);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking gagal!");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (type: "DP" | "FULL") => {
    if (!lockedBooking) return;
    setError("");
    setLoading(true);
    try {
      await confirmPayment({ booking_id: lockedBooking.id, payment_type: type });
      alert(type === "FULL" ? "Pembayaran penuh berhasil!" : "Uang muka 50% berhasil dibayar!");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pembayaran gagal!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900 dark:text-white">
        {step === "form" ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Lapangan {courtName}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            {error && (
              <div className="mb-3 p-3 text-sm text-red-600 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-6">
              <div className="w-[380px] shrink-0">
                <h3 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Jadwal &mdash;{" "}
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 text-sm font-semibold dark:text-white cursor-pointer"
                  />
                </h3>

                <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                  <div className="grid grid-cols-[80px_1fr] bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <div className="p-2 border-r dark:border-gray-700">Jam</div>
                    <div className="p-2">Status</div>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {ALL_HOURS.map((h) => {
                      const slotEnd = h + 1;
                      const status = getSlotStatus(schedule, h, slotEnd);
                      const isSelected = startHour === h;
                      const isPast = date === todayStr && h <= new Date().getHours() + new Date().getMinutes() / 60;
                      const clickable = status === "free" && !isPast;

                      let rowClass = "border-b dark:border-gray-700 transition-colors ";
                      if (isPast) {
                        rowClass += "bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed ";
                      } else if (isSelected) {
                        rowClass += "bg-blue-100 dark:bg-blue-900/40 cursor-pointer ";
                      } else if (status === "free") {
                        rowClass += "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ";
                      } else if (status === "locked") {
                        rowClass += "bg-yellow-50 dark:bg-yellow-900/20 cursor-not-allowed ";
                      } else {
                        rowClass += "bg-red-50 dark:bg-red-900/20 cursor-not-allowed ";
                      }

                      return (
                        <div
                          key={h}
                          className={rowClass}
                          onClick={() => clickable && handleSlotClick(h)}
                        >
                          <div className="grid grid-cols-[80px_1fr]">
                            <div className="p-2 text-sm border-r dark:border-gray-700">
                              {formatTime(h)} - {formatTime(slotEnd)}
                            </div>
                            <div className="p-2 text-sm flex items-center">
                              {isPast && (
                                <span className="text-gray-400 dark:text-gray-500 font-medium">Telah lewat</span>
                              )}
                              {!isPast && status === "free" && (
                                <span className="text-green-600 dark:text-green-400 font-medium">Tersedia</span>
                              )}
                              {!isPast && status === "locked" && (
                                <span className="text-yellow-600 dark:text-yellow-400 font-medium">Sedang diproses</span>
                              )}
                              {!isPast && status === "booked" && (
                                <span className="text-red-600 dark:text-red-400 font-medium">Terbooking</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Form Booking</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setStartTime(""); }}
                    className="w-full border rounded-lg p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">Pilih jam</option>
                    {getAvailableHours(todayStr, date).filter((h) => h + hours <= 22).map((h) => {
                      const available = checkAvailability(h, hours);
                      return (
                        <option key={h} value={h} disabled={!available}>
                          {formatTime(h)} {!available ? "(terbooking)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Durasi</label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full border rounded-lg p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} jam
                      </option>
                    ))}
                  </select>
                </div>

                {startTime && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(startHour)} - {formatTime(endHour)}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      Rp {total.toLocaleString("id-ID")}
                    </p>
                    {endHour > 22 && (
                      <p className="text-xs text-red-500 font-medium">
                        ⚠️ Lapangan tutup jam 22:00. Durasi maksimal untuk jam {formatTime(startHour)} adalah {String(22 - startHour)} jam.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 border-2 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleBook}
                    disabled={loading || !startTime || !validHours}
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Booking"}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Slot akan dikunci 15 menit setelah booking untuk pembayaran.
                </p>
              </div>
            </div>
          </>
        ) : lockedBooking ? (
          <PaymentView
            booking={lockedBooking}
            courtName={courtName}
            pricePerHour={pricePerHour}
            hours={hours}
            onPay={handlePayment}
            onClose={onClose}
            loading={loading}
            error={error}
          />
        ) : null}
      </div>
    </div>
  );
};

function PaymentView({
  booking,
  courtName,
  pricePerHour,
  hours,
  onPay,
  onClose,
  loading,
  error,
}: {
  booking: CreateBookingResponse;
  courtName: string;
  pricePerHour: number;
  hours: number;
  onPay: (type: "DP" | "FULL") => void;
  onClose: () => void;
  loading: boolean;
  error: string;
}) {
  const [remaining, setRemaining] = useState(LOCK_MINUTES * 60);
  const expired = remaining <= 0;
  const total = pricePerHour * hours;
  const dpAmount = Math.floor(total / 2);

  useEffect(() => {
    if (expired) return;
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expired]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = (remaining / (LOCK_MINUTES * 60)) * 100;

  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const dateStr = startDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = `${String(startDate.getHours()).padStart(2, "0")}:00 - ${String(endDate.getHours()).padStart(2, "0")}:00`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Konfirmasi Pembayaran</h2>
        {!expired && (
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke={remaining < 60 ? "#ef4444" : "#3b82f6"}
                  strokeWidth="3"
                  strokeDasharray={`${progress * 2.51} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {minutes}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {expired ? (
        <div className="text-center py-8 space-y-4">
          <div className="text-5xl">⏰</div>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">Waktu pembayaran habis!</p>
          <p className="text-sm text-gray-500">Slot sudah dibuka kembali untuk pengguna lain.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Lapangan {courtName}</p>
            <p className="font-semibold">{dateStr}</p>
            <p className="font-semibold">{timeStr}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Durasi: {hours} jam</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onPay("DP")}
              disabled={loading}
              className="w-full border-2 border-blue-600 text-blue-600 rounded-xl p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Bayar Uang Muka (DP 50%)</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lunasi sisa nanti di tempat</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Rp {dpAmount.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onPay("FULL")}
              disabled={loading}
              className="w-full bg-green-600 text-white rounded-xl p-4 text-left hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Bayar Lunas</p>
                  <p className="text-sm text-green-100">Langusng konfirmasi booking</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Rp {total.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
            >
              Batal
            </button>
          </div>
        </>
      )}
    </div>
  );
}
