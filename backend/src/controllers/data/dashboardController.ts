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

    const paidBookings = await prisma.bookings.findMany({
      where: { status: { in: ["CONFIRMED", "DP"] } },
      include: { court: true },
    });

    const totalRevenue = paidBookings.reduce((sum, b) => {
      const hours = (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
      const fullPrice = Math.ceil(hours) * b.court.price_per_hour;
      if (b.payment_type === "DP" && b.down_payment) {
        return sum + b.down_payment;
      }
      return sum + fullPrice;
    }, 0);

    return res.status(200).json({
      message: "Success",
      data: {
        totalCourts,
        totalUsers,
        totalRevenue,
        totalBookings: paidBookings.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};
