# 🎬 IJSE Movie Night - Quick Start Guide

Get the ticket booking system running in 5 minutes!

## Prerequisites

✅ Node.js 18+ installed
✅ MongoDB Atlas account (free tier works)
✅ PayHere merchant account (sandbox for testing)

---

## Step 1: Install Dependencies (2 minutes)

Open PowerShell in the `ticker_booking` directory:

```powershell
# Backend
cd backend
npm install
Copy-Item .env.example .env

# Frontend
cd ..\frontend
npm install
Copy-Item .env.example .env

cd ..
```

---

## Step 2: Configure Backend (2 minutes)

Edit `backend/.env`:

### Minimum Required Configuration

```env
# MongoDB Atlas (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-tickets

# PayHere Sandbox (REQUIRED for testing)
PAYHERE_MERCHANT_ID=1234567
PAYHERE_MERCHANT_SECRET=your_sandbox_secret
PAYHERE_SANDBOX=true

# Admin Password
ADMIN_PASSWORD=admin123
```

**Get MongoDB URI:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Database Access → Add user
4. Network Access → Allow access from anywhere (0.0.0.0/0)
5. Clusters → Connect → Get connection string

**Get PayHere Credentials:**

1. Go to https://sandbox.payhere.lk/
2. Sign up for sandbox account and verify email
3. After login: Settings → Domains/APIs
4. Click "Create API Key" button
5. Fill in:
   - App Name: `IJSE Movie Night`
   - Allowed Domains: `http://localhost:5173`
6. Click Create/Save
7. Copy **App ID** (e.g., `4OVyIUA85Ka4JFncYf3OZU3PS`)
8. Copy **App Secret** (e.g., `4DuTv20FceH8LOcHQGI96e49ab6liOftS4ZBXdlTPNIO`)

**Note:** PayHere calls these "App ID" and "App Secret". Paste them into your `.env` file as `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET`.

### Optional (Email)

If you want email delivery:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Leave blank for now if you don't have SMTP credentials.

---

## Step 3: Start Backend (10 seconds)

```powershell
cd backend
npm run dev
```

You should see:

```
✅ MongoDB Connected: cluster0.mongodb.net
✅ Email transporter initialized  (or warning if SMTP not configured)
🚀 Server running on port 5000
```

Keep this terminal open!

---

## Step 4: Start Frontend (10 seconds)

Open a **new** PowerShell window:

```powershell
cd d:\ticker_booking\frontend
npm run dev
```

You should see:

```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

Browser will open automatically!

---

## Step 5: Test the System (1 minute)

### Book a Ticket

1. Open http://localhost:5173
2. Fill in the booking form:
   - Name: John Doe
   - Email: john@example.com
   - Phone: 0771234567
3. Click "Proceed to Payment"
4. PayHere sandbox will open
5. Use test card:
   - **Card:** 4916 2174 0221 3361
   - **CVV:** 123
   - **Expiry:** 12/25
6. Complete payment
7. You'll be redirected to success page
8. Download your PDF ticket!

### Access Admin Dashboard

1. Open http://localhost:5173/admin
2. Enter password: `admin123` (or whatever you set in .env)
3. View all bookings and statistics

---

## Common Issues & Solutions

### ❌ "MongoDB Connection Error"

**Solution:** Check your MongoDB URI in `backend/.env`. Ensure:

- Password has no special characters (or URL-encode them)
- IP whitelist includes 0.0.0.0/0
- Database user has read/write permissions

### ❌ "Port 5000 already in use"

**Solution:** Change PORT in `backend/.env` to 5001, and update frontend `.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

### ❌ PayHere checkout not opening

**Solution:**

1. Check browser console for errors
2. Verify PayHere script is loaded (check Network tab)
3. For development, payment will auto-redirect after 2 seconds

### ❌ Email not sending

**Solution:** This is normal if SMTP is not configured. Ticket will still generate and be downloadable. Check backend console for "Email not configured" message.

---

## Project Structure

```
ticker_booking/
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/         # Database, email, PayHere config
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Error handling, validation
│   │   └── utils/          # Helper functions
│   ├── templates/          # PDF ticket template
│   ├── .env                # Environment variables
│   └── server.js           # Entry point
│
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   └── styles/        # CSS modules
│   ├── .env               # Frontend config
│   └── index.html         # HTML template
│
├── README.md              # Main documentation
├── SETUP.md              # Setup scripts
├── DEPLOYMENT.md         # Production deployment
└── PAYHERE_INTEGRATION.md # PayHere guide
```

---

## API Endpoints

### Public

- `POST /api/tickets/book` - Create booking
- `GET /api/tickets/:ticketNumber` - Get ticket details
- `GET /api/tickets/order/:orderId` - Get ticket by order
- `GET /api/tickets/:ticketNumber/download` - Download PDF
- `POST /api/payment/notify` - PayHere webhook

### Admin (requires password)

- `GET /api/admin/tickets` - List all tickets
- `GET /api/admin/statistics` - Get statistics

---

## What's Next?

### For Development

- Customize event details in `backend/.env`
- Modify PDF template in `backend/templates/ticket.html`
- Update colors/branding in `frontend/src/styles/`

### For Production

Read `DEPLOYMENT.md` for complete deployment guide including:

- VPS/Server deployment
- Domain configuration
- SSL setup
- Production PayHere configuration
- Email delivery setup

---

## Need Help?

### Documentation

- `README.md` - Complete feature list and setup
- `DEPLOYMENT.md` - Production deployment guide
- `PAYHERE_INTEGRATION.md` - Payment gateway setup

### Testing

- PayHere Sandbox: https://sandbox.payhere.lk/
- PayHere Docs: https://support.payhere.lk/

### Quick Commands

```powershell
# Start both servers (open 2 terminals)
# Terminal 1: Backend
cd backend; npm run dev

# Terminal 2: Frontend
cd frontend; npm run dev

# Check backend health
curl http://localhost:5000/health

# View backend logs
# Check the terminal running backend

# Build for production
cd frontend; npm run build
```

---

## 🎉 You're All Set!

The system is now running:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Admin: http://localhost:5173/admin

Start booking tickets for your movie night! 🍿
