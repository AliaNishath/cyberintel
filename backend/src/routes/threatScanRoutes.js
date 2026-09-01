import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { scanUrl, getScanHistory } from "../controllers/threatScanController.js";
import { getAllThreats, resolveThreat, reopenThreat, remediateThreat } from "../controllers/threatManagementController.js";

const router = express.Router();

router.post("/scan-url", requireAuth, scanUrl);
router.get("/scan-history", requireAuth, getScanHistory);
router.get("/all", requireAuth, getAllThreats);
router.patch("/:id/resolve", requireAuth, resolveThreat);
router.patch("/:id/reopen", requireAuth, reopenThreat);
router.post("/:id/remediate", requireAuth, remediateThreat);

export default router;