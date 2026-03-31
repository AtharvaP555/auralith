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

router.get("/analytics", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const revenueByDay = await sql`
      SELECT
        DATE("createdAt") as date,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE status NOT IN ('CANCELLED', 'REFUNDED')
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const ordersByStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM "Order"
      GROUP BY status
    `;

    const topProducts = await sql`
      SELECT
        p.name,
        p.images[1] as image,
        SUM(oi.quantity) as sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY p.id, p.name, p.images
      ORDER BY sold DESC
      LIMIT 5
    `;

    const totals = await sql`
      SELECT
        COUNT(DISTINCT id) as "totalOrders",
        COALESCE(SUM(CASE WHEN status NOT IN ('CANCELLED', 'REFUNDED') THEN total ELSE 0 END), 0) as "totalRevenue",
        COUNT(DISTINCT CASE WHEN status NOT IN ('CANCELLED', 'REFUNDED') THEN id END) as "successfulOrders"
      FROM "Order"
    `;

    const totalUsers = await sql`
      SELECT COUNT(*) as count FROM "User" WHERE role = 'USER'
    `;

    return sendSuccess(res, {
      revenueByDay,
      ordersByStatus,
      topProducts,
      totals: totals[0],
      totalUsers: parseInt(totalUsers[0].count),
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err.message);
    return sendError(res, "Failed to fetch analytics");
  }
});

module.exports = router;
