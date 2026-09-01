import express from "express";
import {
  getBreachWebsites,
  checkAccountBreach,
  checkPwnedPassword,
  scanSecurityHeaders,
  lookupIpThreat,
} from "../controllers/cyberToolsController.js";

const router = express.Router();

// Public / Authenticated Security Intelligence Tools
router.get("/breach-websites", getBreachWebsites);
router.post("/check-breach", checkAccountBreach);
router.post("/check-pwned-password", checkPwnedPassword);
router.post("/scan-headers", scanSecurityHeaders);
router.post("/lookup-ip", lookupIpThreat);

export default router;
