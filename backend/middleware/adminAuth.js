import jwt from "jsonwebtoken";

// Admin requests send their token the same way normal users do,
// but the token payload carries role:"admin" (set at admin login time).
// The admin panel receives its token from POST /api/user/admin-login.

const reject = (res, code, message) =>
  res.status(401).json({ success: false, code, message });

const adminAuth = (req, res, next) => {
  const header = req.headers.authorization;
  let token = "";
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    token = header.slice(7).trim();
  } else if (typeof req.headers.token === "string") {
    token = req.headers.token.trim();
  }

  if (!token) {
    return reject(res, "NO_TOKEN", "Admin access required.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (decoded.role !== "admin") {
      return reject(res, "FORBIDDEN", "Admin access required.");
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return reject(res, "TOKEN_EXPIRED", "Admin session expired. Please log in again.");
    }
    return reject(res, "TOKEN_INVALID", "Invalid admin session.");
  }
};

export default adminAuth;

