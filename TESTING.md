# Testing Checklist - IJSE Movie Night Ticket Booking

Use this checklist to verify all features before going live.

## ✅ Pre-Testing Setup

- [ ] MongoDB Atlas connected successfully
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] PayHere sandbox configured
- [ ] Admin password set

---

## 🎫 Booking Flow Testing

### Test Case 1: Successful Booking

- [ ] Open http://localhost:5173
- [ ] Fill form with valid data:
  - Name: Test User
  - Email: test@example.com
  - Phone: 0771234567
- [ ] Click "Proceed to Payment"
- [ ] PayHere checkout opens (or auto-redirects in dev)
- [ ] Complete payment with test card
- [ ] Redirected to success page
- [ ] Ticket number displayed correctly
- [ ] All details shown (name, email, amount, order ID)
- [ ] "Download Ticket" button works
- [ ] PDF opens in new tab
- [ ] PDF contains correct information
- [ ] PDF has IJSE branding (red/black colors)

**Expected Result:** Ticket booked successfully, PDF generated, payment status = paid

### Test Case 2: Form Validation

- [ ] Try submitting empty form → See error messages
- [ ] Enter invalid email → See "Invalid email format"
- [ ] Enter invalid phone → See "Invalid Sri Lankan phone number"
- [ ] Enter name with 1 character → See "Name must be at least 2 characters"

**Expected Result:** All validation errors display correctly

### Test Case 3: Duplicate Ticket Numbers

- [ ] Create 5 bookings quickly
- [ ] Check all tickets have unique 6-digit numbers
- [ ] No duplicates in database

**Expected Result:** All ticket numbers are unique

---

## 💳 Payment Testing

### Test Case 4: PayHere Integration

- [ ] Create booking
- [ ] PayHere sandbox loads (check browser console)
- [ ] Test card works: 4916 2174 0221 3361
- [ ] Payment completes successfully
- [ ] Webhook received (check backend logs)
- [ ] Ticket status updated to "paid"

**Expected Result:** Payment flow completes end-to-end

### Test Case 5: Payment Cancellation

- [ ] Create booking
- [ ] Click "Proceed to Payment"
- [ ] Cancel payment in PayHere
- [ ] See appropriate message
- [ ] Ticket remains in "pending" status

**Expected Result:** Ticket not marked as paid

---

## 📄 PDF Generation Testing

### Test Case 6: PDF Content

- [ ] Complete a booking
- [ ] Download PDF
- [ ] Verify PDF contains:
  - [ ] Ticket number (large, red)
  - [ ] Event name (IJSE Movie Night 2025)
  - [ ] Event date, time, venue
  - [ ] Attendee name
  - [ ] Attendee email
  - [ ] Attendee phone
  - [ ] Order ID
  - [ ] Amount paid (LKR 350.00)
  - [ ] Purchase date
  - [ ] Important instructions
  - [ ] QR code placeholder
  - [ ] Footer with IJSE branding

**Expected Result:** PDF is complete and professional

### Test Case 7: PDF Styling

- [ ] PDF uses red (#DC143C) and black colors
- [ ] Gradients render correctly
- [ ] Text is readable
- [ ] Layout is clean
- [ ] No overlapping elements

**Expected Result:** PDF looks professional and branded

---

## 📧 Email Testing (if SMTP configured)

### Test Case 8: Email Delivery

- [ ] Complete booking with real email
- [ ] Check inbox for ticket email
- [ ] Email contains:
  - [ ] Subject: "Your IJSE Movie Night 2025 Ticket - #[number]"
  - [ ] Professional HTML layout
  - [ ] Event details
  - [ ] Booking details
  - [ ] PDF attachment
- [ ] PDF opens from email

**Expected Result:** Email received with PDF attachment

### Test Case 9: Email Fallback

- [ ] Remove SMTP credentials from .env
- [ ] Restart backend
- [ ] Complete booking
- [ ] PDF still generated
- [ ] Can download from success page
- [ ] Backend logs "Email not configured"

**Expected Result:** System works without email

---

## 🔐 Admin Dashboard Testing

### Test Case 10: Admin Login

- [ ] Navigate to http://localhost:5173/admin
- [ ] Try wrong password → See error
- [ ] Enter correct password
- [ ] Dashboard loads successfully

**Expected Result:** Authentication works correctly

### Test Case 11: Admin Statistics

- [ ] Create 3 bookings (2 paid, 1 pending)
- [ ] Login to admin
- [ ] Verify statistics show:
  - [ ] Total Bookings: 3
  - [ ] Paid Tickets: 2
  - [ ] Pending: 1
  - [ ] Total Revenue: LKR 700.00

**Expected Result:** Statistics accurate

### Test Case 12: Ticket List

- [ ] All tickets visible in table
- [ ] Table shows:
  - [ ] Ticket number
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Amount
  - [ ] Payment status (with colored badge)
  - [ ] Date/time
- [ ] Table is sortable by date (newest first)

**Expected Result:** All ticket details displayed

### Test Case 13: Filtering

- [ ] Click "All" filter → All tickets shown
- [ ] Click "Paid" filter → Only paid tickets shown
- [ ] Click "Pending" filter → Only pending tickets shown

**Expected Result:** Filters work correctly

---

## 📱 Responsive Design Testing

### Test Case 14: Mobile (375px)

- [ ] Open in mobile view (Chrome DevTools)
- [ ] Booking form is readable
- [ ] All fields accessible
- [ ] Button not cut off
- [ ] Event info cards stack vertically
- [ ] Success page displays correctly
- [ ] Admin table scrolls horizontally

**Expected Result:** Mobile-friendly layout

### Test Case 15: Tablet (768px)

- [ ] Test in tablet view
- [ ] Layout adjusts appropriately
- [ ] No horizontal scrolling (except table)
- [ ] Images/text scale correctly

**Expected Result:** Tablet-optimized

### Test Case 16: Desktop (1920px)

- [ ] Test on large screen
- [ ] Content centered
- [ ] Not too wide
- [ ] Margins appropriate

**Expected Result:** Desktop-optimized

---

## 🔒 Security Testing

### Test Case 17: Input Sanitization

- [ ] Try SQL injection in name: `'; DROP TABLE tickets; --`
- [ ] Try XSS in name: `<script>alert('xss')</script>`
- [ ] System handles gracefully

**Expected Result:** No injection vulnerabilities

### Test Case 18: Admin Protection

- [ ] Try accessing `/api/admin/tickets` without password
- [ ] Should get 401 Unauthorized
- [ ] Try wrong password → 401
- [ ] Correct password → 200 OK

**Expected Result:** Admin endpoints protected

### Test Case 19: Rate Limiting

- [ ] Make 110 requests rapidly to any endpoint
- [ ] After 100, should get "Too many requests"
- [ ] Wait 15 minutes → Reset

**Expected Result:** Rate limiting works

---

## 🐛 Error Handling Testing

### Test Case 20: Database Disconnection

- [ ] Stop MongoDB Atlas (or use wrong URI)
- [ ] Try creating booking
- [ ] Should see error message
- [ ] Backend doesn't crash

**Expected Result:** Graceful error handling

### Test Case 21: Invalid Order ID

- [ ] Navigate to `/success?order_id=INVALID123`
- [ ] Should see "Order not found" or similar
- [ ] No crash

**Expected Result:** Error handled gracefully

### Test Case 22: Network Timeout

- [ ] Simulate slow network (Chrome DevTools)
- [ ] Submit booking form
- [ ] Loading state shows
- [ ] Either succeeds or shows error

**Expected Result:** Loading states work

---

## 🌐 Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

**Expected Result:** Works in all major browsers

---

## 🚀 Performance Testing

### Test Case 23: Page Load Speed

- [ ] Homepage loads < 2 seconds
- [ ] Success page loads < 1 second
- [ ] Admin dashboard loads < 3 seconds

**Expected Result:** Fast load times

### Test Case 24: PDF Generation Speed

- [ ] PDF generates in < 5 seconds
- [ ] No timeout errors

**Expected Result:** Quick PDF generation

---

## 📊 Database Testing

### Test Case 25: Data Persistence

- [ ] Create booking
- [ ] Restart backend server
- [ ] Booking still exists in admin
- [ ] Can still download PDF

**Expected Result:** Data persists

### Test Case 26: Concurrent Bookings

- [ ] Open 3 browser tabs
- [ ] Submit bookings simultaneously
- [ ] All 3 succeed
- [ ] No duplicate ticket numbers

**Expected Result:** Handles concurrency

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All test cases pass
- [ ] MongoDB production cluster ready
- [ ] PayHere production credentials configured
- [ ] SMTP email configured
- [ ] Admin password is strong
- [ ] Environment variables set for production
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] PayHere webhook URL updated
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Error logging configured

---

## 📝 Test Results

| Test Case                | Status                     | Notes |
| ------------------------ | -------------------------- | ----- |
| TC1: Successful Booking  | ⬜ Pass / ⬜ Fail          |       |
| TC2: Form Validation     | ⬜ Pass / ⬜ Fail          |       |
| TC3: Unique Tickets      | ⬜ Pass / ⬜ Fail          |       |
| TC4: PayHere             | ⬜ Pass / ⬜ Fail          |       |
| TC5: Cancel Payment      | ⬜ Pass / ⬜ Fail          |       |
| TC6: PDF Content         | ⬜ Pass / ⬜ Fail          |       |
| TC7: PDF Styling         | ⬜ Pass / ⬜ Fail          |       |
| TC8: Email Delivery      | ⬜ Pass / ⬜ Fail / ⬜ N/A |       |
| TC9: Email Fallback      | ⬜ Pass / ⬜ Fail          |       |
| TC10: Admin Login        | ⬜ Pass / ⬜ Fail          |       |
| TC11: Statistics         | ⬜ Pass / ⬜ Fail          |       |
| TC12: Ticket List        | ⬜ Pass / ⬜ Fail          |       |
| TC13: Filtering          | ⬜ Pass / ⬜ Fail          |       |
| TC14: Mobile             | ⬜ Pass / ⬜ Fail          |       |
| TC15: Tablet             | ⬜ Pass / ⬜ Fail          |       |
| TC16: Desktop            | ⬜ Pass / ⬜ Fail          |       |
| TC17: Input Sanitization | ⬜ Pass / ⬜ Fail          |       |
| TC18: Admin Protection   | ⬜ Pass / ⬜ Fail          |       |
| TC19: Rate Limiting      | ⬜ Pass / ⬜ Fail          |       |
| TC20: DB Disconnect      | ⬜ Pass / ⬜ Fail          |       |
| TC21: Invalid Order      | ⬜ Pass / ⬜ Fail          |       |
| TC22: Network Timeout    | ⬜ Pass / ⬜ Fail          |       |
| TC23: Page Load          | ⬜ Pass / ⬜ Fail          |       |
| TC24: PDF Speed          | ⬜ Pass / ⬜ Fail          |       |
| TC25: Data Persistence   | ⬜ Pass / ⬜ Fail          |       |
| TC26: Concurrency        | ⬜ Pass / ⬜ Fail          |       |

**Overall Status:** ⬜ Ready for Production / ⬜ Needs Work

**Tested By:** ******\_\_\_******
**Date:** ******\_\_\_******
**Signature:** ******\_\_\_******
