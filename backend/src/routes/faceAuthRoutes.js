import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  enrollFace,
  identifyFace,
  getFaceStatus,
  removeFace,
} from "../controllers/faceAuthController.js";

const router = express.Router();

// Zero-Email 1:N Facial Identification Login (Public)
router.post("/identify", identifyFace);

// Enrolled Face Profile Management (Protected)
router.post("/enroll", requireAuth, enrollFace);
router.get("/status", requireAuth, getFaceStatus);
router.delete("/remove", requireAuth, removeFace);

export default router;
