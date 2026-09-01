// Fix: Node.js's c-ares DNS resolver can't do SRV lookups on some
// networks (e.g. campus/corporate DNS). Switch to Google Public DNS
// so the mongodb+srv:// connection string resolves correctly.
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import assistantRoutes from "./src/routes/assistantRoutes.js";
import threatScanRoutes from "./src/routes/threatScanRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import webauthnRoutes from "./src/routes/webauthnRoutes.js";
import cyberToolsRoutes from "./src/routes/cyberToolsRoutes.js";
import faceAuthRoutes from "./src/routes/faceAuthRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL === "*"
    ? true
    : process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CyberIntel backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth/face", faceAuthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/threats", threatScanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/webauthn", webauthnRoutes);
app.use("/api/tools", cyberToolsRoutes);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CyberIntel backend running on http://localhost:${PORT}`);
  });
});