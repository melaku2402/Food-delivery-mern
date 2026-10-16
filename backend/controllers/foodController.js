import foodModel from "../models/foodModel.js";
import imageModel from "../models/imageModel.js";

// Add food item (image is kept in MongoDB)
const addFood = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file uploaded." });
  }

  const image_filename = `${Date.now()}-${req.file.originalname.replace(/[^\w.\-]/g, "_")}`;

  try {
    await imageModel.create({
      filename: image_filename,
      contentType: req.file.mimetype,
      data: req.file.buffer,
    });

    await foodModel.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename,
    });

    res.json({ success: true, message: "Food item added successfully.", filename: image_filename });
  } catch (error) {
    console.error("Error adding food item:", error);
    res.json({ success: false, message: "Error adding food item." });
  }
};

// all food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food (and its image)
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }
    await imageModel.deleteOne({ filename: food.image });
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// search food item (name or description, case-insensitive)
const searchFood = async (req, res) => {
  try {
    const query = String(req.body.query || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const food_list = await foodModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    res.json({ success: true, data: food_list });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error searching food" });
  }
};

// serve an image from MongoDB: GET /images/:filename
const getImage = async (req, res) => {
  try {
    const img = await imageModel.findOne({ filename: req.params.filename });
    if (!img) return res.status(404).send("Image not found");
    res.set("Content-Type", img.contentType);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(img.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
};

export { addFood, listFood, removeFood, searchFood, getImage };
