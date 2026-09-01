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

export default mongoose.model("Threat", threatSchema);