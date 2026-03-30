const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  adminCreateCoupon,
  adminGetCoupons,
  adminDeleteCoupon,
} = require("../controllers/coupon.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

router.post("/validate", authenticate, validateCoupon);
router.get("/admin", authenticate, authorizeAdmin, adminGetCoupons);
router.post("/admin", authenticate, authorizeAdmin, adminCreateCoupon);
router.delete("/admin/:id", authenticate, authorizeAdmin, adminDeleteCoupon);

module.exports = router;
