const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getOrders,
  getOrder,
  cancelOrder,
} = require("../controllers/order.controller");
const { authenticate } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

router.post("/", authenticate, validate(schemas.createOrder), createOrder);
router.post("/verify-payment", authenticate, verifyPayment);
router.get("/", authenticate, getOrders);
router.get("/:id", authenticate, getOrder);
router.patch("/:id/cancel", authenticate, cancelOrder);

module.exports = router;
