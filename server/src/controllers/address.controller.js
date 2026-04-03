const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addresses = await sql`
      SELECT * FROM "Address"
      WHERE "userId" = ${userId}
      ORDER BY "isDefault" DESC, id ASC
    `;
    return sendSuccess(res, { addresses });
  } catch (err) {
    console.error("GET ADDRESSES ERROR:", err.message);
    return sendError(res, "Failed to fetch addresses");
  }
};

const createAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (isDefault) {
      await sql`
        UPDATE "Address" SET "isDefault" = false WHERE "userId" = ${userId}
      `;
    }

    const existing = await sql`
      SELECT COUNT(*) as count FROM "Address" WHERE "userId" = ${userId}
    `;
    const isFirst = parseInt(existing[0].count) === 0;

    const address = await sql`
      INSERT INTO "Address" (id, "userId", "fullName", phone, street, city, state, "postalCode", country, "isDefault")
      VALUES (gen_random_uuid(), ${userId}, ${fullName}, ${phone}, ${street}, ${city}, ${state}, ${postalCode}, ${country}, ${isDefault || isFirst})
      RETURNING *
    `;

    return sendSuccess(res, { address: address[0] }, "Address added", 201);
  } catch (err) {
    console.error("CREATE ADDRESS ERROR:", err.message);
    return sendError(res, "Failed to add address");
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const existing = await sql`
      SELECT id FROM "Address" WHERE id = ${id} AND "userId" = ${userId}
    `;
    if (existing.length === 0) return sendError(res, "Address not found", 404);

    if (isDefault) {
      await sql`
        UPDATE "Address" SET "isDefault" = false WHERE "userId" = ${userId}
      `;
    }

    const address = await sql`
      UPDATE "Address"
      SET "fullName" = ${fullName}, phone = ${phone}, street = ${street},
          city = ${city}, state = ${state}, "postalCode" = ${postalCode},
          country = ${country}, "isDefault" = ${isDefault || false}
      WHERE id = ${id} AND "userId" = ${userId}
      RETURNING *
    `;

    return sendSuccess(res, { address: address[0] }, "Address updated");
  } catch (err) {
    console.error("UPDATE ADDRESS ERROR:", err.message);
    return sendError(res, "Failed to update address");
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await sql`
      SELECT id FROM "Address" WHERE id = ${id} AND "userId" = ${userId}
    `;
    if (existing.length === 0) return sendError(res, "Address not found", 404);

    await sql`DELETE FROM "Address" WHERE id = ${id} AND "userId" = ${userId}`;

    return sendSuccess(res, {}, "Address deleted");
  } catch (err) {
    console.error("DELETE ADDRESS ERROR:", err.message);
    return sendError(res, "Failed to delete address");
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await sql`
      SELECT id FROM "Address" WHERE id = ${id} AND "userId" = ${userId}
    `;
    if (existing.length === 0) return sendError(res, "Address not found", 404);

    await sql`
      UPDATE "Address" SET "isDefault" = false WHERE "userId" = ${userId}
    `;

    await sql`
      UPDATE "Address" SET "isDefault" = true WHERE id = ${id} AND "userId" = ${userId}
    `;

    return sendSuccess(res, {}, "Default address updated");
  } catch (err) {
    console.error("SET DEFAULT ADDRESS ERROR:", err.message);
    return sendError(res, "Failed to update default address");
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
