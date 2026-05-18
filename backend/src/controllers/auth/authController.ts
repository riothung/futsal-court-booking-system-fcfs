import { Request, Response } from "express";
import prisma from "../../db";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { AuthRequest } from "../../middleware/authMiddleware";

interface RegisterRequestBody {
  phone_number: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

export const registerUser = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  const { phone_number, email, username, password } = req.body;

  if (!phone_number || !email || !username || !password) return res.status(400).json({ message: "These fields are required!" });

  const emailExist = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (emailExist) return res.status(400).json({ message: "Email already exist!" });

  try {
    const register = await prisma.user.create({
      data: {
        phone_number,
        email,
        username,
        password,
        role: "client",
      },
    });
    if (register) return res.status(200).json({ message: "Account created successfully!", data: register });
  } catch (err) {
    return res.status(400).json({
      message: `Something error: ${err}`,
    });
  }
};

export const login = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "These fields are required!" });

    if (email && password) {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) return res.status(400).json({ message: "Email doesn't exist!" });

      if (password != user.password) return res.status(400).json({ message: "Wrong password!" });

      const tokenPayload = {
        userId: user.id,
        userRole: user.role,
      };
      const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET, { expiresIn: "1 day" });
      return res.status(200).json({
        message: "Login success!",
        user: {
          role: user.role,
        },
      });
    }
  } catch (err) {
    return res.status(400).json({ message: `Login failed: ${err}` });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user!.userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user)
      return res.status(404).json({
        message: "User not found!",
      });

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({
      message: `Error: ${err}`,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");

  return res.status(200).json({
    message: "Logout success!",
  });
};
