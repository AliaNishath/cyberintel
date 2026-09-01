import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "analyst", "hacker", "user"], default: "user" },

    // Set to true automatically when a real Brute Force threat is detected
    // on this account. Blocked accounts can't log in until an admin
    // unblocks them from the Admin Panel.
    isBlocked: { type: Boolean, default: false },

    // Email verification
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },

    // Password reset
    resetOtpCode: { type: String },
    resetOtpExpiresAt: { type: Date },

    // Real WebAuthn credential — this is what makes biometric login genuine
    // instead of a UI mockup. One credential per account (device platform
    // authenticator: Face ID / Touch ID / Windows Hello).
    webauthn: {
      credentialID: { type: String }, // base64url
      credentialPublicKey: { type: String }, // base64
      counter: { type: Number, default: 0 },
      transports: [{ type: String }],
    },
    // Temporary — holds the challenge between "options generated" and
    // "response verified" for both registration and login. Cleared after use.
    currentChallenge: { type: String },

    // In-browser AI Facial Recognition 128-D descriptor vector
    faceDescriptor: { type: [Number], select: false },
    isFaceEnrolled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);