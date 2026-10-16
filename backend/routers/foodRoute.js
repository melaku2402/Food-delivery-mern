import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood, searchFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

// keep the upload in memory, then save it into MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/search", searchFood);

export default foodRouter;
