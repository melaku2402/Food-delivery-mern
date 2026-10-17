import express from "express";
import rateLimit from "express-rate-limit";
import { loginUser, registerUser } from "../controllers/userController.js";

const userRouter = express.Router();

// Slows down password guessing and fake sign-ups. Counted per visitor IP
// (server.js sets "trust proxy" so this is the real IP on Render).
const limiter = ({ minutes, limit, message, ...rest }) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message },
    ...rest,
  });

// Only failed logins count, so a normal user is never blocked for logging in.
const loginLimiter = limiter({
  minutes: 15,
  limit: 20,
  message: "Too many login attempts. Please try again in 15 minutes.",
  skipSuccessfulRequests: true,
});

const registerLimiter = limiter({
  minutes: 60,
  limit: 20,
  message: "Too many sign-up attempts. Please try again later.",
});

userRouter.post("/register", registerLimiter, registerUser);
userRouter.post("/login", loginLimiter, loginUser);

export default userRouter;