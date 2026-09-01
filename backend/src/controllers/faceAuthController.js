import User from "../models/user.js";
import LoginHistory from "../models/LoginHistory.js";
import { signToken } from "../utils/token.js";

function calculateEuclideanDistance(v1, v2) {
  if (!v1 || !v2 || v1.length !== v2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// POST /api/auth/face/enroll (Protected)
export async function enrollFace(req, res) {
  try {
    const { descriptor } = req.body;

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ message: "Invalid 128-D facial descriptor vector" });
    }

    const user = await User.findById(req.user.id).select("+faceDescriptor");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.faceDescriptor = descriptor;
    user.isFaceEnrolled = true;
    await user.save();

    res.json({
      message: "Face scan enrolled successfully! You can now use 1-click Face Sign-In.",
      isFaceEnrolled: true,
    });
  } catch (err) {
    console.error("Face enrollment error:", err);
    res.status(500).json({ message: "Failed to enroll face", error: err.message });
  }
}

// POST /api/auth/face/identify (Public — Zero-Email 1:N Identification)
export async function identifyFace(req, res) {
  try {
    const { descriptor } = req.body;

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ message: "Invalid 128-D facial descriptor vector" });
    }

    const enrolledUsers = await User.find({ isFaceEnrolled: true }).select("+faceDescriptor");

    if (!enrolledUsers || enrolledUsers.length === 0) {
      return res.status(404).json({
        message: "No enrolled face profiles found. Please sign in with your email and enroll your face in the dashboard first.",
      });
    }

    let bestUser = null;
    let minDistance = Infinity;

    for (const u of enrolledUsers) {
      if (u.faceDescriptor && u.faceDescriptor.length === 128) {
        const dist = calculateEuclideanDistance(descriptor, u.faceDescriptor);
        if (dist < minDistance) {
          minDistance = dist;
          bestUser = u;
        }
      }
    }

    const MATCH_THRESHOLD = 0.50;

    if (minDistance <= MATCH_THRESHOLD && bestUser) {
      if (bestUser.isBlocked) {
        return res.status(403).json({
          message: "This account has been blocked due to suspicious activity. Contact an admin to unblock it.",
        });
      }

      LoginHistory.create({
        user: bestUser._id,
        email: bestUser.email,
        success: true,
        reason: "face_biometric_login",
        ip: req.ip,
      }).catch((e) => console.error("Failed to log face login:", e.message));

      const confidence = Math.min(99, Math.max(78, Math.round((1 - minDistance / 0.65) * 100)));
      const token = signToken(bestUser);

      return res.json({
        message: `Face identified! Welcome back, ${bestUser.fullName}.`,
        token,
        confidence,
        distance: minDistance.toFixed(4),
        user: {
          id: bestUser._id,
          fullName: bestUser.fullName,
          email: bestUser.email,
          phone: bestUser.phone,
          role: bestUser.role,
          isFaceEnrolled: true,
        },
      });
    }

    return res.status(401).json({
      message: "Face not recognized. Please position your face clearly in good lighting, or sign in with your password.",
      distance: minDistance !== Infinity ? minDistance.toFixed(4) : null,
    });
  } catch (err) {
    console.error("Face identification error:", err);
    res.status(500).json({ message: "Face recognition processing failed", error: err.message });
  }
}

// GET /api/auth/face/status (Protected)
export async function getFaceStatus(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ isFaceEnrolled: !!user.isFaceEnrolled });
  } catch (err) {
    res.status(500).json({ message: "Failed to get face status", error: err.message });
  }
}

// DELETE /api/auth/face/remove (Protected)
export async function removeFace(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.faceDescriptor = undefined;
    user.isFaceEnrolled = false;
    await user.save();

    res.json({ message: "Enrolled face profile removed successfully", isFaceEnrolled: false });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove face profile", error: err.message });
  }
}
