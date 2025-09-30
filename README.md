# Piece of Mind - Crotch Sac™ Order Form

A responsive modal email form built with Tailwind CSS and vanilla JavaScript for collecting custom orders for Crotch Sac™ products. The form integrates with the Resend API for email delivery.

## Features

- **Responsive Modal Design**: Beautiful modal form that works on all devices
- **Product Customization**: Multiple fields for size, color, material, and quantity
- **Additional Options**: Gift wrap, rush delivery, and custom embroidery
- **Real-time Validation**: Client-side form validation with user-friendly error messages
- **Resend API Integration**: Email delivery via Resend API
- **Tailwind CSS Styling**: Modern, professional design with smooth animations
- **Vanilla JavaScript**: No framework dependencies, lightweight and fast

## Files

- `index.html` - Main HTML page with the modal form
- `form-handler.js` - JavaScript for modal functionality and form submission
- `api-example.js` - Backend API examples for Resend integration (Node.js, PHP)

## Setup Instructions

### 1. Frontend Setup

Simply open the `index.html` file in a web browser, or host it on any web server:

```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server (install with: npm install -g http-server)
http-server

# Using PHP's built-in server
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

### 2. Backend API Setup

To enable email sending via Resend API, you need to set up a backend endpoint:

#### Option A: Node.js/Express

1. Install dependencies:
```bash
npm init -y
npm install express resend cors
```

2. Create a backend server (see `api-example.js` for code)

3. Set your Resend API key as an environment variable:
```bash
export RESEND_API_KEY='your_api_key_here'
```

4. Run the server:
```bash
node server.js
```

#### Option B: Serverless Function (Vercel/Netlify)

1. Create an `api/send-order.js` file (see `api-example.js` for code)
2. Set `RESEND_API_KEY` in your environment variables
3. Deploy to Vercel or Netlify

#### Option C: PHP

1. Create an `api/send-order.php` file (see `api-example.js` for code)
2. Replace `YOUR_RESEND_API_KEY` with your actual API key
3. Deploy to any PHP hosting

### 3. Configure Resend API

1. Sign up at [Resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Update the backend code with your API key
5. Update `form-handler.js` line 120 with your actual API endpoint URL:
```javascript
const RESEND_API_ENDPOINT = '/api/send-order'; // or your actual endpoint URL
```

### 4. Customize Email Recipients

Update the email address in `form-handler.js` (line 135) to receive order notifications:
```javascript
to: 'orders@pieceofmindfab.com', // Change to your email
from: 'noreply@yourdomain.com', // Change to your verified domain
```

## Form Fields

### Customer Information
- First Name (required)
- Last Name (required)
- Email Address (required)
- Phone Number (optional)

### Product Customization
- Size (required): Small, Medium, Large, X-Large, XX-Large
- Color (required): Black, Navy Blue, Gray, Camouflage, Red
- Material (required): 100% Cotton, Bamboo Blend, Modal, Microfiber
- Quantity (required): 1-10 units

### Additional Options
- Gift wrap (+$5.00)
- Rush delivery (+$15.00)
- Custom embroidery (+$10.00) with text field

### Special Instructions
- Free-form text area for additional comments or requests

## Usage

### Embedding on Another Website

To embed this form on a different website, you have several options:

1. **iframe Method**:
```html
<iframe src="https://yourdomain.com/index.html" width="100%" height="600px"></iframe>
```

2. **Link Method** (as specified in requirements):
```html
<a href="https://yourdomain.com/index.html" target="_blank">Order Crotch Sac™</a>
```

3. **Modal Popup Method**:
```html
<a href="#" onclick="window.open('https://yourdomain.com/index.html', 'orderForm', 'width=800,height=600'); return false;">
    Order Crotch Sac™
</a>
```

## Pricing Calculation

The form automatically calculates the total price:
- Base price: $29.99 per unit
- Additional quantities: $29.99 each
- Gift wrap: +$5.00
- Rush delivery: +$15.00
- Custom embroidery: +$10.00

## Security Considerations

⚠️ **Important**: Never expose your Resend API key in frontend code!

- Always handle API calls through a backend server
- Use environment variables for API keys
- Implement rate limiting on your backend
- Validate all input on the server side
- Use HTTPS for all production deployments
- Consider implementing CAPTCHA to prevent spam

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Changing Colors

The form uses Tailwind's blue color scheme. To change:
1. Replace `bg-blue-600` with your preferred color (e.g., `bg-green-600`)
2. Update hover states accordingly
3. Update focus ring colors in form inputs

### Adding More Fields

To add more customization fields:
1. Add the HTML input in `index.html`
2. The form data will automatically be captured
3. Update the email template in `formatOrderEmail()` function

### Modifying Pricing

Update the base price and add-on costs in `form-handler.js` (lines 101-105):
```javascript
let totalPrice = 29.99; // Base price
if (orderData.giftWrap) totalPrice += 5.00;
if (orderData.rushDelivery) totalPrice += 15.00;
if (orderData.customization) totalPrice += 10.00;
```

## Testing

The form includes:
- Client-side validation
- Email format validation
- Required field checking
- Console logging for debugging

For testing without a backend:
- The form will log all data to the browser console
- Check browser DevTools > Console to see the formatted email content

## License

This project is open source and available for use.

## Support

For issues or questions, please open an issue on GitHub.