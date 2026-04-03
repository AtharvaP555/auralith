const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  adminCreateCoupon,
  adminGetCoupons,
  adminDeleteCoupon,
} = require("../controllers/coupon.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

router.post("/validate", authenticate, validateCoupon);
router.get("/admin", authenticate, authorizeAdmin, adminGetCoupons);
router.post(
  "/admin",
  authenticate,
  authorizeAdmin,
  validate(schemas.createCoupon),
  adminCreateCoupon,
);
router.delete("/admin/:id", authenticate, authorizeAdmin, adminDeleteCoupon);

module.exports = router;
