# Handling Abandoned/Orphaned Pending Payments

## The Problem

**Scenario:**

1. User fills booking form
2. Backend creates pending ticket record in database
3. PayHere payment window starts loading
4. **Connection drops/User closes tab/Browser crashes**
5. Record stays in database with "pending" status forever
6. User tries again → Creates NEW record (duplicate data)

**Result:** Database fills with abandoned "pending" tickets that will never be completed.

---

## ✅ Solution: Multi-Layered Approach

### Strategy 1: Automatic Cleanup Script (RECOMMENDED)

**What:** Periodically delete pending tickets older than X minutes

**Implementation:**

- ✅ Created: `scripts/cleanup-abandoned-tickets.js`
- ✅ NPM command: `npm run cleanup-abandoned`
- ✅ Default threshold: 30 minutes (configurable)

**Usage:**

```bash
# Manual run
cd /var/www/ticket-booking/backend
npm run cleanup-abandoned

# With custom threshold
CLEANUP_AGE_MINUTES=15 npm run cleanup-abandoned
```

**Output:**

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

🕐 Cleanup threshold: 30 minutes
📅 Cutoff time: 2025-01-15T10:00:00.000Z

📊 Found 5 abandoned ticket(s)

🗑️  Tickets to be deleted:
   - 458392 | John Doe | john@example.com | Age: 45 minutes
   - 567123 | Jane Smith | jane@example.com | Age: 60 minutes
   - 789456 | Bob Wilson | bob@example.com | Age: 35 minutes

✅ Successfully deleted 5 abandoned ticket(s)
✨ Cleanup completed successfully!
```

---

### Strategy 2: Automated Cron Job (PRODUCTION)

**Setup on Digital Ocean Server:**

```bash
# SSH into server
ssh deployer@64.227.176.19

# Edit crontab
crontab -e

# Add this line (runs every 30 minutes)
*/30 * * * * cd /var/www/ticket-booking/backend && /usr/bin/node scripts/cleanup-abandoned-tickets.js >> /var/www/ticket-booking/logs/cleanup.log 2>&1

# Or run every hour at minute 0
0 * * * * cd /var/www/ticket-booking/backend && /usr/bin/node scripts/cleanup-abandoned-tickets.js >> /var/www/ticket-booking/logs/cleanup.log 2>&1

# Or run every 15 minutes (more aggressive)
*/15 * * * * cd /var/www/ticket-booking/backend && /usr/bin/node scripts/cleanup-abandoned-tickets.js >> /var/www/ticket-booking/logs/cleanup.log 2>&1
```

**Verify cron job:**

```bash
# List cron jobs
crontab -l

# Check cleanup logs
tail -f /var/www/ticket-booking/logs/cleanup.log
```

**Cron Schedule Explained:**

```
*/30 * * * *  = Every 30 minutes
*/15 * * * *  = Every 15 minutes
0 * * * *     = Every hour (at minute 0)
0 */2 * * *   = Every 2 hours
0 0 * * *     = Daily at midnight
```

---

### Strategy 3: Database TTL Index (ALTERNATIVE)

**What:** MongoDB automatically deletes documents after X time

**Implementation:**

Add to `backend/src/models/Ticket.js`:

```javascript
// Add TTL index for pending tickets
ticketSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 1800, // 30 minutes
    partialFilterExpression: { paymentStatus: "pending" },
  }
);
```

**Pros:**

- ✅ Automatic (no cron job needed)
- ✅ Built into MongoDB
- ✅ No server resources needed

**Cons:**

- ❌ Less precise timing (MongoDB checks every 60 seconds)
- ❌ Cannot control which tickets to keep
- ❌ Less flexible

---

### Strategy 4: Frontend Timeout (COMPLEMENTARY)

**What:** Show warning message after timeout, allow user to retry with same record

**Implementation in `BookingForm.jsx`:**

```javascript
useEffect(() => {
  if (bookingData) {
    // Set timeout for 10 minutes
    const timeoutId = setTimeout(() => {
      alert("Payment window has expired. Please try booking again.");
      setBookingData(null);
      // Optionally delete the pending record
      api.delete(`/tickets/${bookingData.ticketNumber}`).catch(console.error);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearTimeout(timeoutId);
  }
}, [bookingData]);
```

**Pros:**

- ✅ User-friendly
- ✅ Immediate cleanup
- ✅ No abandoned records

**Cons:**

- ❌ Doesn't work if user closes tab
- ❌ Doesn't work if connection drops before timeout

---

## 🎯 Recommended Solution

**Use a combination:**

### 1. Cron Job (Primary Method)

```bash
# Run every 30 minutes
*/30 * * * * cd /var/www/ticket-booking/backend && /usr/bin/node scripts/cleanup-abandoned-tickets.js >> /var/www/ticket-booking/logs/cleanup.log 2>&1
```

### 2. Configuration

```env
# In backend/.env
CLEANUP_AGE_MINUTES=30
```

### 3. Monitor Logs

```bash
# Check what's being cleaned up
tail -f /var/www/ticket-booking/logs/cleanup.log
```

---

## 📊 Best Practices

### Choosing Cleanup Threshold

**Aggressive (15 minutes):**

- ✅ Keeps database clean
- ✅ Reduces clutter quickly
- ❌ Might delete legitimate slow payments

**Moderate (30 minutes) - RECOMMENDED:**

- ✅ Good balance
- ✅ Enough time for payment completion
- ✅ Reasonable cleanup speed

**Conservative (60 minutes):**

- ✅ Safe for slow connections
- ✅ Handles payment retries
- ❌ More database clutter

### Considerations

1. **Payment Gateway Timeout:**

   - PayHere sessions usually expire after 15 minutes
   - 30-minute cleanup is safe

2. **User Behavior:**

   - Users might abandon cart
   - Connection issues common in Sri Lanka
   - Mobile data interruptions

3. **Database Size:**

   - Each pending ticket is small (~1KB)
   - 1000 pending tickets = ~1MB
   - Not a huge concern unless massive scale

4. **Event Timing:**
   - Week before event: Be more aggressive (15 min)
   - Month before event: Be more conservative (60 min)

---

## 🔍 Monitoring

### Check Abandoned Tickets (Manual)

```bash
# Connect to MongoDB Atlas via mongo shell or Compass
# Or use this Node.js script:

node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Ticket = mongoose.model('Ticket', new mongoose.Schema({}, { strict: false }));

  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - 30);

  const count = await Ticket.countDocuments({
    paymentStatus: 'pending',
    createdAt: { \$lt: cutoff }
  });

  console.log('Abandoned tickets (>30 min):', count);
  mongoose.connection.close();
});
"
```

### Dashboard Statistics

Add to admin dashboard:

```javascript
// In ticketService.js getStatistics()
const abandonedTickets = await Ticket.countDocuments({
  paymentStatus: "pending",
  createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) },
});

return {
  totalTickets,
  paidTickets,
  pendingTickets,
  abandonedTickets, // NEW
  redeemedTickets,
  totalRevenue,
};
```

---

## 🚀 Implementation Steps

### Step 1: Update Environment

```bash
# On server
ssh deployer@64.227.176.19
cd /var/www/ticket-booking/backend
nano .env

# Add this line
CLEANUP_AGE_MINUTES=30
```

### Step 2: Test Script Manually

```bash
# Run cleanup script
npm run cleanup-abandoned

# Check output
# Verify correct tickets are being deleted
```

### Step 3: Setup Cron Job

```bash
# Edit crontab
crontab -e

# Add cron job (every 30 minutes)
*/30 * * * * cd /var/www/ticket-booking/backend && /usr/bin/node scripts/cleanup-abandoned-tickets.js >> /var/www/ticket-booking/logs/cleanup.log 2>&1

# Save and exit (Ctrl+X, Y, Enter in nano)
```

### Step 4: Verify Cron Job

```bash
# Check cron is running
crontab -l

# Wait 30 minutes and check logs
tail -f /var/www/ticket-booking/logs/cleanup.log
```

### Step 5: Monitor

```bash
# Check logs regularly
tail -f /var/www/ticket-booking/logs/cleanup.log

# Check how many tickets are being cleaned up
# Adjust CLEANUP_AGE_MINUTES if needed
```

---

## 🎛️ Configuration Options

### Environment Variables

```env
# Cleanup threshold (minutes)
CLEANUP_AGE_MINUTES=30

# Cron schedule options:
# Every 15 minutes: */15 * * * *
# Every 30 minutes: */30 * * * *
# Every hour: 0 * * * *
# Every 2 hours: 0 */2 * * *
# Daily at 2 AM: 0 2 * * *
```

### Customization

Edit `scripts/cleanup-abandoned-tickets.js`:

```javascript
// Add whitelist for testing
const WHITELIST_EMAILS = ["test@example.com"];

const abandonedTickets = await Ticket.find({
  paymentStatus: "pending",
  createdAt: { $lt: cutoffTime },
  email: { $nin: WHITELIST_EMAILS }, // Don't delete test emails
});
```

---

## 📈 Expected Results

**Before Cleanup:**

- Database: 500 total tickets
- Pending: 200 (100 recent, 100 abandoned)
- Paid: 300

**After Cleanup (30 min threshold):**

- Database: 400 total tickets
- Pending: 100 (recent only)
- Paid: 300
- **Deleted: 100 abandoned tickets**

**Database Size Reduction:**

- ~100 KB per cleanup run
- Over a month: ~500 KB saved
- Cleaner analytics and reporting

---

## ✅ Summary

**Problem:** Abandoned pending payments clutter database  
**Solution:** Automated cleanup script with cron job  
**Threshold:** 30 minutes (configurable)  
**Schedule:** Every 30 minutes via cron  
**Result:** Clean database, accurate statistics

**Commands:**

```bash
# Manual cleanup
npm run cleanup-abandoned

# Setup cron
crontab -e
# Add: */30 * * * * cd /var/www/ticket-booking/backend && /usr/bin/node scripts/cleanup-abandoned-tickets.js >> /var/www/ticket-booking/logs/cleanup.log 2>&1

# Monitor
tail -f /var/www/ticket-booking/logs/cleanup.log
```

**Done! Your system now automatically handles abandoned payments.** 🎉
