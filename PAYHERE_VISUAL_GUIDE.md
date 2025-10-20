# 🔑 PayHere Setup - Visual Guide

## Step-by-Step with Screenshots Guide

### Step 1: Sign Up

1. Go to https://sandbox.payhere.lk/
2. Click **"Sign Up"** (top right)
3. Fill in:
   - Email address
   - Password
   - Confirm password
4. Click **"Register"**
5. Check your email and verify your account

---

### Step 2: Login to Dashboard

1. After email verification, login at https://sandbox.payhere.lk/
2. You'll see the PayHere Sandbox dashboard

---

### Step 3: Navigate to API Settings

1. Look for **"Settings"** in the left sidebar or top menu
2. Click on **"Domains/APIs"** (or similar option)
3. You'll see the API integration page

---

### Step 4: Create API Integration

You'll see a button that says **"Create API Key"** or **"Add API Integration"**

**Fill in the form:**

```
┌─────────────────────────────────────────┐
│  Create API Key                         │
├─────────────────────────────────────────┤
│                                         │
│  App Name: [IJSE Movie Night         ] │
│                                         │
│  Allowed Domains:                       │
│  [http://localhost:5173              ] │
│                                         │
│  [Create]  [Cancel]                     │
└─────────────────────────────────────────┘
```

**Important:**

- **App Name:** Can be anything (e.g., "IJSE Movie Night", "Test App", "Ticket Booking")
- **Allowed Domains:**
  - For development: `http://localhost:5173`
  - For production: `https://yourdomain.com`
  - Multiple domains: Separate with commas

Click **"Create"** or **"Save"**

---

### Step 5: Get Your Credentials

After creating the API key, you'll see:

```
┌─────────────────────────────────────────────────┐
│  API Integration Details                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  App Name: IJSE Movie Night                     │
│                                                 │
│  App ID: 4OVyIUA85Ka4JFncYf3OZU3PS            │
│  👆 This is what you need!                      │
│                                                 │
│  App Secret: 4DuTv20FceH8LOcHQGI96e49a...     │
│  👆 This is what you need!                      │
│                                                 │
│  Allowed Domains: http://localhost:5173         │
│                                                 │
│  Status: Active ✓                               │
│                                                 │
│  [Edit]  [Delete]  [View Details]              │
└─────────────────────────────────────────────────┘
```

**Copy both:**

1. **App ID** (e.g., `4OVyIUA85Ka4JFncYf3OZU3PS`) - Alphanumeric string
2. **App Secret** (e.g., `4DuTv20FceH8LOcHQGI96e49ab6liOftS4ZBXdlTPNIO`) - Long alphanumeric string

⚠️ **Keep the App Secret confidential!**

**Important:** PayHere displays these as "App ID" and "App Secret", but you'll paste them into your `.env` file as `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` (the variable names are for code compatibility).

---

### Step 6: Add to Your Project

Open `backend/.env` and paste:

```env
PAYHERE_MERCHANT_ID=4OVyIUA85Ka4JFncYf3OZU3PS
PAYHERE_MERCHANT_SECRET=4DuTv20FceH8LOcHQGI96e49ab6liOftS4ZBXdlTPNIO
PAYHERE_SANDBOX=true
```

Replace with your actual App ID and App Secret from PayHere!

**Note:** Even though PayHere calls them "App ID" and "App Secret", paste them as `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` in your `.env` file.

---

## 🎯 Quick Reference

| What You See        | What It Means                   | What To Do                                  |
| ------------------- | ------------------------------- | ------------------------------------------- |
| **Merchant ID**     | Your unique identifier          | Copy to `.env` as `PAYHERE_MERCHANT_ID`     |
| **Merchant Secret** | Secret key for verification     | Copy to `.env` as `PAYHERE_MERCHANT_SECRET` |
| **App Name**        | Just a label for you            | Choose any name you like                    |
| **Allowed Domains** | Where payments can be initiated | Use `http://localhost:5173` for testing     |
| **Sandbox**         | Testing mode                    | Use test cards, no real money               |

---

## 🧪 Test Cards for Sandbox

Once configured, use these test cards:

| Card Type  | Number                | CVV          | Expiry          | Name     |
| ---------- | --------------------- | ------------ | --------------- | -------- |
| Visa       | `4916 2174 0221 3361` | Any 3 digits | Any future date | Any name |
| Mastercard | `5307 5191 0089 4835` | Any 3 digits | Any future date | Any name |

**Example:**

- Card: `4916 2174 0221 3361`
- CVV: `123`
- Expiry: `12/25`
- Name: `John Doe`

---

### ✅ Verification Checklist

After setting up, verify:

- [ ] You can see your API integration in Settings → Domains/APIs
- [ ] App ID looks like `4OVyIUA85Ka4JFncYf3OZU3PS` (alphanumeric string)
- [ ] App Secret is a longer string (30+ characters)
- [ ] Both are copied to `backend/.env` as `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET`
- [ ] `PAYHERE_SANDBOX=true` is set in `.env`
- [ ] Allowed domain includes `http://localhost:5173`

---

## 🔄 Common Scenarios

### Scenario 1: Adding Production Domain Later

1. Go back to Settings → Domains/APIs
2. Click **"Edit"** on your API integration
3. In "Allowed Domains", add: `http://localhost:5173,https://your-production-domain.com`
4. Save changes

### Scenario 2: Creating Separate Keys for Dev/Prod

**Option A:** Use one key with multiple domains (easier)

```
Allowed Domains: http://localhost:5173,https://yoursite.com
```

**Option B:** Create separate API keys (recommended for security)

1. Create API key #1: "Dev - Movie Night" → `http://localhost:5173`
2. Create API key #2: "Production - Movie Night" → `https://yoursite.com`
3. Use different credentials in dev vs production `.env` files

### Scenario 3: Lost Your Merchant Secret

1. Go to Settings → Domains/APIs
2. Click on your API integration
3. Look for **"Show Secret"** or **"Regenerate"** button
4. Copy the secret again (if regenerated, update `.env`)

---

## 🚨 Troubleshooting

### "I don't see Merchant ID after creating API key"

- Refresh the page
- Click on the API integration name to view details
- Check if it's listed in the API integrations table

### "Create API Key button is disabled"

- Make sure you've verified your email
- Try logging out and back in
- Clear browser cache

### "Invalid Merchant ID error"

- Make sure you copied the ID exactly (no spaces)
- Verify it's a 7-digit number
- Check it's from the sandbox dashboard (not live)

### "Payment checkout not opening"

- Verify allowed domain includes your current URL
- Check browser console for errors
- Make sure PayHere SDK is loaded (see Network tab)

---

## 📞 Need Help?

**PayHere Support:**

- Email: support@payhere.lk
- Website: https://www.payhere.lk/contact

**Documentation:**

- PayHere Docs: https://support.payhere.lk/
- PayHere API: https://support.payhere.lk/api-&-mobile-sdk

**Your Project Documentation:**

- Main setup: `QUICKSTART.md`
- Detailed guide: `PAYHERE_INTEGRATION.md`
- Start here: `START_HERE.md`

---

## ✨ Pro Tips

1. **Save your credentials immediately** - Copy to a secure password manager
2. **Test thoroughly in sandbox** - Use all test card types
3. **Keep secrets secret** - Never commit `.env` to Git
4. **Use meaningful app names** - Helps identify in dashboard later
5. **Document your setup** - Note which key is for which environment

---

**You're all set! Go back to `START_HERE.md` to continue setup.** 🚀
