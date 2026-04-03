const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const passport = require("../utils/passport");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

router.post("/register", registerLimiter, validate(schemas.register), register);
router.post("/login", loginLimiter, validate(schemas.login), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const sql = require("../utils/prisma");
      await sql`
        INSERT INTO "RefreshToken" (id, token, "userId", "expiresAt", "createdAt")
        VALUES (gen_random_uuid(), ${refreshToken}, ${user.id}, ${expiresAt}, NOW())
      `;

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(
        `${clientUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.role}`,
      );
    } catch (err) {
      console.error("GOOGLE CALLBACK ERROR:", err.message);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  },
);

module.exports = router;
