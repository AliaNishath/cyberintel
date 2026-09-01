import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getOverview,
  getBiometric,
  getAiThreat,
  getRisk,
  getMonitoring,
  getReports,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/overview", requireAuth, getOverview);
router.get("/biometric", requireAuth, getBiometric);
router.get("/ai-threat", requireAuth, getAiThreat);
router.get("/risk", requireAuth, getRisk);
router.get("/monitoring", requireAuth, getMonitoring);
router.get("/reports", requireAuth, getReports);

export default router;
