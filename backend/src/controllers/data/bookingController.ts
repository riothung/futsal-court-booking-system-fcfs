import { Response } from "express";
import prisma from "../../db";
import { AuthRequest } from "../../middleware/authMiddleware";

const LOCK_DURATION_MINUTES = 15;
const OPENING_HOUR = 9;
const CLOSING_HOUR = 22;

async function releaseExpiredLocks() {
  await prisma.bookings.updateMany({
    where: {
      status: "LOCKED",
      lock_expires_at: { lt: new Date() },
    },
    data: { status: "CANCELLED" },
  });
}

export const getCourtSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const courtId = Number(req.query.courtId);
    const date = req.query.date as string;

    if (!courtId || !date) {
      return res.status(400).json({ message: "courtId and date are required!" });
    }

    await releaseExpiredLocks();

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const bookings = await prisma.bookings.findMany({
      where: {
        id_court: courtId,
        start_time: { gte: dayStart },
        end_time: { lte: dayEnd },
        status: { not: "CANCELLED" },
      },
      orderBy: { start_time: "asc" },
    });

    return res.status(200).json({ message: "Success", data: bookings });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id_court, start_time, end_time } = req.body;
    const id_user = req.user!.userId;

    if (!id_court || !start_time || !end_time) {
      return res.status(400).json({ message: "id_court, start_time, and end_time are required!" });
    }

    const court = await prisma.court.findUnique({ where: { id: id_court } });
    if (!court) return res.status(404).json({ message: "Court not found!" });

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) return res.status(400).json({ message: "start_time must be before end_time!" });

    const now = new Date();
    if (start <= now) {
      return res.status(400).json({ message: "start_time must be in the future!" });
    }

    const startHour = start.getHours();
    const endHour = end.getHours() + end.getMinutes() / 60;

    if (startHour < OPENING_HOUR || endHour > CLOSING_HOUR) {
      return res.status(400).json({ message: `Booking hours are ${OPENING_HOUR}:00 - ${CLOSING_HOUR}:00!` });
    }

    await releaseExpiredLocks();

    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.bookings.findFirst({
        where: {
          id_court,
          status: { not: "CANCELLED" },
          OR: [{ start_time: { lt: end }, end_time: { gt: start } }],
        },
      });

      if (existing) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      const lockExpires = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const totalPrice = Math.ceil(hours) * court.price_per_hour;

      return tx.bookings.create({
        data: {
          id_user,
          id_court,
          start_time: start,
          end_time: end,
          status: "LOCKED",
          lock_expires_at: lockExpires,
        },
        include: {
          court: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });
    });

    return res.status(201).json({
      message: "Booking created! Complete payment within 15 minutes.",
      data: {
        ...booking,
        total_price: Math.ceil((new Date(end_time).getTime() - new Date(start_time).getTime()) / (1000 * 60 * 60)) * court.price_per_hour,
        lock_duration_minutes: LOCK_DURATION_MINUTES,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_ALREADY_BOOKED") {
      return res.status(409).json({ message: "Slot already booked!" });
    }
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, payment_type } = req.body;
    const id_user = req.user!.userId;

    if (!booking_id || !payment_type) {
      return res.status(400).json({ message: "booking_id and payment_type are required!" });
    }

    if (!["DP", "FULL"].includes(payment_type)) {
      return res.status(400).json({ message: "payment_type must be DP or FULL!" });
    }

    const booking = await prisma.bookings.findUnique({
      where: { id: booking_id },
      include: { court: true },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    if (booking.id_user !== id_user && req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden!" });
    }
    if (booking.status !== "LOCKED") {
      return res.status(400).json({ message: "Booking is not in LOCKED state!" });
    }
    if (!booking.lock_expires_at || new Date() > booking.lock_expires_at) {
      await prisma.bookings.update({ where: { id: booking_id }, data: { status: "CANCELLED" } });
      return res.status(410).json({ message: "Lock expired! Please book again." });
    }

    const hours = (booking.end_time.getTime() - booking.start_time.getTime()) / (1000 * 60 * 60);
    const totalPrice = Math.ceil(hours) * booking.court.price_per_hour;

    const updateData: any = {
      payment_type,
      status: payment_type === "FULL" ? "CONFIRMED" : "DP",
    };

    if (payment_type === "DP") {
      updateData.down_payment = Math.floor(totalPrice / 2);
    }

    const updated = await prisma.bookings.update({
      where: { id: booking_id },
      data: updateData,
      include: {
        court: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });

    return res.status(200).json({ message: `Payment ${payment_type === "FULL" ? "confirmed" : "down payment recorded"}!`, data: updated });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const releaseExpiredLocksEndpoint = async (req: AuthRequest, res: Response) => {
  try {
    await releaseExpiredLocks();
    return res.status(200).json({ message: "Expired locks released!" });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const id_user = req.user!.userId;

    const bookings = await prisma.bookings.findMany({
      where: { id_user },
      include: { court: true },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ message: "Success", data: bookings });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const bookings = await prisma.bookings.findMany({
      include: {
        court: true,
        user: { select: { id: true, username: true, email: true, phone_number: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ message: "Success", data: bookings });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "id and status are required!" });
    }

    if (!["PENDING", "LOCKED", "DP", "CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status! Use PENDING, LOCKED, DP, CONFIRMED, or CANCELLED." });
    }

    const booking = await prisma.bookings.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: "Booking not found!" });

    const updated = await prisma.bookings.update({
      where: { id },
      data: { status },
      include: {
        court: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });

    return res.status(200).json({ message: "Booking status updated!", data: updated });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};
