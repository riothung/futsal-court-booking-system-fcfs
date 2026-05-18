// const router = require("express").Router();
import { Router } from "express";
// const data = require("../../controllers/data/data");
import * as inputData from "../../controllers/data/data";

const router = Router();

// POST Method
//data
router.post("/createUser", inputData.createUser);
router.post("/createCourt", inputData.createCourt);

// END of POST Method

// GET Method
//data
router.get("/getCourt", inputData.getCourts);

export default router;
