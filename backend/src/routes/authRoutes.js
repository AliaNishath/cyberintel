import express from "express";
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  promoteUser,
  updateProfile,
  getAllUsers,
  unblockUser,
} from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getMe);
router.patch("/promote", requireAuth, promoteUser);
router.patch("/profile", requireAuth, updateProfile);
router.get("/users", requireAuth, getAllUsers);
router.patch("/unblock", requireAuth, unblockUser);

export default router;