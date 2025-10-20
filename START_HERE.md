# ✅ Getting Started Checklist

Use this checklist to get your IJSE Movie Night ticket booking system up and running.

---

## 📋 Pre-Setup (5 minutes)

### MongoDB Atlas Account

- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Sign up for free account
- [ ] Create M0 (free) cluster
- [ ] Create database user (username + password)
- [ ] Allow network access: `0.0.0.0/0` (or your IP)
- [ ] Get connection string
- [ ] Save connection string for later

### PayHere Sandbox Account

- [ ] Go to https://sandbox.payhere.lk/
- [ ] Sign up for sandbox account and verify email
- [ ] After login, go to Settings → Domains/APIs
- [ ] Click "Create API Key" button
- [ ] Fill in:
  - App Name: `IJSE Movie Night` (or your choice)
  - Allowed Domains: `http://localhost:5173`
- [ ] Click Create/Save
- [ ] Copy **App ID** (e.g., `4OVyIUA85Ka4JFncYf3OZU3PS`)
- [ ] Copy **App Secret** (e.g., `4DuTv20FceH8LOcHQGI96e49ab6liOftS4ZBXdlTPNIO`)
- [ ] Save both credentials securely for next step

**Note:** PayHere shows "App ID" and "App Secret" - these go into your `.env` as `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET`.

### Optional: Email Setup

- [ ] Gmail with 2FA enabled
- [ ] Generate App Password (Google Account → Security → App Passwords)
- [ ] Save SMTP credentials for later

---

## 💻 Installation (5 minutes)

### Backend Setup

- [ ] Open PowerShell in `d:\ticker_booking`
- [ ] Run: `cd backend`
- [ ] Run: `npm install` (wait ~2 minutes)
- [ ] Run: `Copy-Item .env.example .env`
- [ ] Open `backend\.env` in editor

### Backend Configuration

Edit `backend\.env`:

**Required:**

- [ ] Set `MONGODB_URI=` (paste your MongoDB connection string)
- [ ] Set `PAYHERE_MERCHANT_ID=` (paste your merchant ID)
- [ ] Set `PAYHERE_MERCHANT_SECRET=` (paste your secret)
- [ ] Set `ADMIN_PASSWORD=` (choose a strong password)

**Optional (for email):**

- [ ] Set `SMTP_HOST=smtp.gmail.com`
- [ ] Set `SMTP_USER=` (your Gmail)
- [ ] Set `SMTP_PASS=` (your app password)

**Optional (customize event):**

- [ ] Set `EVENT_NAME=IJSE Movie Night 2025`
- [ ] Set `EVENT_DATE=December 15, 2025`
- [ ] Set `EVENT_TIME=7:00 PM`
- [ ] Set `EVENT_VENUE=IJSE Campus Auditorium`

Save the file!

### Frontend Setup

- [ ] Open new PowerShell in `d:\ticker_booking`
- [ ] Run: `cd frontend`
- [ ] Run: `npm install` (wait ~1 minute)
- [ ] Run: `Copy-Item .env.example .env`
- [ ] Check `frontend\.env` (should have `VITE_API_URL=http://localhost:5000/api`)

---

## 🚀 First Run (1 minute)

### Start Backend

In PowerShell (backend directory):

- [ ] Run: `npm run dev`
- [ ] Wait for: "✅ MongoDB Connected"
- [ ] Wait for: "🚀 Server running on port 5000"
- [ ] Leave this terminal open!

### Start Frontend

In NEW PowerShell (frontend directory):

- [ ] Run: `npm run dev`
- [ ] Wait for: "Local: http://localhost:5173/"
- [ ] Browser should open automatically
- [ ] Leave this terminal open!

---

## ✅ First Test (2 minutes)

### Test Booking

- [ ] Fill form:
  - Name: `John Doe`
  - Email: `john@example.com`
  - Phone: `0771234567`
- [ ] Click "Proceed to Payment"
- [ ] Payment page opens (or auto-redirects in 2 seconds)
- [ ] Complete payment (or wait for auto-redirect)
- [ ] Success page shows
- [ ] Ticket number displays
- [ ] Click "Download Ticket"
- [ ] PDF opens
- [ ] PDF looks good with branding

**✅ If all above work, booking flow is working!**

### Test Admin

- [ ] Open new tab: `http://localhost:5173/admin`
- [ ] Enter admin password (from .env)
- [ ] Dashboard loads
- [ ] See 1 ticket in "Paid Tickets"
- [ ] See ticket in table below
- [ ] Try clicking "All", "Paid", "Pending" filters

**✅ If all above work, admin is working!**

---

## 🎯 Troubleshooting

### ❌ Backend won't start

**Error: MongoDB Connection Error**

- Check MongoDB URI is correct
- Verify username/password in URI
- Ensure IP whitelist includes 0.0.0.0/0
- Test connection at https://cloud.mongodb.com/

**Error: Port 5000 already in use**

- Change PORT in backend/.env to 5001
- Update frontend/.env: `VITE_API_URL=http://localhost:5001/api`

### ❌ Frontend won't start

**Error: npm ERR! code ELIFECYCLE**

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### ❌ Payment not working

**PayHere doesn't open**

- Check browser console for errors
- Verify PayHere script loaded (Network tab)
- In development, should auto-redirect after 2 seconds

**Payment successful but ticket not updated**

- Check backend logs for webhook errors
- Verify PayHere credentials are correct
- In sandbox, webhook might be delayed

### ❌ PDF not generating

**Error: Failed to generate PDF**

- Check Puppeteer installed correctly
- Try: `cd backend; npm install puppeteer --force`
- Restart backend

### ❌ Email not sending

- This is NORMAL if SMTP not configured
- Ticket still works and can be downloaded
- Configure SMTP credentials to enable email

---

## 🎨 Customization

After successful test, customize:

### Event Details

Edit `backend\.env`:

- [ ] `EVENT_NAME` - Your event name
- [ ] `EVENT_DATE` - Event date
- [ ] `EVENT_TIME` - Event time
- [ ] `EVENT_VENUE` - Venue location
- [ ] `TICKET_PRICE` - Ticket price (default 350)

Restart backend to apply changes.

### PDF Template

- [ ] Edit `backend\templates\ticket.html`
- [ ] Customize colors, layout, text
- [ ] Restart backend
- [ ] Test by creating new booking

### Frontend Colors

- [ ] Edit `frontend\src\styles\global.css`
- [ ] Change CSS variables (`:root` section)
- [ ] Save and see changes hot-reload

---

## 📚 Next Steps

### Learning

- [ ] Read `README.md` for complete overview
- [ ] Check `SYSTEM_FLOW.md` for architecture
- [ ] Review code in `backend/src/` and `frontend/src/`

### Testing

- [ ] Complete `TESTING.md` checklist
- [ ] Test on mobile device
- [ ] Test with real payment (small amount)

### Deployment

- [ ] Read `DEPLOYMENT.md` when ready for production
- [ ] Follow `PAYHERE_INTEGRATION.md` for live PayHere
- [ ] Set up domain and SSL

---

## 🆘 Get Help

### Check Documentation

1. `QUICKSTART.md` - 5-minute setup
2. `README.md` - Complete guide
3. `DEPLOYMENT.md` - Production setup
4. `PAYHERE_INTEGRATION.md` - Payment setup
5. `TESTING.md` - Test checklist
6. `SYSTEM_FLOW.md` - Architecture

### Common Questions

**Q: Can I use without email?**  
A: Yes! Email is optional. Tickets can be downloaded from success page.

**Q: Is PayHere required?**  
A: Yes, for payment processing. Use sandbox for testing (free).

**Q: How much does MongoDB cost?**  
A: Free tier (M0) is sufficient for campus events.

**Q: Can I change ticket price?**  
A: Yes, set `TICKET_PRICE` in backend/.env

**Q: How do I go live?**  
A: Follow `DEPLOYMENT.md` for production setup.

---

## ✅ Success Criteria

You're ready when:

- [x] Backend starts without errors
- [x] Frontend loads at localhost:5173
- [x] Can create booking
- [x] Can download PDF ticket
- [x] Can access admin dashboard
- [x] Statistics show correctly
- [x] No console errors

---

## 🎉 Congratulations!

Your IJSE Movie Night ticket booking system is running!

**What you have:**
✅ Full-stack ticket booking system  
✅ PayHere payment integration  
✅ PDF ticket generation  
✅ Admin dashboard  
✅ Email delivery (optional)  
✅ Responsive design  
✅ Production-ready code

**Start customizing and test thoroughly before your event!**

Need help? Check the documentation files in the project root.

Good luck with your movie night! 🍿🎬
