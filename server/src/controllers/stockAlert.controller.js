const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const { sendStockAlert } = require("../services/email.service");

const subscribeToAlert = async (req, res) => {
  try {
    const { productId } = req.body;
    const email = req.user ? null : req.body.email;
    const alertEmail = req.user
      ? (await sql`SELECT email FROM "User" WHERE id = ${req.user.userId}`)[0]
          ?.email
      : email;

    if (!alertEmail) {
      return sendError(res, "Email is required", 400);
    }

    if (!productId) {
      return sendError(res, "Product ID is required", 400);
    }

    const product = await sql`
      SELECT id, name, stock FROM "Product" WHERE id = ${productId}
    `;

    if (product.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    if (product[0].stock > 0) {
      return sendError(res, "Product is already in stock", 400);
    }

    await sql`
      INSERT INTO "StockAlert" (id, email, "productId", "createdAt")
      VALUES (gen_random_uuid(), ${alertEmail}, ${productId}, NOW())
      ON CONFLICT (email, "productId") DO NOTHING
    `;

    return sendSuccess(
      res,
      {},
      "We'll notify you when this product is back in stock",
    );
  } catch (err) {
    console.error("SUBSCRIBE ALERT ERROR:", err.message);
    return sendError(res, "Failed to subscribe to alert");
  }
};

const triggerStockAlerts = async (productId) => {
  try {
    const alerts = await sql`
      SELECT sa.email, p.name as "productName", p.slug
      FROM "StockAlert" sa
      JOIN "Product" p ON sa."productId" = p.id
      WHERE sa."productId" = ${productId}
    `;

    if (alerts.length === 0) return;

    for (const alert of alerts) {
      await sendStockAlert({
        to: alert.email,
        productName: alert.productName,
        productSlug: alert.slug,
      });
    }

    await sql`
      DELETE FROM "StockAlert" WHERE "productId" = ${productId}
    `;

    console.log(`Stock alerts sent for product ${productId}`);
  } catch (err) {
    console.error("TRIGGER ALERTS ERROR:", err.message);
  }
};

module.exports = { subscribeToAlert, triggerStockAlerts };
