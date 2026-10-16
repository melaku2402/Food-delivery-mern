import mongoose from "mongoose";

// Food images are stored in MongoDB so they survive redeploys
// (free hosts like Render wipe local files on every restart).
const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  contentType: { type: String, default: "image/png" },
  data: { type: Buffer, required: true },
});

const imageModel = mongoose.models.image || mongoose.model("image", imageSchema);
export default imageModel;
