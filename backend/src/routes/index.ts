// const router = require("express").Router();
// const dataRouter = require("./data/index");
import { Request, Response } from "express";
import { Router } from "express";
import dataRouter from "./data/index";

const router = Router();

router.get("/testApi", (req: Request, res: Response) => {
  return res.json("Test API");
});

router.use("/data", dataRouter);

export default router;
