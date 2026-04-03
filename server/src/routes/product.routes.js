const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/product.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:slug", getProduct);
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  validate(schemas.createProduct),
  createProduct,
);
router.put("/:id", authenticate, authorizeAdmin, updateProduct);
router.delete("/:id", authenticate, authorizeAdmin, deleteProduct);

module.exports = router;
