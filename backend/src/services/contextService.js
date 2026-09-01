import User from "../models/user.js";
import Threat from "../models/Threat.js";
import LoginHistory from "../models/LoginHistory.js";

// This is the "R" in RAG (Retrieval-Augmented Generation). Instead of asking
// Gemini to guess about the user or the platform's state, we fetch real data
// from MongoDB first and hand it to the model as grounding context. Kept as
// its own small file so the retrieval logic is easy to extend later without
// touching the assistant controller or the dashboard controller.

// Same formula as dashboardController's calculateRiskScore — duplicated
// intentionally rather than imported, so this file has zero risk of breaking
// the dashboard if either one changes independently.
async function getOrgRiskScore() {
  try {
    const openThreats = await Threat.find({ status: "open" });
    const high = openThreats.filter((t) => t.severity === "high").length;
    const medium = openThreats.filter((t) => t.severity === "medium").length;
    const low = openThreats.filter((t) => t.severity === "low").length;
    const threatScore = Math.min(55, high * 15 + medium * 8 + low * 3);

    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const totalLogins = await LoginHistory.countDocuments({ createdAt: { $gte: since7d } });
    const failedLogins = await LoginHistory.countDocuments({ createdAt: { $gte: since7d }, success: false });
    const failRatio = totalLogins > 0 ? failedLogins / totalLogins : 0;
    const loginScore = Math.min(30, Math.round(failRatio * 75));

    return Math.max(0, Math.min(100, 12 + threatScore + loginScore));
  } catch {
    return null;
  }
}

// Builds a compact, real-data context block for the currently logged-in user.
// Kept short on purpose — the goal is grounding, not dumping the whole database.
export async function buildAssistantContext(reqUser) {
  const lines = [];

  try {
    if (reqUser?.id) {
      const account = await User.findById(reqUser.id).select("fullName email role isVerified createdAt");
      if (account) {
        lines.push(
          `Logged-in user: ${account.fullName} (${account.email}), role: ${account.role}, ` +
          `email verified: ${account.isVerified ? "yes" : "no"}, ` +
          `account created: ${account.createdAt.toDateString()}.`
        );
      }
    }

    const riskScore = await getOrgRiskScore();
    if (riskScore !== null) {
      lines.push(`Current organization risk score: ${riskScore}/100.`);
    }

    const openThreats = await Threat.find({ status: "open" }).sort({ createdAt: -1 }).limit(5);
    if (openThreats.length > 0) {
      lines.push(
        `Currently open threats (${openThreats.length} total, most recent up to 5 shown): ` +
        openThreats.map((t) => `"${t.title}" [${t.type}, ${t.severity} severity]`).join("; ") + "."
      );
    } else {
      lines.push("There are currently no open threats recorded.");
    }

    if (reqUser?.email) {
      const recentLogins = await LoginHistory.find({ email: reqUser.email.toLowerCase() })
        .sort({ createdAt: -1 })
        .limit(5);
      if (recentLogins.length > 0) {
        lines.push(
          `This user's last ${recentLogins.length} login attempts: ` +
          recentLogins.map((l) => (l.success ? "success" : `failed (${l.reason})`)).join(", ") + "."
        );
      }
    }
  } catch (err) {
    console.error("buildAssistantContext failed:", err.message);
  }

  return lines.join("\n");
}