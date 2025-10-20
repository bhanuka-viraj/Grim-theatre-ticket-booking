# PayHere Integration Guide for IJSE Movie Night

## Overview

This guide explains how to integrate PayHere payment gateway for the IJSE Movie Night ticket booking system.

## Prerequisites

1. PayHere Merchant Account (Sandbox for testing, Live for production)
2. Merchant ID and Merchant Secret from PayHere dashboard

## Setup Steps

### 1. Get PayHere Credentials

**For Testing (Sandbox):**

1. **Sign Up**

   - Visit https://sandbox.payhere.lk/
   - Click "Sign Up" and create a sandbox account
   - Verify your email address

2. **Create API Integration**

   - After login, go to **Settings** → **Domains/APIs**
   - Click **"Create API Key"** button
   - Fill in the form:
     - **App Name:** `IJSE Movie Night` (or any name you prefer)
     - **Allowed Domains:** `http://localhost:5173` (for development)
     - For production, add your actual domain: `https://your-domain.com`
   - Click **"Create"** or **"Save"**

3. **Get Your Credentials**

   - After creating the API key, you'll see:
     - **App ID** (alphanumeric string like `4OVyIUA85Ka4JFncYf3OZU3PS`)
     - **App Secret** (longer alphanumeric string like `4DuTv20FceH8LOcHQGI96e49ab6liOftS4ZBXdlTPNIO`)
   - **Copy both** and save them securely
   - You can view them anytime in Settings → Domains/APIs

   **Note:** PayHere calls these "App ID" and "App Secret" (not Merchant ID/Secret)

**Important Notes:**

- Sandbox Merchant ID is different from Live Merchant ID
- Keep your Merchant Secret confidential
- You can create multiple API keys for different domains/apps

**For Production:**

1. Visit https://www.payhere.lk/
2. Create a business account (requires business verification)
3. Complete KYC verification process
4. Once approved, go to Settings → Domains/APIs
5. Create API integration with your production domain
6. Get your production Merchant ID and Secret

### 2. Configure Backend

Edit `backend/.env`:

```env
# For Sandbox
PAYHERE_MERCHANT_ID=4OVyIUA85Ka4JFncYf3OZU3PS
PAYHERE_MERCHANT_SECRET=4DuTv20FceH8LOcHQGI96e49ab6liOftS4ZBXdlTPNIO
PAYHERE_SANDBOX=true

# For Production
PAYHERE_MERCHANT_ID=your_live_app_id
PAYHERE_MERCHANT_SECRET=your_live_app_secret
PAYHERE_SANDBOX=false
```

**Note:** Despite the variable names saying "MERCHANT_ID" and "MERCHANT_SECRET", you should paste your **App ID** and **App Secret** from PayHere. The code uses these names internally for compatibility.

### 3. Add PayHere JavaScript SDK to Frontend

The PayHere script needs to be loaded in the frontend. Add this to `frontend/index.html` before closing `</body>` tag:

```html
<!-- PayHere Sandbox (for testing) -->
<script
  type="text/javascript"
  src="https://sandbox.payhere.lk/lib/payhere.js"
></script>

<!-- OR PayHere Live (for production) -->
<script
  type="text/javascript"
  src="https://www.payhere.lk/lib/payhere.js"
></script>
```

**Already added in this project:** Check `frontend/index.html`

### 4. Configure Webhook URL

PayHere needs to send payment notifications to your backend.

**Development (Local Testing):**

1. Install ngrok: `npm install -g ngrok`
2. Start backend: `npm run dev` (port 5000)
3. In another terminal: `ngrok http 5000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Set in PayHere dashboard: `https://abc123.ngrok.io/api/payment/notify`

**Production:**

1. Deploy backend to your server
2. Set webhook URL: `https://your-domain.com/api/payment/notify`
3. Update in PayHere merchant dashboard → Settings → Notifications

### 5. Test Payment Flow

**Sandbox Test Cards:**

| Card Type  | Card Number         | CVV          | Expiry          |
| ---------- | ------------------- | ------------ | --------------- |
| Visa       | 4916 2174 0221 3361 | Any 3 digits | Any future date |
| Mastercard | 5307 5191 0089 4835 | Any 3 digits | Any future date |

**Test Flow:**

1. Fill booking form on frontend
2. Click "Proceed to Payment"
3. PayHere checkout opens
4. Use test card details
5. Complete payment
6. Redirect to success page
7. PDF ticket generated and emailed

### 6. Payment Status Flow

```
User submits form
    ↓
Backend creates ticket (status: pending)
    ↓
PayHere checkout initiated
    ↓
User completes payment
    ↓
PayHere sends webhook to /api/payment/notify
    ↓
Backend verifies signature
    ↓
Backend updates ticket (status: paid)
    ↓
PDF generated and emailed
    ↓
User redirected to success page
```

### 7. Security Considerations

✅ **Hash Verification:** Backend verifies PayHere signatures using MD5 hash
✅ **Webhook Validation:** All notifications are validated before processing
✅ **HTTPS Required:** Production must use HTTPS for security
✅ **Environment Variables:** Secrets stored in .env, never in code

### 8. Troubleshooting

**Problem:** Payment successful but ticket not marked as paid

- **Solution:** Check webhook URL is correctly set in PayHere dashboard
- **Solution:** Verify backend is accessible (not localhost in production)
- **Solution:** Check backend logs for webhook errors

**Problem:** PayHere checkout not opening

- **Solution:** Ensure PayHere script is loaded in frontend
- **Solution:** Check browser console for errors
- **Solution:** Verify merchant ID is correct

**Problem:** Invalid hash error

- **Solution:** Double-check merchant secret in .env
- **Solution:** Ensure no extra spaces in credentials

### 9. Going Live

Before production:

1. ✅ Switch to production credentials
2. ✅ Set `PAYHERE_SANDBOX=false`
3. ✅ Update PayHere script URL in frontend
4. ✅ Configure production webhook URL
5. ✅ Test with real card (small amount)
6. ✅ Enable HTTPS on server
7. ✅ Set up monitoring/logging

## API Endpoints

- `POST /api/tickets/book` - Create booking and get payment data
- `POST /api/payment/notify` - PayHere webhook (internal)
- `GET /api/payment/status/:orderId` - Check payment status

---

## Common Questions

### Q: Where do I find my App ID and App Secret?

**A:** After creating an API key in Settings → Domains/APIs, you'll see:

- **App ID** (e.g., `4OVyIUA85Ka4JFncYf3OZU3PS`)
- **App Secret** (e.g., `4DuTv20FceH8LOcHQGI96e49ab6liOftS4ZBXdlTPNIO`)

You can view them anytime in that section. Copy both and paste into your `.env` file as `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` respectively.

### Q: What should I enter for "Allowed Domains"?

**A:**

- **Development:** `http://localhost:5173` (or your local port)
- **Production:** `https://your-actual-domain.com`
- You can add multiple domains separated by commas

### Q: Can I have multiple API keys?

**A:** Yes! You can create separate API keys for development, staging, and production environments.

### Q: What's the difference between Sandbox and Live?

**A:**

- **Sandbox:** For testing only, uses test cards, no real money
- **Live:** Real payments, requires business verification

### Q: Do I need different credentials for frontend and backend?

**A:** No, you use the same App ID and App Secret for both. The frontend initiates payment, the backend verifies webhooks.

### Q: Why does the .env file say "MERCHANT_ID" when PayHere calls it "App ID"?

**A:** The variable names in our code use "MERCHANT" for historical/compatibility reasons, but you should paste your PayHere **App ID** into `PAYHERE_MERCHANT_ID` and your **App Secret** into `PAYHERE_MERCHANT_SECRET`. The functionality is the same.

### Q: How do I add my production domain later?

**A:** Go back to Settings → Domains/APIs, edit your API key, and add your production domain to the "Allowed Domains" field.

---

## Support

PayHere Support: support@payhere.lk
PayHere Documentation: https://support.payhere.lk/
