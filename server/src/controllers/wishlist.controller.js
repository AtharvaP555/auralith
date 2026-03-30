const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const items = await sql`
      SELECT w.id, w."createdAt",
             p.id as "productId", p.name, p.slug, p.price,
             p."comparePrice", p.images, p.stock,
             c.name as "categoryName"
      FROM "Wishlist" w
      JOIN "Product" p ON w."productId" = p.id
      JOIN "Category" c ON p."categoryId" = c.id
      WHERE w."userId" = ${userId}
      ORDER BY w."createdAt" DESC
    `;

    return sendSuccess(res, { items });
  } catch (err) {
    console.error("GET WISHLIST ERROR:", err.message);
    return sendError(res, "Failed to fetch wishlist");
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, "Product ID required", 400);
    }

    const existing = await sql`
      SELECT id FROM "Wishlist"
      WHERE "userId" = ${userId} AND "productId" = ${productId}
    `;

    if (existing.length > 0) {
      await sql`
        DELETE FROM "Wishlist"
        WHERE "userId" = ${userId} AND "productId" = ${productId}
      `;
      return sendSuccess(res, { wishlisted: false }, "Removed from wishlist");
    }

    await sql`
      INSERT INTO "Wishlist" (id, "userId", "productId", "createdAt")
      VALUES (gen_random_uuid(), ${userId}, ${productId}, NOW())
    `;

    return sendSuccess(res, { wishlisted: true }, "Added to wishlist");
  } catch (err) {
    console.error("TOGGLE WISHLIST ERROR:", err.message);
    return sendError(res, "Failed to update wishlist");
  }
};

const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const existing = await sql`
      SELECT id FROM "Wishlist"
      WHERE "userId" = ${userId} AND "productId" = ${productId}
    `;

    return sendSuccess(res, { wishlisted: existing.length > 0 });
  } catch (err) {
    console.error("CHECK WISHLIST ERROR:", err.message);
    return sendError(res, "Failed to check wishlist");
  }
};

module.exports = { getWishlist, toggleWishlist, checkWishlist };
