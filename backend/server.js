import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routers/foodRoute.js";
import userRouter from "./routers/userRouter.js";
import cartRoute from "./routers/cartRoute.js";
import { orderRouter } from "./routers/orderRoute.js";
import { getImage } from "./controllers/foodController.js";

// Login tokens can't be signed or checked without this, so stop right away.
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to backend/.env (or your host's environment variables).");
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn("JWT_SECRET is short. Use at least 32 random characters.");
}

const app = express();
const port = process.env.PORT || 4000;

// Restrict CORS to the known frontend origin in production.
// Falls back to allowing all origins only when FRONTEND_URL is not set (local dev).
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"]
  : true; // true = allow all (dev only)

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Render and Vercel put one proxy in front of the app. Without this, every visitor
// looks like the same IP and the login rate limit would block everyone together.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// middleware
app.use(express.json({ limit: "100kb" }));

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

// Bad JSON, a body that is too large, or any other error comes back as JSON
// (the frontend reads JSON), never as an HTML error page.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message:
      status === 413
        ? "That request is too large."
        : status < 500
          ? "Invalid request."
          : "Something went wrong. Please try again.",
  });
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});