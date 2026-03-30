const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) return sendError(res, "Coupon code required", 400);

    const coupons = await sql`
      SELECT * FROM "Coupon"
      WHERE code = ${code.toUpperCase()} AND "isActive" = true
    `;

    if (coupons.length === 0) {
      return sendError(res, "Invalid coupon code", 404);
    }

    const coupon = coupons[0];

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return sendError(res, "Coupon has expired", 400);
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return sendError(res, "Coupon usage limit reached", 400);
    }

    if (
      coupon.minOrder &&
      parseFloat(orderTotal) < parseFloat(coupon.minOrder)
    ) {
      return sendError(
        res,
        `Minimum order of ₹${parseFloat(coupon.minOrder).toFixed(2)} required`,
        400,
      );
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (parseFloat(orderTotal) * parseFloat(coupon.value)) / 100;
    } else {
      discount = parseFloat(coupon.value);
    }

    discount = Math.min(discount, parseFloat(orderTotal));

    return sendSuccess(
      res,
      {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount: parseFloat(discount.toFixed(2)),
        },
      },
      "Coupon applied",
    );
  } catch (err) {
    console.error("VALIDATE COUPON ERROR:", err.message);
    return sendError(res, "Failed to validate coupon");
  }
};

const adminCreateCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = req.body;

    if (!code || !type || !value) {
      return sendError(res, "Code, type and value are required", 400);
    }

    const existing = await sql`
      SELECT id FROM "Coupon" WHERE code = ${code.toUpperCase()}
    `;

    if (existing.length > 0) {
      return sendError(res, "Coupon code already exists", 409);
    }

    const coupon = await sql`
      INSERT INTO "Coupon" (id, code, type, value, "minOrder", "maxUses", "expiresAt", "isActive", "createdAt")
      VALUES (
        gen_random_uuid(),
        ${code.toUpperCase()},
        ${type},
        ${parseFloat(value)},
        ${minOrder ? parseFloat(minOrder) : null},
        ${maxUses ? parseInt(maxUses) : null},
        ${expiresAt ? new Date(expiresAt) : null},
        true,
        NOW()
      )
      RETURNING *
    `;

    return sendSuccess(res, { coupon: coupon[0] }, "Coupon created", 201);
  } catch (err) {
    console.error("CREATE COUPON ERROR:", err.message);
    return sendError(res, "Failed to create coupon");
  }
};

const adminGetCoupons = async (req, res) => {
  try {
    const coupons = await sql`
      SELECT * FROM "Coupon" ORDER BY "createdAt" DESC
    `;
    return sendSuccess(res, { coupons });
  } catch (err) {
    console.error("GET COUPONS ERROR:", err.message);
    return sendError(res, "Failed to fetch coupons");
  }
};

const adminDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`UPDATE "Coupon" SET "isActive" = false WHERE id = ${id}`;
    return sendSuccess(res, {}, "Coupon deactivated");
  } catch (err) {
    console.error("DELETE COUPON ERROR:", err.message);
    return sendError(res, "Failed to deactivate coupon");
  }
};

module.exports = {
  validateCoupon,
  adminCreateCoupon,
  adminGetCoupons,
  adminDeleteCoupon,
};
