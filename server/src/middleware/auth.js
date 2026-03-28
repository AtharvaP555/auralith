const { verifyAccessToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return sendError(res, "Admin access required", 403);
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
