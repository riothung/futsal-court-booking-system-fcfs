// const router = require("express").Router();
// const dataRouter = require("./data/index");
import { Request, Response } from "express";
import { Router } from "express";
import dataRouter from "./data/index";
import authRouter from "./auth/index";

const router = Router();

router.get("/testApi", (req: Request, res: Response) => {
  return res.json("Test API");
});

router.use("/data", dataRouter);
router.use("/auth", authRouter);

export default router;
