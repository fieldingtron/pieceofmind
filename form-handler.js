// Form elements
const orderForm = document.getElementById("orderForm");
const customizationCheckbox = document.getElementById("customization");
const customizationTextDiv = document.getElementById("customizationText");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const submitBtn = document.getElementById("submitBtn");

// Helper function to reset form messages
function resetFormMessages() {
  errorMessage.classList.add("hidden");
  successMessage.classList.add("hidden");
}

// Show/hide customization text field
customizationCheckbox.addEventListener("change", () => {
  if (customizationCheckbox.checked) {
    customizationTextDiv.classList.remove("hidden");
  } else {
    customizationTextDiv.classList.add("hidden");
    document.getElementById("embroideryText").value = "";
  }
});

// Form validation and submission
orderForm.addEventListener("submit", async (e) => {
  // Stop the default form submission which would cause page reload
  e.preventDefault();
  e.stopPropagation();

  console.log("[Form] Submit triggered");
  // Hide previous messages
  resetFormMessages();

  // Disable submit button to prevent double submission
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  submitBtn.classList.add("opacity-75", "cursor-not-allowed");

  try {
    // Gather form data
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

    // Add unchecked checkboxes
    if (!orderData.giftWrap) orderData.giftWrap = false;
    if (!orderData.rushDelivery) orderData.rushDelivery = false;
    if (!orderData.customization) orderData.customization = false;
    console.log("[Form] Checkbox normalization:", {
      giftWrap: orderData.giftWrap,
      rushDelivery: orderData.rushDelivery,
      customization: orderData.customization,
    });

    // Calculate total price
    let totalPrice = 29.99; // Base price
    totalPrice += orderData.quantity ? (orderData.quantity - 1) * 29.99 : 0;
    if (orderData.giftWrap) totalPrice += 5.0;
    if (orderData.rushDelivery) totalPrice += 15.0;
    if (orderData.customization) totalPrice += 10.0;
    orderData.totalPrice = totalPrice.toFixed(2);
    console.log("[Form] Calculated totalPrice:", orderData.totalPrice);

    // Validate required fields
    if (!orderData.firstName || !orderData.lastName || !orderData.email) {
      console.error("[Form] Missing required fields", orderData);
      throw new Error("Please fill in all required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.email)) {
      console.error("[Form] Invalid email format", orderData.email);
      throw new Error("Please enter a valid email address");
    }

    // Validate customization text if checked
    if (orderData.customization && !orderData.embroideryText) {
      console.error("[Form] Missing embroidery text");
      throw new Error(
        "Please enter embroidery text or uncheck the customization option"
      );
    }

    // Send data to Resend API
    console.log("[Form] Sending orderData to API:", orderData);
    await sendOrderEmail(orderData);

    // Show success message
    console.log("[Form] Order sent successfully");
    successMessage.classList.remove("hidden");

    // Reset the form but keep the success message visible
    orderForm.reset();

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Another Order";
    submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
  } catch (error) {
    // Show error message
    console.error("[Form] Error during submission:", error);
    errorMessage.classList.remove("hidden");
    document.getElementById("errorText").textContent = error.message;

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Order";
    submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
  }
});

// Function to send email via Resend API
async function sendOrderEmail(orderData) {
  // In production, you would replace this URL with your actual backend endpoint
  // that securely handles the Resend API call with your API key
  // Format the email content
  const emailContent = formatOrderEmail(orderData);

  try {
    // Prepare API call to Resend endpoint
    console.log("[Form] API call payload:", {
      to: orderData.email,
      subject: `Order Confirmation: Crotch Sac™`,
      html: emailContent,
    });

    // Make sure we're using the correct endpoint
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #2563eb;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border: 1px solid #ddd;
                }
                .section {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                }
                .section:last-child {
                    border-bottom: none;
                }
                .label {
                    font-weight: bold;
                    color: #2563eb;
                }
                .value {
                    margin-left: 10px;
                }
                .total {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #2563eb;
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
