import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood, searchFood } from "../controllers/foodController.js";
import adminAuth from "../middleware/adminAuth.js";

const foodRouter = express.Router();

// keep the upload in memory, then save it into MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

// Public routes
foodRouter.get("/list", listFood);
foodRouter.post("/search", searchFood);

// Admin-only routes
foodRouter.post("/add", adminAuth, upload.single("image"), addFood);
foodRouter.post("/remove", adminAuth, removeFood);

export default foodRouter;
