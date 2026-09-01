import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes("your_mongodb_atlas_connection_string_here")) {
    console.warn(
      "\n⚠️  MONGO_URI is not set in .env — the server will start, but any" +
      " request that touches the database (signup, login, etc.) will fail." +
      " Add your MongoDB Atlas connection string to backend/.env to fix this.\n"
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
