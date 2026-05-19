import { Router } from "express";
import * as auth from "../../controllers/auth/authController";
import * as authMiddleware from "../../middleware/authMiddleware";

const router = Router();

router.post("/register", auth.registerUser);
router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/me", authMiddleware.verifyToken, auth.getMe);

router.get("/getAllUsers", authMiddleware.verifyToken, auth.getAllUsers);
router.put("/updateUser", authMiddleware.verifyToken, auth.updateUser);
router.delete("/deleteUser", authMiddleware.verifyToken, auth.deleteUser);

export default router;
