import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    success: { type: Boolean, required: true },
    reason: { type: String }, // e.g. "wrong_password", "not_verified", "role_mismatch", "success"
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("LoginHistory", loginHistorySchema);