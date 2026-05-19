import { Response } from "express";
import prisma from "../../db";
import { AuthRequest } from "../../middleware/authMiddleware";

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

      return tx.bookings.create({
        data: { id_user, id_court, start_time: start, end_time: end, status: "PENDING" },
        include: {
          court: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });
    });

    return res.status(201).json({ message: "Booking created successfully!", data: booking });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_ALREADY_BOOKED") {
      return res.status(409).json({ message: "Slot already booked!" });
    }
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

    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status! Use PENDING, CONFIRMED, or CANCELLED." });
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
