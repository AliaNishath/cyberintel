import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { chat } from "../controllers/assistantController.js";

const router = express.Router();

router.post("/chat", requireAuth, chat);

export default router;