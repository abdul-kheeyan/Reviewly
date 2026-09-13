import { Router } from "express";
import { register, login, refreshTokenHandler, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Removed duplicate root register route; use /register instead
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshTokenHandler);
router.get("/me", requireAuth, getMe);

export default router;

