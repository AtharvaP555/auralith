const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

router.get("/orders", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const orders = await sql`
      SELECT o.id, o.status, o.total, o."createdAt", o."shippingAddress",
             u.name as "userName", u.email as "userEmail",
             json_agg(json_build_object(
               'id', oi.id,
               'quantity', oi.quantity,
               'price', oi.price,
               'productName', p.name,
               'productImage', p.images[1]
             )) as items
      FROM "Order" o
      JOIN "User" u ON o."userId" = u.id
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o."createdAt" DESC
    `;
    return sendSuccess(res, { orders });
  } catch (err) {
    console.error("ADMIN GET ORDERS ERROR:", err.message);
    return sendError(res, "Failed to fetch orders");
  }
});

router.put("/orders/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ];
    if (!validStatuses.includes(status)) {
      return sendError(res, "Invalid status", 400);
    }

    const result = await sql`
      UPDATE "Order" SET status = ${status}, "updatedAt" = NOW()
      WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    return sendSuccess(res, { order: result[0] }, "Order updated");
  } catch (err) {
    console.error("ADMIN UPDATE ORDER ERROR:", err.message);
    return sendError(res, "Failed to update order");
  }
});

module.exports = router;
