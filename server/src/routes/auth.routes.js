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

router.post("/register", registerLimiter, validate(schemas.register), register);
router.post("/login", loginLimiter, validate(schemas.login), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

module.exports = router;
