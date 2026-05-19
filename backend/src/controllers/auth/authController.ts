import { Request, Response } from "express";
import prisma from "../../db";
const jwt = require("jsonwebtoken");
import { AuthRequest } from "../../middleware/authMiddleware";

interface AuthBody {
  phone_number: string;
  email: string;
  username: string;
  password: string;
}

export const registerUser = async (req: Request<{}, {}, AuthBody>, res: Response) => {
  const { phone_number, email, username, password } = req.body;

  if (!phone_number || !email || !username || !password) return res.status(400).json({ message: "These fields are required!" });

  const emailExist = await prisma.user.findUnique({ where: { email } });
  if (emailExist) return res.status(400).json({ message: "Email already exist!" });

  try {
    const register = await prisma.user.create({
      data: { phone_number, email, username, password, role: "user" },
    });
    return res.status(200).json({ message: "Account created successfully!", data: register });
  } catch (err) {
    return res.status(400).json({ message: `Something error: ${err}` });
  }
};

export const login = async (req: Request<{}, {}, AuthBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "These fields are required!" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email doesn't exist!" });
    if (password != user.password) return res.status(400).json({ message: "Wrong password!" });

    const tokenPayload = { userId: user.id, userRole: user.role };
    const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET, { expiresIn: "1 day" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login success!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: `Login failed: ${err}` });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, username: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found!" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: `Error: ${err}` });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout success!" });
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, phone_number: true, role: true, created_at: true },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ message: "Success", data: users });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const { id, username, email, phone_number, role } = req.body;
    if (!id) return res.status(400).json({ message: "id is required!" });

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "User not found!" });

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(phone_number && { phone_number }),
        ...(role && { role }),
      },
      select: { id: true, username: true, email: true, phone_number: true, role: true },
    });

    return res.status(200).json({ message: "User updated successfully!", data: updated });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only!" });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id is required!" });

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "User not found!" });

    if (existing.id === req.user!.userId) {
      return res.status(400).json({ message: "Cannot delete yourself!" });
    }

    await prisma.bookings.deleteMany({ where: { id_user: id } });
    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (err) {
    return res.status(500).json({ message: `Internal server error: ${err}` });
  }
};
