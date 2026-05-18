import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

interface JwtPayload {
  userId: number;
  userRole: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({
        message: "Unauthorized!",
      });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verifyToken(token, process.env.TOKEN_SECRET as string) as JwtPayload;

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: `Invalid token: ${err}`,
    });
  }
};
