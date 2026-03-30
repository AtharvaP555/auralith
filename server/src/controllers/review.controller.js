const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getProductReviews = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await sql`
      SELECT id FROM "Product" WHERE slug = ${slug} AND "isActive" = true
    `;

    if (product.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    const reviews = await sql`
      SELECT r.id, r.rating, r.comment, r."createdAt",
             u.name as "userName", u.avatar as "userAvatar"
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      WHERE r."productId" = ${product[0].id}
      ORDER BY r."createdAt" DESC
    `;

    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COALESCE(AVG(rating), 0) as average,
        COUNT(*) FILTER (WHERE rating = 5) as five,
        COUNT(*) FILTER (WHERE rating = 4) as four,
        COUNT(*) FILTER (WHERE rating = 3) as three,
        COUNT(*) FILTER (WHERE rating = 2) as two,
        COUNT(*) FILTER (WHERE rating = 1) as one
      FROM "Review"
      WHERE "productId" = ${product[0].id}
    `;

    return sendSuccess(res, { reviews, stats: stats[0] });
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err.message);
    return sendError(res, "Failed to fetch reviews");
  }
};

const createReview = async (req, res) => {
  try {
    const { slug } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    const product = await sql`
      SELECT id FROM "Product" WHERE slug = ${slug} AND "isActive" = true
    `;

    if (product.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    const productId = product[0].id;

    const purchased = await sql`
      SELECT oi.id FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE o."userId" = ${userId}
        AND oi."productId" = ${productId}
        AND o.status NOT IN ('CANCELLED', 'REFUNDED')
    `;

    if (purchased.length === 0) {
      return sendError(
        res,
        "You can only review products you have purchased",
        403,
      );
    }

    const existing = await sql`
      SELECT id FROM "Review"
      WHERE "userId" = ${userId} AND "productId" = ${productId}
    `;

    if (existing.length > 0) {
      const updated = await sql`
        UPDATE "Review"
        SET rating = ${rating}, comment = ${comment || null}
        WHERE "userId" = ${userId} AND "productId" = ${productId}
        RETURNING *
      `;
      return sendSuccess(res, { review: updated[0] }, "Review updated");
    }

    const review = await sql`
      INSERT INTO "Review" (id, "userId", "productId", rating, comment, "createdAt")
      VALUES (gen_random_uuid(), ${userId}, ${productId}, ${rating}, ${comment || null}, NOW())
      RETURNING *
    `;

    return sendSuccess(res, { review: review[0] }, "Review submitted", 201);
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err.message);
    return sendError(res, "Failed to submit review");
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await sql`
      DELETE FROM "Review"
      WHERE id = ${id} AND "userId" = ${userId}
    `;

    return sendSuccess(res, {}, "Review deleted");
  } catch (err) {
    console.error("DELETE REVIEW ERROR:", err.message);
    return sendError(res, "Failed to delete review");
  }
};

module.exports = { getProductReviews, createReview, deleteReview };
