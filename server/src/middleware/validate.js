const { z } = require("zod");
const { sendError } = require("../utils/response");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    const message = err.errors?.[0]?.message || "Invalid request data";
    return sendError(res, message, 400);
  }
};

const schemas = {
  register: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),

  login: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),

  createProduct: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be positive"),
    comparePrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    categoryId: z.string().min(1, "Category is required"),
    images: z.array(z.string().url()).optional().default([]),
    isFeatured: z.boolean().optional().default(false),
  }),

  createOrder: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1, "Order must have at least one item"),
    shippingAddress: z.object({
      fullName: z.string().min(2),
      phone: z.string().min(10),
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(4),
      country: z.string().min(2),
    }),
  }),

  createReview: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional().nullable(),
  }),

  createCoupon: z.object({
    code: z.string().min(3).max(20),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().positive(),
    minOrder: z.number().positive().optional().nullable(),
    maxUses: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
  }),
};

module.exports = { validate, schemas };
