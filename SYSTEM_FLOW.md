# System Flow Diagram - IJSE Movie Night Ticket Booking

## 🎫 Complete Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                  │
└─────────────────────────────────────────────────────────────────────┘

     User Opens Website
            │
            ▼
     ┌──────────────┐
     │ Booking Form │  (React Component)
     │              │  • Name input
     │              │  • Email input
     │              │  • Phone input
     │              │  • Validation
     └──────┬───────┘
            │ Clicks "Proceed to Payment"
            ▼
     ┌──────────────────┐
     │ POST /api/tickets/book │  (Backend API)
     │                        │  • Validate input
     │                        │  • Generate ticket number (6 digits)
     │                        │  • Create order ID
     │                        │  • Save to MongoDB (status: pending)
     │                        │  • Generate PayHere hash
     └──────┬─────────────────┘
            │ Returns payment data
            ▼
     ┌──────────────────┐
     │ PayHere Checkout │  (Payment Gateway)
     │                  │  • Shows payment form
     │                  │  • User enters card details
     │                  │  • Processes payment
     └──────┬───────────┘
            │
            ├─── Payment Success ─────┐
            │                         │
            ▼                         │
     ┌──────────────────┐            │
     │ PayHere Webhook  │            │
     │ POST /api/payment/notify │    │
     │                           │   │
     │ • Verify signature        │   │
     │ • Update ticket (paid)    │   │
     │ • Generate PDF            │   │
     │ • Send email              │   │
     └───────────────────────────┘   │
                                     │
                                     ▼
                           ┌──────────────────┐
                           │  Success Page     │
                           │                   │
                           │ • Show ticket #   │
                           │ • Show details    │
                           │ • Download button │
                           └────────┬──────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ GET /api/tickets │
                           │ /:ticketNumber/  │
                           │ download         │
                           │                  │
                           │ • Generate PDF   │
                           │ • Return file    │
                           └──────────────────┘
                                    │
                                    ▼
                                 PDF Ticket
                          (User downloads/receives)
```

## 🔄 Payment Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PayHere Webhook Processing                    │
└─────────────────────────────────────────────────────────────────┘

PayHere Server
      │
      │ POST /api/payment/notify
      │ merchant_id, order_id, payment_id,
      │ amount, status_code, md5sig
      ▼
┌───────────────────┐
│ paymentController │
│   .notify()       │
└─────┬─────────────┘
      │
      ▼
┌───────────────────┐
│ paymentService    │
│ .processNotification() │
│                        │
│ 1. Verify Signature    │
│    ├─ Calculate MD5    │
│    └─ Compare hashes   │
│                        │
│ 2. Check Status Code   │
│    ├─ 2 = Success      │
│    ├─ 0 = Pending      │
│    └─ -x = Failed      │
└─────┬──────────────────┘
      │
      ├── IF SUCCESS ──────┐
      │                    │
      ▼                    │
┌───────────────────┐     │
│ ticketService     │     │
│ .confirmPayment() │     │
│                   │     │
│ • Update status   │     │
│ • Save payment_id │     │
└─────┬─────────────┘     │
      │                   │
      ▼                   │
┌───────────────────┐     │
│ pdfService        │     │
│ .generateTicket() │     │
│                   │     │
│ • Load template   │     │
│ • Puppeteer PDF   │     │
│ • Return buffer   │     │
└─────┬─────────────┘     │
      │                   │
      ▼                   │
┌───────────────────┐     │
│ emailService      │     │
│ .sendTicketEmail()│     │
│                   │     │
│ • HTML template   │     │
│ • Attach PDF      │     │
│ • Send via SMTP   │     │
└───────────────────┘     │
                          │
      ├── IF FAILED ───────┘
      │
      ▼
┌───────────────────┐
│ ticketService     │
│ .failPayment()    │
│                   │
│ • Update status   │
│ • Log failure     │
└───────────────────┘
```

## 🎯 Admin Dashboard Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Access Flow                        │
└─────────────────────────────────────────────────────────────┘

Admin Opens /admin
      │
      ▼
┌──────────────┐
│ Login Screen │
│              │  • Password input
│              │  • Submit button
└──────┬───────┘
       │ Enters password
       ▼
┌─────────────────────┐
│ adminAuth Middleware│  (Backend)
│                     │  • Check Authorization header
│                     │  • Verify password
│                     │  • Allow/Deny
└──────┬──────────────┘
       │ IF AUTHENTICATED
       ▼
┌──────────────────────┐
│ GET /api/admin/      │
│ statistics           │
│                      │
│ • Total tickets      │
│ • Paid tickets       │
│ • Pending tickets    │
│ • Total revenue      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ GET /api/admin/      │
│ tickets              │
│                      │
│ • Query MongoDB      │
│ • Filter by status   │
│ • Sort by date       │
│ • Return array       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Admin Dashboard      │  (React)
│                      │
│ ┌────────────────┐  │
│ │  Statistics    │  │
│ │  Cards (4)     │  │
│ └────────────────┘  │
│                      │
│ ┌────────────────┐  │
│ │  Filters       │  │
│ │  All/Paid/Pend │  │
│ └────────────────┘  │
│                      │
│ ┌────────────────┐  │
│ │  Tickets Table │  │
│ │  (Sortable)    │  │
│ └────────────────┘  │
└──────────────────────┘
```

## 💾 Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Collections                       │
└─────────────────────────────────────────────────────────────┘

Collection: tickets

┌───────────────────────────────────────────────────┐
│ Document (Single Ticket)                          │
├───────────────────────────────────────────────────┤
│ _id: ObjectId (auto)                              │
│ ticketNumber: String (6 digits, unique, indexed)  │
│ orderId: String (unique, indexed)                 │
│ fullName: String                                  │
│ email: String (indexed)                           │
│ phone: String                                     │
│ amount: Number                                    │
│ currency: String (default: "LKR")                 │
│ paymentStatus: Enum ["pending", "paid", "failed"] │
│ paymentId: String (nullable)                      │
│ paymentMethod: String (nullable)                  │
│ isRedeemed: Boolean (default: false)              │
│ redeemedAt: Date (nullable)                       │
│ emailSent: Boolean (default: false)               │
│ emailSentAt: Date (nullable)                      │
│ pdfGenerated: Boolean (default: false)            │
│ createdAt: Date (auto)                            │
│ updatedAt: Date (auto)                            │
└───────────────────────────────────────────────────┘

Indexes:
  • ticketNumber (unique)
  • orderId (unique)
  • email + createdAt (compound)
  • paymentStatus + createdAt (compound)
```

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ BookingForm  │  │ SuccessPage  │  │ AdminDashboard│         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘         │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │ API Service │                              │
│                    │   (Axios)   │                              │
│                    └──────┬──────┘                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTP/HTTPS
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                       BACKEND (Express)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Middleware Layer                       │ │
│  │  • CORS  • Helmet  • Rate Limit  • Body Parser            │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │                       Routes Layer                          │ │
│  │  /tickets  /payment  /admin                                │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │                   Controllers Layer                         │ │
│  │  ticketController  paymentController  adminController      │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │                    Services Layer                           │ │
│  │  ticketService  paymentService  pdfService  emailService   │ │
│  └────────┬──────────────┬──────────────┬──────────────┬──────┘ │
│           │              │              │              │         │
│           ▼              ▼              ▼              ▼         │
│     ┌─────────┐    ┌─────────┐    ┌─────────┐  ┌─────────┐    │
│     │ MongoDB │    │ PayHere │    │Puppeteer│  │Nodemailer│    │
│     │(Mongoose)│    │   API   │    │  (PDF)  │  │ (SMTP)  │    │
│     └─────────┘    └─────────┘    └─────────┘  └─────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Sequence

```
Booking Creation:
  User Input → Validation → Database → PayHere → Webhook → PDF → Email

Payment Verification:
  PayHere → Webhook → Signature Check → Database Update → PDF Generation

Ticket Retrieval:
  Admin Request → Auth Check → Database Query → Response

PDF Generation:
  Template Load → Data Population → Puppeteer Render → Buffer Return
```

## 🎨 Component Hierarchy

```
App
├── Router
    ├── Route "/" → BookingForm
    │   ├── Event Info Cards
    │   ├── Form Fields
    │   │   ├── Name Input
    │   │   ├── Email Input
    │   │   └── Phone Input
    │   └── Submit Button
    │
    ├── Route "/success" → SuccessPage
    │   ├── Success Icon
    │   ├── Ticket Info Card
    │   │   ├── Ticket Number
    │   │   └── Details Grid
    │   ├── Download Button
    │   └── Email Notice
    │
    └── Route "/admin" → AdminDashboard
        ├── Login Screen (conditional)
        ├── Dashboard (authenticated)
        │   ├── Header
        │   ├── Statistics Cards (4)
        │   ├── Filter Buttons
        │   └── Tickets Table
        └── Logout Button
```

## 🔐 Security Flow

```
Request → Rate Limiter → CORS Check → Helmet Headers
    → Body Parser → Route Handler → Validation
    → Authorization (admin) → Controller
    → Service → Database
    → Response ← Error Handler ← Async Wrapper
```

---

## 📌 Key Integration Points

1. **PayHere Integration**

   - Frontend: PayHere JS SDK (payhere.startPayment)
   - Backend: Webhook handler (/api/payment/notify)
   - Security: MD5 signature verification

2. **MongoDB Integration**

   - Connection: Mongoose with connection string
   - Models: Ticket schema with validation
   - Queries: Indexed for performance

3. **PDF Generation**

   - Engine: Puppeteer (headless Chrome)
   - Template: HTML file with placeholders
   - Output: PDF buffer

4. **Email Delivery**
   - Protocol: SMTP (Nodemailer)
   - Content: HTML template + PDF attachment
   - Fallback: Works without email configured

---

## 🚀 Deployment Topology

```
Production Environment:

┌──────────────────────────────────────────────────┐
│                  Internet                         │
└─────────────────┬────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │   Domain DNS    │
         │ your-domain.com │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  SSL/HTTPS      │
         │  Certificate    │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │     Nginx       │
         │ Reverse Proxy   │
         └────┬───────┬────┘
              │       │
    Frontend  │       │  Backend
    (Static)  │       │  (Node.js + PM2)
              │       │
         ┌────▼────┐ ┌▼────────────┐
         │  React  │ │   Express   │
         │  (Dist) │ │   Server    │
         └─────────┘ └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │  MongoDB    │
                     │   Atlas     │
                     └─────────────┘

External Services:
  • PayHere API (payments)
  • SMTP Server (emails)
```

This visual guide complements the written documentation!
