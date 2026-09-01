import mongoose from "mongoose";

const threatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Brute Force", "Unauthorized Access", "Suspicious Login", "Account Lockout", "Malicious URL"],
      required: true,
    },
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    title: { type: String, required: true },
    description: { type: String },
    relatedEmail: { type: String },
    scannedUrl: { type: String },
    riskScore: { type: Number },
    reasons: [{ type: String }],
    status: { type: String, enum: ["open", "resolved"], default: "open" },
  },
  { timestamps: true }
);

threatSchema.post("save", async function (doc) {
  try {
    const { notifyAdminsOfThreat } = await import("../utils/email.js");
    await notifyAdminsOfThreat(doc);
  } catch (err) {
    console.error("Threat post-save hook notification error:", err.message);
  }
});

export default mongoose.model("Threat", threatSchema);