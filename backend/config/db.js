import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is missing. Add it to backend/.env (or your host's environment variables).");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};
