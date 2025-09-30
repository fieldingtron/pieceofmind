// Modal functionality
const modal = document.getElementById('orderModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const orderForm = document.getElementById('orderForm');
const customizationCheckbox = document.getElementById('customization');
const customizationTextDiv = document.getElementById('customizationText');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');

// Open modal
openModalBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
});

// Close modal function
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    // Reset form and messages
    orderForm.reset();
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    customizationTextDiv.classList.add('hidden');
}

// Close modal on button click
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Show/hide customization text field
customizationCheckbox.addEventListener('change', () => {
    if (customizationCheckbox.checked) {
        customizationTextDiv.classList.remove('hidden');
    } else {
        customizationTextDiv.classList.add('hidden');
        document.getElementById('embroideryText').value = '';
    }
});

// Form validation and submission
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide previous messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    
    try {
        // Gather form data
        const formData = new FormData(orderForm);
        const orderData = {};
        
        formData.forEach((value, key) => {
            if (key === 'giftWrap' || key === 'rushDelivery' || key === 'customization') {
                orderData[key] = true;
            } else {
                orderData[key] = value;
            }
        });
        
        // Add unchecked checkboxes
        if (!orderData.giftWrap) orderData.giftWrap = false;
        if (!orderData.rushDelivery) orderData.rushDelivery = false;
        if (!orderData.customization) orderData.customization = false;
        
        // Calculate total price
        let totalPrice = 29.99; // Base price
        totalPrice += orderData.quantity ? (orderData.quantity - 1) * 29.99 : 0;
        if (orderData.giftWrap) totalPrice += 5.00;
        if (orderData.rushDelivery) totalPrice += 15.00;
        if (orderData.customization) totalPrice += 10.00;
        orderData.totalPrice = totalPrice.toFixed(2);
        
        // Validate required fields
        if (!orderData.firstName || !orderData.lastName || !orderData.email || 
            !orderData.size || !orderData.color || !orderData.material) {
            throw new Error('Please fill in all required fields');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orderData.email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Validate customization text if checked
        if (orderData.customization && !orderData.embroideryText) {
            throw new Error('Please enter embroidery text or uncheck the customization option');
        }
        
        // Send data to Resend API
        await sendOrderEmail(orderData);
        
        // Show success message
        successMessage.classList.remove('hidden');
        
        // Reset form after short delay
        setTimeout(() => {
            closeModal();
        }, 2000);
        
    } catch (error) {
        // Show error message
        errorMessage.classList.remove('hidden');
        document.getElementById('errorText').textContent = error.message;
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order';
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
});

// Function to send email via Resend API
async function sendOrderEmail(orderData) {
    // In production, you would replace this URL with your actual backend endpoint
    // that securely handles the Resend API call with your API key
    const RESEND_API_ENDPOINT = '/api/send-order'; // Replace with your actual endpoint
    
    // Format the email content
    const emailContent = formatOrderEmail(orderData);
    
    try {
        // This is a placeholder for the actual API call
        // In a real implementation, you would make a POST request to your backend
        // which would then call the Resend API with your API key
        
        /*
        const response = await fetch(RESEND_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'orders@pieceofmindfab.com', // Your email address
                from: 'noreply@yourdomain.com', // Must be a verified domain in Resend
                subject: `New Crotch Sac Order from ${orderData.firstName} ${orderData.lastName}`,
                html: emailContent,
                replyTo: orderData.email
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send order email');
        }
        
        const result = await response.json();
        console.log('Email sent successfully:', result);
        */
        
        // For demonstration purposes, we'll simulate a successful API call
        console.log('Order data to be sent:', orderData);
        console.log('Email content:', emailContent);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In production, remove this simulation and uncomment the actual fetch call above
        console.log('Email would be sent via Resend API with the following data:');
        console.log(JSON.stringify({
            to: 'orders@pieceofmindfab.com',
            from: 'noreply@yourdomain.com',
            subject: `New Crotch Sac Order from ${orderData.firstName} ${orderData.lastName}`,
            html: emailContent,
            replyTo: orderData.email
        }, null, 2));
        
        return true;
        
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to submit order. Please try again or contact support.');
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
                    <p><span class="label">Name:</span><span class="value">${orderData.firstName} ${orderData.lastName}</span></p>
                    <p><span class="label">Email:</span><span class="value">${orderData.email}</span></p>
                    ${orderData.phone ? `<p><span class="label">Phone:</span><span class="value">${orderData.phone}</span></p>` : ''}
                </div>
                
                <div class="section">
                    <h2>Product Details</h2>
                    <p><span class="label">Size:</span><span class="value">${orderData.size}</span></p>
                    <p><span class="label">Color:</span><span class="value">${orderData.color}</span></p>
                    <p><span class="label">Material:</span><span class="value">${orderData.material}</span></p>
                    <p><span class="label">Quantity:</span><span class="value">${orderData.quantity}</span></p>
                </div>
                
                <div class="section">
                    <h2>Additional Options</h2>
                    <p><span class="label">Gift Wrap:</span><span class="value">${orderData.giftWrap ? 'Yes (+$5.00)' : 'No'}</span></p>
                    <p><span class="label">Rush Delivery:</span><span class="value">${orderData.rushDelivery ? 'Yes (+$15.00)' : 'No'}</span></p>
                    <p><span class="label">Custom Embroidery:</span><span class="value">${orderData.customization ? 'Yes (+$10.00)' : 'No'}</span></p>
                    ${orderData.embroideryText ? `<p><span class="label">Embroidery Text:</span><span class="value">${orderData.embroideryText}</span></p>` : ''}
                </div>
                
                ${orderData.specialInstructions ? `
                <div class="section">
                    <h2>Special Instructions</h2>
                    <p>${orderData.specialInstructions}</p>
                </div>
                ` : ''}
                
                <div class="total">
                    Total: $${orderData.totalPrice}
                </div>
            </div>
        </body>
        </html>
    `;
}

// Log that the script has loaded
console.log('Form handler loaded successfully');
