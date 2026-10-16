import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routers/foodRoute.js";
import userRouter from "./routers/userRouter.js";
import cartRoute from "./routers/cartRoute.js";
import { orderRouter } from "./routers/orderRoute.js";
import { getImage } from "./controllers/foodController.js";

const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// api end points
app.use("/api/food", foodRouter);
app.get("/images/:filename", getImage); // images come from MongoDB
app.use("/api/user", userRouter);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRouter);

// server checker
app.get("/", (req, res) => {
  res.send("Api Working");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
