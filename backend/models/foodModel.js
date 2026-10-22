import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true, trim: true, index: true },
});

// Speed up category-filtered queries (menu page, search)
foodSchema.index({ category: 1 });
foodSchema.index({ name: "text", description: "text" }); // enables fast text search

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;
