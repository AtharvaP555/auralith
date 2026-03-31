const sql = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sendOrderConfirmation } = require("../services/email.service");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return sendError(res, "No items in order", 400);
    }

    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await sql`
        SELECT id, name, price, stock FROM "Product"
        WHERE id = ${item.productId} AND "isActive" = true
      `;

      if (product.length === 0) {
        return sendError(res, `Product not found: ${item.productId}`, 404);
      }

      if (product[0].stock < item.quantity) {
        return sendError(res, `Insufficient stock for ${product[0].name}`, 400);
      }

      total += parseFloat(product[0].price) * item.quantity;
      validatedItems.push({ ...product[0], quantity: item.quantity });
    }

    const { couponCode, discount = 0 } = req.body;
    const finalTotal = Math.max(0, total - discount);
    const amountInPaise = Math.round(finalTotal * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    if (couponCode) {
      await sql`
    UPDATE "Coupon"
    SET "usedCount" = "usedCount" + 1
    WHERE code = ${couponCode.toUpperCase()} AND "isActive" = true
  `;
    }

    const order = await sql`
  INSERT INTO "Order" (id, "userId", status, total, "stripePaymentId", "shippingAddress", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), ${userId}, 'PENDING', ${finalTotal}, ${razorpayOrder.id}, ${JSON.stringify(shippingAddress)}, NOW(), NOW())
  RETURNING *
`;

    const orderId = order[0].id;

    for (const item of validatedItems) {
      await sql`
        INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
        VALUES (gen_random_uuid(), ${orderId}, ${item.id}, ${item.quantity}, ${item.price})
      `;
    }

    return sendSuccess(
      res,
      {
        orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      "Order created",
      201,
    );
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err.message);
    return sendError(res, "Failed to create order");
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return sendError(res, "Invalid payment signature", 400);
    }

    const order = await sql`
      SELECT * FROM "Order" WHERE id = ${orderId}
    `;

    if (order.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    if (order[0].stripeEventId) {
      return sendSuccess(res, { orderId }, "Payment already processed");
    }

    await sql`
      UPDATE "Order"
      SET status = 'PROCESSING',
          "stripeEventId" = ${razorpayPaymentId},
          "updatedAt" = NOW()
      WHERE id = ${orderId}
    `;

    const orderItems = await sql`
      SELECT oi.*, p.name FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      WHERE oi."orderId" = ${orderId}
    `;

    for (const item of orderItems) {
      await sql`
    UPDATE "Product"
    SET stock = stock - ${item.quantity}, "updatedAt" = NOW()
    WHERE id = ${item.productId}
  `;
    }

    const userResult = await sql`
  SELECT email, name FROM "User" WHERE id = ${order[0].userId}
`;

    if (userResult.length > 0) {
      const shippingAddress =
        typeof order[0].shippingAddress === "string"
          ? JSON.parse(order[0].shippingAddress)
          : order[0].shippingAddress;

      await sendOrderConfirmation({
        to: userResult[0].email,
        userName: userResult[0].name,
        orderId,
        items: orderItems,
        total: order[0].total,
        shippingAddress,
      });
    }

    return sendSuccess(res, { orderId }, "Payment verified successfully");
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err.message);
    return sendError(res, "Payment verification failed");
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await sql`
      SELECT o.id, o.status, o.total, o."createdAt", o."shippingAddress",
             json_agg(json_build_object(
               'id', oi.id,
               'quantity', oi.quantity,
               'price', oi.price,
               'productName', p.name,
               'productImage', p.images[1]
             )) as items
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      WHERE o."userId" = ${userId}
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
    `;

    return sendSuccess(res, { orders });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err.message);
    return sendError(res, "Failed to fetch orders");
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const orders = await sql`
      SELECT o.id, o.status, o.total, o."createdAt", o."shippingAddress",
             json_agg(json_build_object(
               'id', oi.id,
               'quantity', oi.quantity,
               'price', oi.price,
               'productName', p.name,
               'productImage', p.images[1]
             )) as items
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      WHERE o.id = ${id} AND o."userId" = ${userId}
      GROUP BY o.id
    `;

    if (orders.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    return sendSuccess(res, { order: orders[0] });
  } catch (err) {
    console.error("GET ORDER ERROR:", err.message);
    return sendError(res, "Failed to fetch order");
  }
};

module.exports = { createOrder, verifyPayment, getOrders, getOrder };
