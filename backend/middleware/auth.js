import jwt from "jsonwebtoken";

// Accepts the standard "Authorization: Bearer <token>" header and the older
// "token" header that the frontend sends today.
const getToken = (req) => {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return typeof req.headers.token === "string" ? req.headers.token.trim() : "";
};

const reject = (res, code, message) =>
  res.status(401).json({ success: false, code, message });

const authMiddleware = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return reject(res, "NO_TOKEN", "Please log in to continue.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    req.userId = decoded.id;
    // The controllers read the user from req.body. It is set here, after the body
    // was parsed, so a client can never send a userId of their own.
    req.body = { ...(req.body ?? {}), userId: decoded.id };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return reject(res, "TOKEN_EXPIRED", "Your session expired. Please log in again.");
    }
    return reject(res, "TOKEN_INVALID", "Invalid session. Please log in again.");
  }
};

export default authMiddleware;