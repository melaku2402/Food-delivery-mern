import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    // Always stored lowercase, so "Sam@Mail.com" and "sam@mail.com" are one account.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // select: false keeps the hash out of every query unless a query asks for it
    // (the login code does, with .select("+password")).
    password: { type: String, required: true, select: false },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;