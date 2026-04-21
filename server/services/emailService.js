const nodemailer = require("nodemailer");

let transporterPromise;

const getEnv = (key, fallback = "") => String(process.env[key] || fallback).trim();

const createTransporter = async () => {
  const smtpHost = getEnv("SMTP_HOST");
  const smtpPort = Number(getEnv("SMTP_PORT", "587"));
  const smtpUser = getEnv("SMTP_USER");
  const smtpPass = getEnv("SMTP_PASS");

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.verify();
    return { transporter, mode: "smtp" };
  }

  const transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });

  return { transporter, mode: "stream" };
};

const getTransporterConfig = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }

  return transporterPromise;
};

const buildOrderHtml = ({ customerName, order, product }) => {
  const appBaseUrl = getEnv("APP_BASE_URL", "http://localhost:5000");
  const amount = Number(product.price || 0) * Number(order.quantity || 1);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #f5f7ff; padding: 24px;">
      <div style="background: #0f172a; color: #fff; border-radius: 16px 16px 0 0; padding: 20px;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.04em;">HATTAH Order Confirmation</h1>
        <p style="margin: 8px 0 0; color: #cbd5e1;">Your order request has been received successfully.</p>
      </div>
      <div style="background: #ffffff; border-radius: 0 0 16px 16px; padding: 20px; border: 1px solid #e2e8f0; border-top: 0;">
        <p style="margin-top: 0; color: #1e293b;">Hi ${customerName},</p>
        <p style="color: #334155;">Thank you for shopping with HATTAH. Your request has been forwarded to the seller and they will contact you soon.</p>

        <div style="margin: 18px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #f8fafc; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">Order Summary</div>
          <div style="padding: 12px 14px; color: #334155;">
            <p style="margin: 6px 0;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="margin: 6px 0;"><strong>Product:</strong> ${product.name}</p>
            <p style="margin: 6px 0;"><strong>Seller:</strong> ${product.sellerName}</p>
            <p style="margin: 6px 0;"><strong>Category:</strong> ${product.category}</p>
            <p style="margin: 6px 0;"><strong>Quantity:</strong> ${order.quantity}</p>
            <p style="margin: 6px 0;"><strong>Estimated Amount:</strong> INR ${amount}</p>
            <p style="margin: 6px 0;"><strong>Status:</strong> New</p>
          </div>
        </div>

        <div style="margin: 18px 0; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;">
          <p style="margin: 4px 0; color: #334155;"><strong>Delivery Address:</strong> ${order.address}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Phone:</strong> ${order.phone}</p>
        </div>

        <p style="color: #334155;">Need help? Contact our team anytime.</p>
        <a href="${appBaseUrl}" style="display: inline-block; background: #6C63FF; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 999px; font-weight: 700;">Continue Browsing</a>
        <p style="margin-top: 18px; color: #64748b; font-size: 13px;">This is an automated confirmation from HATTAH.</p>
      </div>
    </div>
  `;
};

const sendOrderConfirmationEmail = async ({ customerName, customerEmail, order, product }) => {
  const { transporter, mode } = await getTransporterConfig();

  const fromName = getEnv("ORDER_FROM_NAME", "HATTAH");
  const fromEmail =
    getEnv("ORDER_FROM_EMAIL") || getEnv("SMTP_USER") || "no-reply@hattah.local";

  const info = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: customerEmail,
    subject: `HATTAH Order Confirmed - ${product.name}`,
    text: `Hi ${customerName}, your order request for ${product.name} has been received. Order ID: ${order._id}.`,
    html: buildOrderHtml({ customerName, order, product }),
  });

  if (mode === "stream" && info.message) {
    console.log("[Mail Preview] SMTP is not configured. Email content below:\n");
    console.log(info.message.toString());
  }

  return {
    mode,
    messageId: info.messageId || null,
  };
};

module.exports = {
  sendOrderConfirmationEmail,
};
