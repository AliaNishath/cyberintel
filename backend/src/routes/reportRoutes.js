import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { downloadReportPdf, downloadActivityLog } from "../controllers/reportController.js";

const router = express.Router();

router.get("/download-pdf", requireAuth, downloadReportPdf);
router.get("/download-activity", requireAuth, downloadActivityLog);

export default router;