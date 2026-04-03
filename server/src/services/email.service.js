const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderConfirmation = async ({
  to,
  userName,
  orderId,
  items,
  total,
  shippingAddress,
}) => {
  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div>
            <p style="margin: 0; font-size: 14px; font-weight: 500; color: #111827;">${item.productName}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: 500; color: #111827;">
        ₹${(parseFloat(item.price) * item.quantity).toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">

          <div style="background-color: #111827; padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Auralith</h1>
            <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">Premium Audio</p>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Order confirmed</h2>
            <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6;">
              Hi ${userName}, your order has been placed successfully. We'll notify you when it ships.
            </p>

            <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #111827;">#${orderId.slice(0, 8).toUpperCase()}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; font-size: 12px; color: #9ca3af; font-weight: 500; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                  <th style="text-align: right; font-size: 12px; color: #9ca3af; font-weight: 500; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <div style="border-top: 2px solid #111827; margin-top: 16px; padding-top: 16px; display: flex; justify-content: space-between;">
              <span style="font-size: 15px; font-weight: 600; color: #111827;">Total</span>
              <span style="font-size: 15px; font-weight: 700; color: #111827;">₹${parseFloat(total).toFixed(2)}</span>
            </div>

            <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 12px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Shipping to</p>
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
                ${shippingAddress.fullName}<br/>
                ${shippingAddress.street}<br/>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br/>
                ${shippingAddress.country}
              </p>
            </div>
          </div>

          <div style="padding: 24px 32px; border-top: 1px solid #f0f0f0; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #9ca3af;">
              Questions? Reply to this email or visit
              <a href="https://auralith-sandy.vercel.app" style="color: #111827;">auralith-sandy.vercel.app</a>
            </p>
          </div>

        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Auralith <onboarding@resend.dev>",
      to,
      subject: `Order confirmed — #${orderId.slice(0, 8).toUpperCase()}`,
      html,
    });
    console.log("Order confirmation email sent to:", to);
  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
  }
};

const sendStockAlert = async ({ to, productName, productSlug }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /><title>Back in Stock</title></head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background-color: #111827; padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Auralith</h1>
            <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">Premium Audio</p>
          </div>
          <div style="padding: 32px; text-align: center;">
            <p style="font-size: 40px; margin: 0 0 16px;">🎉</p>
            <h2 style="margin: 0 0 12px; font-size: 20px; color: #111827;">Back in stock!</h2>
            <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6;">
              Good news — <strong>${productName}</strong> is back in stock. Grab it before it sells out again.
            </p>
            <a href="https://auralith-sandy.vercel.app/products/${productSlug}"
               style="display: inline-block; background: #111827; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 500;">
              Shop now
            </a>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid #f0f0f0; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #9ca3af;">You received this because you requested a stock alert on Auralith.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Auralith <onboarding@resend.dev>",
      to,
      subject: `${productName} is back in stock!`,
      html,
    });
    console.log("Stock alert email sent to:", to);
  } catch (err) {
    console.error("STOCK ALERT EMAIL ERROR:", err.message);
  }
};

module.exports = { sendOrderConfirmation, sendStockAlert };
