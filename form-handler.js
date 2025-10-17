// Consolidated, cleaned form handler
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Form] form-handler.js loaded");

  const orderForm = document.getElementById("orderForm");
  const customizationCheckbox = document.getElementById("customization");
  const customizationTextDiv = document.getElementById("customizationText");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const submitBtn = document.getElementById("submitBtn");

  function resetFormMessages() {
    if (errorMessage) errorMessage.classList.add("hidden");
    if (successMessage) successMessage.classList.add("hidden");
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>\"']/g, function (s) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[s];
    });
  }

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
      <p><span class="label">Email:</span> ${escapeHtml(
        orderData.email || ""
      )}</p>`);
    if (orderData.phone)
      parts.push(
        `<p><span class="label">Phone:</span> ${escapeHtml(
          orderData.phone
        )}</p>`
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
    if (orderData.paddleClips) addons.push("Paddle Clips");
    if (orderData.paddedBody) addons.push("Padded Body");
    if (orderData.happySwimsValve) addons.push("Happy Swims Inflation Valve");
    if (orderData.packTowel) addons.push("Pack Towel");
    if (orderData.keyRing) addons.push("Key Ring");
    if (orderData.phoneStrap) addons.push("Phone Strap");

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

  async function sendOrderEmail(orderData) {
    const emailContent = formatOrderEmail(orderData);
    // Simulate success on localhost/127.0.0.1
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log("[Form] Simulating email send (localhost):", {
        to: orderData.email,
        subject: `Order Confirmation: Crotch Sac™`,
        html: emailContent,
      });
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      return true;
    }
    // Real API call for production
    try {
      console.log("[Form] API call payload:", {
        to: orderData.email,
        subject: `Order Confirmation: Crotch Sac™`,
        html: emailContent,
      });
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: orderData.email,
          subject: `Order Confirmation: Crotch Sac™`,
          html: emailContent,
        }),
      });
      console.log("[Form] API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Form] API error response:", errorData);
        throw new Error(errorData.error || "Failed to send email");
      }
      console.log("[Form] API call successful");
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error(
        "Failed to submit order. Please try again or contact support."
      );
    }
  }

  if (!orderForm) {
    console.error("[Form] orderForm NOT found!");
    return;
  }

  // Show/hide customization text field
  if (customizationCheckbox) {
    customizationCheckbox.addEventListener("change", () => {
      if (customizationCheckbox.checked) {
        customizationTextDiv.classList.remove("hidden");
      } else {
        customizationTextDiv.classList.add("hidden");
        const el = document.getElementById("embroideryText");
        if (el) el.value = "";
      }
    });
  }

  // Form submit handler
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("[Form] Submit triggered");
    resetFormMessages();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      submitBtn.classList.add("opacity-75", "cursor-not-allowed");
    }

    try {
      const formData = new FormData(orderForm);
      const orderData = {};
      formData.forEach((value, key) => {
        // Treat checkboxes that are present as truthy
        if (
          key === "giftWrap" ||
          key === "rushDelivery" ||
          key === "customization"
        ) {
          orderData[key] = true;
        } else {
          orderData[key] = value;
        }
      });

      // Normalize unchecked checkboxes
      if (!orderData.giftWrap) orderData.giftWrap = false;
      if (!orderData.rushDelivery) orderData.rushDelivery = false;
      if (!orderData.customization) orderData.customization = false;

      // Honeypot
      if (orderData.website && orderData.website.trim() !== "") {
        console.warn("[Form] Spam detected by honeypot field.");
        throw new Error("Spam detected. Submission blocked.");
      }

      // Calculate total
      let totalPrice = 0;
      if (orderData.edition === "Cross-Zip") {
        totalPrice = 125;
      } else if (orderData.edition === "Clam-Shell") {
        totalPrice = 140;
      }
      // If quantity is supported, multiply
      if (orderData.quantity) {
        totalPrice *= parseInt(orderData.quantity, 10);
      }
      if (orderData.giftWrap) totalPrice += 5.0;
      if (orderData.rushDelivery) totalPrice += 15.0;
      if (orderData.customization) totalPrice += 10.0;
      if (orderData.topoMap) totalPrice += 50.0;
      if (orderData.paddedEnds) totalPrice += 20.0;
      if (orderData.paddedEnds) totalPrice += 20.0;
      orderData.totalPrice = totalPrice.toFixed(2);

      // Basic validation
      if (!orderData.firstName || !orderData.lastName || !orderData.email) {
        throw new Error("Please fill in all required fields");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(orderData.email))
        throw new Error("Please enter a valid email address");
      if (orderData.customization && !orderData.embroideryText)
        throw new Error(
          "Please enter embroidery text or uncheck the customization option"
        );

      console.log("[Form] Sending orderData to API:", orderData);
      await sendOrderEmail(orderData);

      if (successMessage) successMessage.classList.remove("hidden");
      // Keep submit button disabled after successful submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Order Submitted";
      }
    } catch (error) {
      console.error("[Form] Error during submission:", error);
      if (errorMessage) {
        errorMessage.classList.remove("hidden");
        const et = document.getElementById("errorText");
        if (et) et.textContent = error.message;
      }
      // Re-enable submit button only on error
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Order";
        submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
      }
    }
  });

  console.log("Form handler initialized");
});

// Function to send email via Resend API
async function sendOrderEmail(orderData) {
  const emailContent = formatOrderEmail(orderData);
  // If running on localhost, simulate a successful send
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    console.log("[Form] Simulating email send (localhost):", {
      to: orderData.email,
      subject: `Order Confirmation: Crotch Sac™`,
      html: emailContent,
    });
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    return true;
  }
  // ...existing code for real API call...
  try {
    console.log("[Form] API call payload:", {
      to: orderData.email,
      subject: `Order Confirmation: Crotch Sac™`,
      html: emailContent,
    });
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: orderData.email,
        subject: `Order Confirmation: Crotch Sac™`,
        html: emailContent,
      }),
    });
    console.log("[Form] API response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Form] API error response:", errorData);
      throw new Error(errorData.error || "Failed to send email");
    }
    console.log("[Form] API call successful");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(
      "Failed to submit order. Please try again or contact support."
    );
  }
}

// Function to format the order data into HTML email content
function formatOrderEmail(orderData) {
  return `
        try {
          const formData = new FormData(orderForm);
          const orderData = {};
          formData.forEach((value, key) => {
            if (
              key === "giftWrap" ||
              key === "rushDelivery" ||
              key === "customization"
            ) {
              orderData[key] = true;
            } else {
              orderData[key] = value;
            }
          });
          console.log("[Form] Gathered orderData:", orderData);

          // Honeypot spam trap
          if (orderData.website && orderData.website.trim() !== "") {
            console.warn("[Form] Spam detected by honeypot field.");
            throw new Error("Spam detected. Submission blocked.");
          }

          if (!orderData.giftWrap) orderData.giftWrap = false;
          if (!orderData.rushDelivery) orderData.rushDelivery = false;
          if (!orderData.customization) orderData.customization = false;
          console.log("[Form] Checkbox normalization:", {
            giftWrap: orderData.giftWrap,
            rushDelivery: orderData.rushDelivery,
            customization: orderData.customization,
          });

          let totalPrice = 29.99;
          totalPrice += orderData.quantity ? (orderData.quantity - 1) * 29.99 : 0;
          if (orderData.giftWrap) totalPrice += 5.0;
          if (orderData.rushDelivery) totalPrice += 15.0;
          if (orderData.customization) totalPrice += 10.0;
          orderData.totalPrice = totalPrice.toFixed(2);
          console.log("[Form] Calculated totalPrice:", orderData.totalPrice);

          if (!orderData.firstName || !orderData.lastName || !orderData.email) {
            console.error("[Form] Missing required fields", orderData);
            throw new Error("Please fill in all required fields");
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(orderData.email)) {
            console.error("[Form] Invalid email format", orderData.email);
            throw new Error("Please enter a valid email address");
          }
                    text-align: right;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>New Crotch Sac™ Order</h1>
            </div>
            <div class="content">
                <div class="section">
                    <h2>Customer Information</h2>
                    <p><span class="label">Name:</span><span class="value">${
                      orderData.firstName
                    } ${orderData.lastName}</span></p>
                    <p><span class="label">Email:</span><span class="value">${
                      orderData.email
                    }</span></p>
                    ${
                      orderData.phone
                        ? `<p><span class="label">Phone:</span><span class="value">${orderData.phone}</span></p>`
                        : ""
                    }
                </div>
                
                <div class="section">
                    <h2>Product Details</h2>
                    <p><span class="label">Size:</span><span class="value">${
                      orderData.size
                    }</span></p>
                    <p><span class="label">Color:</span><span class="value">${
                      orderData.color
                    }</span></p>
                    <p><span class="label">Material:</span><span class="value">${
                      orderData.material
                    }</span></p>
                    <p><span class="label">Quantity:</span><span class="value">${
                      orderData.quantity
                    }</span></p>
                </div>
                
                <div class="section">
                    <h2>Additional Options</h2>
                    <p><span class="label">Gift Wrap:</span><span class="value">${
                      orderData.giftWrap ? "Yes (+$5.00)" : "No"
                    }</span></p>
                    <p><span class="label">Rush Delivery:</span><span class="value">${
                      orderData.rushDelivery ? "Yes (+$15.00)" : "No"
                    }</span></p>
                    <p><span class="label">Custom Embroidery:</span><span class="value">${
                      orderData.customization ? "Yes (+$10.00)" : "No"
                    }</span></p>
                    ${
                      orderData.embroideryText
                        ? `<p><span class="label">Embroidery Text:</span><span class="value">${orderData.embroideryText}</span></p>`
                        : ""
                    }
                </div>
                
                ${
                  orderData.specialInstructions
                    ? `
                <div class="section">
                    <h2>Special Instructions</h2>
                    <p>${orderData.specialInstructions}</p>
                </div>
                `
                    : ""
                }
                
                <div class="total">
                    Total: $${orderData.totalPrice}
                </div>
            </div>
        </body>
        </html>
    `;
}

// Log that the script has loaded
console.log("Form handler loaded successfully");
