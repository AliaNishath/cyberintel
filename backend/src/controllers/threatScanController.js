import Threat from "../models/Threat.js";
import User from "../models/user.js";
import { heuristicScan, safeBrowsingCheck } from "../utils/urlScanner.js";
import { sendThreatAlertEmail } from "../utils/email.js";

// POST /api/threats/scan-url   { url }
// This is the "Suspicious Web Threat Detection" module — an enhancement on
// top of the original mini-project. Every scan runs a real heuristic check;
// if a Google Safe Browsing API key is ever added, that real threat-intel
// lookup runs too and its result takes priority.
export async function scanUrl(req, res) {
  try {
    const { url } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ message: "A URL is required" });
    }

    const heuristic = heuristicScan(url.trim());
    const safeBrowsingHit = await safeBrowsingCheck(url.trim());

    let verdict = heuristic.verdict;
    let score = heuristic.score;
    const reasons = [...heuristic.reasons];

    if (safeBrowsingHit === true) {
      verdict = "malicious";
      score = 100;
      reasons.unshift("Flagged by Google Safe Browsing as a known threat");
    } else if (safeBrowsingHit === false) {
      reasons.push("Not found in Google Safe Browsing's known threat database");
    }

    let threatCreated = false;
    if (verdict !== "safe") {
      const threat = await Threat.create({
        type: "Malicious URL",
        severity: verdict === "malicious" ? "high" : "medium",
        title: `${verdict === "malicious" ? "Malicious" : "Suspicious"} URL scanned: ${heuristic.hostname || url}`,
        description: reasons.join("; "),
        relatedEmail: req.user?.email,
        scannedUrl: url.trim(),
        riskScore: score,
        reasons,
      });
      threatCreated = true;

      // Only alert admins for confirmed-malicious hits, not every "suspicious"
      // one — otherwise inboxes fill up fast.
      if (verdict === "malicious") {
        try {
          const admins = await User.find({ role: "admin" }).select("email");
          await Promise.all(admins.map((a) => sendThreatAlertEmail(a.email, threat)));
        } catch (err) {
          console.error("Failed to notify admins:", err.message);
        }
      }
    }

    res.json({ url: url.trim(), verdict, score, reasons, threatCreated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Scan failed", error: err.message });
  }
}

// GET /api/threats/scan-history
export async function getScanHistory(req, res) {
  try {
    const userEmail = req.user?.email;
    const isAdmin = req.user?.role === "admin";
    const filter = { type: "Malicious URL" };

    // Regular users only see their own scans; Admins see all scans across the organization
    if (!isAdmin && userEmail) {
      filter.relatedEmail = userEmail;
    }

    const scans = await Threat.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({
      scans: scans.map((s) => ({
        url: s.scannedUrl,
        verdict: s.severity === "high" ? "malicious" : "suspicious",
        score: s.riskScore,
        reasons: s.reasons,
        scannedAt: s.createdAt,
        userEmail: s.relatedEmail || "System",
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load scan history", error: err.message });
  }
}