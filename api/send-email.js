import { Resend } from "resend";

console.log(
  "[Resend] ENV KEY:",
  process.env.RESEND_API_KEY ? "Present" : "Missing"
);
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Escapes characters that are unsafe for HTML.
 * Used to sanitize user input before embedding it into the email HTML.
 * @param {string} str - The raw string to escape.
 * @returns {string} The escaped string safe for HTML rendering.
 */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, function (s) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[s];
  });
}

/**
 * Formats the customer's order data into a clean, styled HTML email.
 * This is done server-side to prevent malicious HTML injection payloads
 * from the client.
 *
 * @param {Object} orderData - The validated order constraints from the client.
 * @returns {string} Fully structured HTML email content ready to be sent.
 */
function formatOrderEmail(orderData) {
  const parts = [];
  parts.push(`<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { font-family: Arial, sans-serif; color: #333; }
      .header { background:#2563eb; color:#fff; padding:18px; text-align:center }
      .content { padding:18px }
      .section { margin-bottom:12px }
      .label { font-weight:600; color:#2563eb }
    </style>
  </head>
  <body>
    <div class="header"><h1>New Crotch Sac™ Order</h1></div>
    <div class="content">`);

  // Customer
  parts.push(`<div class="section"><h2>Customer</h2>
    <p><span class="label">Name:</span> ${escapeHtml(
    orderData.firstName || ""
  )} ${escapeHtml(orderData.lastName || "")}</p>
    <p><span class="label">Email:</span> ${escapeHtml(orderData.email || "")}</p>`);
  if (orderData.phone)
    parts.push(
      `<p><span class="label">Phone:</span> ${escapeHtml(orderData.phone)}</p>`
    );
  if (
    orderData.street ||
    orderData.city ||
    orderData.state ||
    orderData.zip ||
    orderData.country
  ) {
    parts.push(
      `<p><span class="label">Address:</span> ${[
        orderData.street,
        orderData.city,
        orderData.state,
        orderData.zip,
        orderData.country,
      ]
        .filter(Boolean)
        .map(escapeHtml)
        .join(", ")}</p>`
    );
  }
  parts.push(`</div>`);

  // Customizations
  const basicOrder = [];

  if (orderData.edition === "Cross-Zip") {
    basicOrder.push(`<p><span class="label">Edition:</span> Cross-Zip</p>`);
  } else if (orderData.edition === "Clam-Shell") {
    basicOrder.push(`<p><span class="label">Edition:</span> Clam-Shell</p>`);
  } else if (orderData.edition) {
    basicOrder.push(
      `<p><span class="label">Edition:</span> ${escapeHtml(
        orderData.edition
      )}</p>`
    );
  }
  if (orderData.bagColor)
    basicOrder.push(
      `<p><span class="label">Bag Color:</span> ${escapeHtml(
        orderData.bagColor
      )}</p>`
    );
  if (orderData.trimColor)
    basicOrder.push(
      `<p><span class="label">Trim Color:</span> ${escapeHtml(
        orderData.trimColor
      )}</p>`
    );

  if (basicOrder.length) {
    parts.push(
      `<div class="section"><h2>Order Detail</h2>${basicOrder.join("")}</div>`
    );
  }

  // Add-ons
  const addons = [];

  if (orderData.topoMap) addons.push("Topo Map");
  if (orderData.drainageText)
    addons.push(`Drainage: ${escapeHtml(orderData.drainageText)}`);
  if (orderData.badgeText) {
    if (orderData.badgeTextDetails) {
      addons.push(`Badge Text: ${escapeHtml(orderData.badgeTextDetails)}`);
    } else {
      addons.push("Name / Phone Number / Custom Badge");
    }
  }
  if (orderData.paddleClips) addons.push("Paddle Clips");
  if (orderData.paddedBody) addons.push("Padded Body");
  if (orderData.happySwimsValve) addons.push("Happy Swims Inflation Valve");
  if (orderData.packTowel) addons.push("Pack Towel");
  if (orderData.keyRing) addons.push("Key Ring");
  if (orderData.phoneStrap) addons.push("Phone Strap");
  if (orderData.airTagSleeve) addons.push("AirTag Sleeve");

  if (addons.length) {
    parts.push(
      `<div class="section"><h2>Add-ons</h2><ul>${addons
        .map((a) => `<li>${escapeHtml(a)}</li>`)
        .join("")}</ul></div>`
    );
  }

  if (orderData.specialInstructions) {
    parts.push(
      `<div class="section"><h2>Special Instructions</h2><p>${escapeHtml(
        orderData.specialInstructions
      )}</p></div>`
    );
  }

  // Cost Calculation (all details)
  if (orderData.costCalculation) {
    parts.push(
      `<div class="section"><h2>Order Pricing Details</h2><pre style="background:#f3f4f6;padding:12px;border-radius:6px;">${escapeHtml(
        orderData.costCalculation
      )}</pre></div>`
    );
  }
  parts.push(`</div></body></html>`);
  return parts.join("\n");
}

/**
 * Vercel Serverless Function Handler for handling order form submissions.
 * It expects a JSON object inside `req.body`, verifies multiple spam-prevention
 * layers, formats an HTML email, and sends it to the shop owner using the Resend API.
 *
 * @param {import('http').IncomingMessage} req - The incoming HTTP POST request.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 */
export default async function handler(req, res) {
  console.log("[Resend] Handler called");
  if (req.method !== "POST") {
    console.log("[Resend] Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const orderData = req.body;
  console.log("[Resend] Request body:", orderData);

  if (!orderData || !orderData.email || !orderData.firstName || !orderData.lastName) {
    console.log("[Resend] Missing required fields", orderData);
    return res.status(400).json({ error: "Missing required fields" });
  }

  // --- Backend Spam Validation ---

  // 1. Honeypot check
  if (orderData.website && orderData.website.trim() !== "") {
    console.warn("[Resend] Spam detected by honeypot field.");
    // Return 200 so bots think it succeeded, but drop the email.
    return res.status(200).json({ success: true, message: "Order processed." });
  }

  // 2. Math Challenge check
  const mathAnswer = parseInt(orderData.mathChallenge, 10);
  if (isNaN(mathAnswer) || mathAnswer !== 7) {
    console.warn("[Resend] Spam detected by math challenge. Answer given:", orderData.mathChallenge);
    return res.status(400).json({ error: "Bot detection: Incorrect security question answer." });
  }

  // 3. Pattern Matching (URLs in Names)
  const urlRegex = /(http:\/\/|https:\/\/|www\.)/i;
  if (urlRegex.test(orderData.firstName) || urlRegex.test(orderData.lastName)) {
    console.warn("[Resend] Spam detected: URL in name fields.");
    return res.status(400).json({ error: "Bot detection: Invalid characters in name." });
  }

  // Build the HTML email locally securely on the server
  const html = formatOrderEmail(orderData);
  const subject = `Order Confirmation: Crotch Sac™ for ${orderData.firstName} ${orderData.lastName}`;

  try {
    const toAddress = process.env.EMAILTO;
    console.log("[Resend] Sending email", {
      from: "hello@fieldsmarshall.com",
      to: toAddress,
      subject,
    });
    const data = await resend.emails.send({
      from: "hello@fieldsmarshall.com", // Verified sender
      to: toAddress, // Recipient from ENV
      subject,
      html,
    });
    console.log("[Resend] Email send response:", data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[Resend] Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
}
