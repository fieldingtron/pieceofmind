// Consolidated, cleaned form handler
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Form] form-handler.js loaded");

  const orderForm = document.getElementById("orderForm");
  const customizationCheckbox = document.getElementById("customization");
  const customizationTextDiv = document.getElementById("customizationText");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const submitBtn = document.getElementById("submitBtn");

  /**
   * Resets any currently visible form success or error messages
   * before attempting a new submission.
   */
  function resetFormMessages() {
    if (errorMessage) errorMessage.classList.add("hidden");
    if (successMessage) successMessage.classList.add("hidden");
  }

  /**
   * Posts the final structured JSON orderData payload to the Vercel backend.
   * On early success (if running on localhost), fakes a network delay to simulate production.
   * 
   * @param {Object} orderData - Formatted JSON of all form fields
   * @throws {Error} If the API request fails
   */
  async function sendOrderEmail(orderData) {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log("[Form] Simulating email send (localhost):", orderData);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      return true;
    }

    // Real API call for production
    try {
      console.log("[Form] API call payload:", orderData);
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
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

  /**
   * Primary form submission handler.
   * Collects all form data, sanitizes fields, implements multi-layer 
   * client-side bot detection, calculates pricing, and then forwards to the API.
   */
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
      // 1. Time-based Bot Check (Fast Submit)
      const startTimeInput = document.getElementById("startTime");
      if (startTimeInput && startTimeInput.value) {
        const timeElapsed = Date.now() - parseInt(startTimeInput.value, 10);
        if (timeElapsed < 3000) {
          // Submitted in under 3 seconds - highly likely a bot.
          throw new Error("Form submitted too quickly. Please take your time and try again.");
        }
      }

      const formData = new FormData(orderForm);
      const orderData = {};
      formData.forEach((value, key) => {
        // Treat checkboxes that are present as truthy
        if (
          key === "giftWrap" ||
          key === "rushDelivery" ||
          key === "customization" ||
          key === "topoMap" ||
          key === "badgeText" ||
          key === "paddleClips" ||
          key === "paddedBody" ||
          key === "paddedEnds" ||
          key === "happySwimsValve" ||
          key === "packTowel" ||
          key === "keyRing" ||
          key === "phoneStrap" ||
          key === "airTagSleeve"
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

      // 2. Honeypot check
      if (orderData.website && orderData.website.trim() !== "") {
        console.warn("[Form] Spam detected by honeypot field.");
        throw new Error("Spam detected. Submission blocked.");
      }

      // 3. Math Challenge Client-side verification
      if (parseInt(orderData.mathChallenge, 10) !== 7) {
        throw new Error("Incorrect answer to the security question.");
      }

      // 4. URL Pattern checking in names
      const urlRegex = /(http:\/\/|https:\/\/|www\.)/i;
      if (urlRegex.test(orderData.firstName) || urlRegex.test(orderData.lastName)) {
        throw new Error("Invalid characters detected in name fields.");
      }

      // Calculate total
      let totalPrice = 0;
      if (orderData.edition === "Cross-Zip") {
        totalPrice = 130;
      } else if (orderData.edition === "Clam-Shell") {
        totalPrice = 160;
      }
      // If quantity is supported, multiply
      if (orderData.quantity) {
        totalPrice *= parseInt(orderData.quantity, 10);
      }
      if (orderData.giftWrap) totalPrice += 5.0;
      if (orderData.rushDelivery) totalPrice += 15.0;
      if (orderData.customization) totalPrice += 10.0;
      if (orderData.topoMap) totalPrice += 75.0;
      if (orderData.badgeText) totalPrice += 30.0;

      // Calculate padded ends combined with padded body logic accurately
      if (orderData.paddedBody && orderData.paddedEnds) {
        totalPrice += 60.0; // 50 for body + 10 for ends
      } else {
        if (orderData.paddedBody) totalPrice += 50.0;
        if (orderData.paddedEnds) totalPrice += 20.0;
      }

      if (orderData.happySwimsValve) totalPrice += 50.0;
      if (orderData.packTowel) totalPrice += 20.0;
      if (orderData.keyRing) totalPrice += 15.0;
      if (orderData.phoneStrap) totalPrice += 20.0;
      if (orderData.airTagSleeve) totalPrice += 20.0;
      if (orderData.paddleClips) totalPrice += 50.0;

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
      if (orderData.badgeText && !orderData.badgeTextDetails)
        throw new Error(
          "Please enter badge text or uncheck the badge text option"
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
