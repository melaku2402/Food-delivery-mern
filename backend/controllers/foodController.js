import foodModel from "../models/foodModel.js";
import imageModel from "../models/imageModel.js";

// Add food item (image is kept in MongoDB)
const addFood = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file uploaded." });
  }

  const { name, description, price, category } = req.body;
  if (!name || !description || !price || !category) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ success: false, message: "Price must be a positive number." });
  }

  const image_filename = `${Date.now()}-${req.file.originalname.replace(/[^\w.\-]/g, "_")}`;

  try {
    await imageModel.create({
      filename: image_filename,
      contentType: req.file.mimetype,
      data: req.file.buffer,
    });

    await foodModel.create({
      name,
      description,
      price: parsedPrice,
      category,
      image: image_filename,
    });

    res.status(201).json({ success: true, message: "Food item added successfully.", filename: image_filename });
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ success: false, message: "Error adding food item." });
  }
};

// All food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({}).lean();
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("listFood error:", error);
    res.status(500).json({ success: false, message: "Error fetching food list." });
  }
};

// Remove food (and its image)
const removeFood = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: "Food ID is required." });
  }
  try {
    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found." });
    }
    await imageModel.deleteOne({ filename: food.image });
    await foodModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Food item removed successfully." });
  } catch (error) {
    console.error("removeFood error:", error);
    res.status(500).json({ success: false, message: "Error removing food item." });
  }
};

// Search food items (name or description, case-insensitive)
const searchFood = async (req, res) => {
  try {
    const query = String(req.body.query || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const food_list = await foodModel
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      })
      .lean();
    res.json({ success: true, data: food_list });
  } catch (error) {
    console.error("searchFood error:", error);
    res.status(500).json({ success: false, message: "Error searching food." });
  }
};

// Serve an image from MongoDB: GET /images/:filename
const getImage = async (req, res) => {
  try {
    const img = await imageModel.findOne({ filename: req.params.filename }).lean();
    if (!img) return res.status(404).send("Image not found");
    res.set("Content-Type", img.contentType);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(img.data);
  } catch (error) {
    console.error("getImage error:", error);
    res.status(500).send("Error serving image.");
  }
};

export { addFood, listFood, removeFood, searchFood, getImage };
