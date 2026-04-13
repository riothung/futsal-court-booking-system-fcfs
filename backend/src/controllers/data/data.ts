import { Request, Response } from "express";

// const prisma = require("../../db");
import prisma from "../../db";

// insert data

export const createUser = async (req: Request, res: Response) => {
  const data = {
    phone_number: "081123456789",
    email: "user@gmail.com",
    password: "user",
    username: "user",
    role: "user",
  };
  try {
    const insertUserData = await prisma.user.create({ data: data });
    return res.status(200).json({
      message: "Data inserted successfully",
      insertedData: insertUserData,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Internal server error: ${err}`,
    });
  }
};

export const createCourt = async (req: Request, res: Response) => {
  const data = {
    court_name: "Lapangan Futsal Tanah Merah",
    price_per_hour: 75000,
  };

  try {
    const insertCourtData = await prisma.court.create({ data: data });
    return res.status(200).json({
      message: "Data inserted successfully",
      data: insertCourtData,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Internal server error: ${err}`,
    });
  }
};

// QUERY data
export const getCourts = async (req: Request, res: Response) => {
  try {
    const courts = await prisma.court.findMany();

    return res.status(200).json({
      message: "Success",
      data: courts,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Internal server error: ${err}`,
    });
  }
};
