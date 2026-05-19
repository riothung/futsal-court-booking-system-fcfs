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
    let token: string | undefined;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: `Invalid token: ${err}` });
  }
};
