import { Router } from "express";
import * as inputData from "../../controllers/data/data";
import * as bookingController from "../../controllers/data/bookingController";
import * as dashboardController from "../../controllers/data/dashboardController";
import * as authMiddleware from "../../middleware/authMiddleware";

const router = Router();

router.post("/createCourt", authMiddleware.verifyToken, inputData.createCourt);
router.post("/createBooking", authMiddleware.verifyToken, bookingController.createBooking);
router.put("/updateCourt", authMiddleware.verifyToken, inputData.updateCourt);
router.put("/updateBookingStatus", authMiddleware.verifyToken, bookingController.updateBookingStatus);
router.delete("/deleteCourt", authMiddleware.verifyToken, inputData.deleteCourt);

router.get("/getCourt", inputData.getCourts);
router.get("/getMyBookings", authMiddleware.verifyToken, bookingController.getMyBookings);
router.get("/getAllBookings", authMiddleware.verifyToken, bookingController.getAllBookings);
router.get("/getStats", authMiddleware.verifyToken, dashboardController.getStats);

export default router;
