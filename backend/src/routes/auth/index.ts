import { Router } from "express";
import * as auth from "../../controllers/auth/authController";
import * as authMiddleware from "../../middleware/authMiddleware";

const router = Router();

// POST Method
router.post("/register", auth.registerUser);
router.post("/login", auth.login);
router.post("/logout", auth.logout);
// end of POST Method

// GET Method
router.get("/me", authMiddleware.verifyToken, auth.getMe);
// end of GET Method
export default router;
