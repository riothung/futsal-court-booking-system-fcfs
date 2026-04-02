import { Request, Response } from "express";

const prisma = require("../../db");

export const createData = async (req: Request, res: Response) => {
  console.log("TYPE", typeof res.status);
  const data = [
    {
      phone_number: "081123456789",
      email: "user@gmail.com",
      password: "user",
      username: "user",
      role: "user",
    },
  ];

  try {
    const insertUserData = await prisma.user.create({ data: data });
    return res.status(200).json({
      insertedData: insertUserData,
      message: "Data inserted successfully",
    });
  } catch (err) {
    console.error("error message: ", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
