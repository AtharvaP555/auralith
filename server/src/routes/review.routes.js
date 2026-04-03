const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require("../controllers/review.controller");
const { authenticate } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

router.get("/", getProductReviews);
router.post("/", authenticate, validate(schemas.createReview), createReview);
router.delete("/:id", authenticate, deleteReview);

module.exports = router;
