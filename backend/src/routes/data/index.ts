// const router = require("express").Router();
import { Router } from "express";
// const data = require("../../controllers/data/data");
import * as inputData from "../../controllers/data/data";

const router = Router();

// POST Method
router.post("/createUser", inputData.createUser);
router.post("/createCourt", inputData.createCourt);

// GET Method
router.get("/getCourt", inputData.getCourts);
export default router;
