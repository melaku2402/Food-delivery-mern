// Pushes the 32 starter food items + their images into MongoDB.
// Usage:  npm run seed          (adds missing items, safe to re-run)
//         npm run seed -- --reset   (wipes foods + images first)
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import foodModel from "../models/foodModel.js";
import imageModel from "../models/imageModel.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(here, "images");
const foods = JSON.parse(fs.readFileSync(path.join(here, "foods.json"), "utf8"));

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Put it in backend/.env first.");
  process.exit(1);
}

if (process.env.MONGO_URI.includes("<")) {
  console.error("MONGO_URI still has placeholders (<user>, <password>...). Paste your real Atlas connection string in backend/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
} catch (e) {
  console.error("Could not connect to MongoDB:", e.message);
  process.exit(1);
}
console.log("Connected to", mongoose.connection.name);

if (process.argv.includes("--reset")) {
  await foodModel.deleteMany({});
  await imageModel.deleteMany({});
  console.log("Cleared foods and images");
}

let added = 0;
for (const f of foods) {
  const file = path.join(imagesDir, f.image);
  if (!fs.existsSync(file)) {
    console.warn("Missing image file, skipped:", f.image);
    continue;
  }
  await imageModel.updateOne(
    { filename: f.image },
    { $set: { contentType: "image/png", data: fs.readFileSync(file) } },
    { upsert: true }
  );
  const res = await foodModel.updateOne({ name: f.name }, { $setOnInsert: f }, { upsert: true });
  if (res.upsertedCount) added++;
}

console.log(`Done. ${added} new food items added, ${await foodModel.countDocuments()} total, ${await imageModel.countDocuments()} images stored.`);
await mongoose.disconnect();
