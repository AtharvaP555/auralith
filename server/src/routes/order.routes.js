const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getOrders,
  getOrder,
} = require("../controllers/order.controller");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, createOrder);
router.post("/verify-payment", authenticate, verifyPayment);
router.get("/", authenticate, getOrders);
router.get("/:id", authenticate, getOrder);

module.exports = router;
