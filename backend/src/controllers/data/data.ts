import { Request, Response } from "express";
import prisma from "../../db";
import { AuthRequest } from "../../middleware/authMiddleware";

export const createCourt = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user && req.user.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const { court_name, price_per_hour } = req.body;
    if (!court_name || !price_per_hour) {
      return res.status(400).json({ message: "court_name and price_per_hour are required!" });
    }

    const court = await prisma.court.create({ data: { court_name, price_per_hour } });
    return res.status(201).json({ message: "Court created successfully!", data: court });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const getCourts = async (req: Request, res: Response) => {
  try {
    const courts = await prisma.court.findMany({ orderBy: { created_at: "desc" } });
    return res.status(200).json({ message: "Success", data: courts });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const updateCourt = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const { id, court_name, price_per_hour } = req.body;
    if (!id) return res.status(400).json({ message: "id is required!" });

    const existing = await prisma.court.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Court not found!" });

    const updated = await prisma.court.update({
      where: { id },
      data: { ...(court_name && { court_name }), ...(price_per_hour && { price_per_hour }) },
    });

    return res.status(200).json({ message: "Court updated successfully!", data: updated });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const deleteCourt = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id is required!" });

    const existing = await prisma.court.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Court not found!" });

    await prisma.court.delete({ where: { id } });
    return res.status(200).json({ message: "Court deleted successfully!" });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};
