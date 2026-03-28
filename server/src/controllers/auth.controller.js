const bcrypt = require("bcryptjs");
const sql = require("../utils/prisma");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await sql`SELECT id FROM "User" WHERE email = ${email}`;
    if (existing.length > 0) {
      return sendError(res, "Email already in use", 409);
    }

    const hashed = await bcrypt.hash(password, 12);

    const users = await sql`
      INSERT INTO "User" (id, email, password, name, role, "isVerified", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${email}, ${hashed}, ${name}, 'USER', false, NOW(), NOW())
      RETURNING id, name, email, role
    `;
    const user = users[0];

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await sql`
      INSERT INTO "RefreshToken" (id, token, "userId", "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${refreshToken}, ${user.id}, ${expiresAt}, NOW())
    `;

    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Registration successful",
      201,
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    return sendError(res, "Registration failed");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await sql`SELECT * FROM "User" WHERE email = ${email}`;
    if (users.length === 0) {
      return sendError(res, "Invalid email or password", 401);
    }
    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password", 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await sql`
      INSERT INTO "RefreshToken" (id, token, "userId", "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${refreshToken}, ${user.id}, ${expiresAt}, NOW())
    `;

    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful",
    );
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    return sendError(res, "Login failed");
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token required", 400);

    const tokens = await sql`
      SELECT * FROM "RefreshToken" WHERE token = ${refreshToken}
    `;
    if (tokens.length === 0 || tokens[0].expiresAt < new Date()) {
      return sendError(res, "Invalid or expired refresh token", 401);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const users = await sql`SELECT * FROM "User" WHERE id = ${decoded.userId}`;
    if (users.length === 0) return sendError(res, "User not found", 404);

    const user = users[0];
    const newAccessToken = generateAccessToken(user.id, user.role);

    return sendSuccess(res, { accessToken: newAccessToken }, "Token refreshed");
  } catch (err) {
    console.error("REFRESH ERROR:", err.message);
    return sendError(res, "Token refresh failed");
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await sql`DELETE FROM "RefreshToken" WHERE token = ${refreshToken}`;
    }
    return sendSuccess(res, {}, "Logged out successfully");
  } catch (err) {
    console.error("LOGOUT ERROR:", err.message);
    return sendError(res, "Logout failed");
  }
};

const getMe = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name, email, role, avatar, "createdAt"
      FROM "User" WHERE id = ${req.user.userId}
    `;
    if (users.length === 0) return sendError(res, "User not found", 404);

    return sendSuccess(res, { user: users[0] });
  } catch (err) {
    console.error("GETME ERROR:", err.message);
    return sendError(res, "Failed to fetch user");
  }
};

module.exports = { register, login, refresh, logout, getMe };
