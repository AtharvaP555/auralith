const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require("../controllers/review.controller");
const { authenticate } = require("../middleware/auth");

router.get("/", getProductReviews);
router.post("/", authenticate, createReview);
router.delete("/:id", authenticate, deleteReview);

module.exports = router;
