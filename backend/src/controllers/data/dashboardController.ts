import { Response } from "express";
import prisma from "../../db";
import { AuthRequest } from "../../middleware/authMiddleware";

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const totalCourts = await prisma.court.count();
    const totalUsers = await prisma.user.count();

    const confirmedBookings = await prisma.bookings.findMany({
      where: { status: "CONFIRMED" },
      include: { court: true },
    });

    const totalRevenue = confirmedBookings.reduce((sum, b) => {
      const hours = (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
      return sum + Math.ceil(hours) * b.court.price_per_hour;
    }, 0);

    return res.status(200).json({
      message: "Success",
      data: {
        totalCourts,
        totalUsers,
        totalRevenue,
        totalBookings: confirmedBookings.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};
