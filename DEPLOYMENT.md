# Deployment Guide - IJSE Movie Night Ticket Booking

## Pre-Deployment Checklist

### Environment Configuration

#### Backend Environment Variables

Create `backend/.env` with:

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-tickets?retryWrites=true&w=majority

# PayHere (Production)
PAYHERE_MERCHANT_ID=your_live_merchant_id
PAYHERE_MERCHANT_SECRET=your_live_merchant_secret
PAYHERE_SANDBOX=false

# Email (Production SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=IJSE Movie Night <noreply@ijse.lk>

# Admin
ADMIN_PASSWORD=create_strong_password_here

# Application
FRONTEND_URL=https://your-frontend-domain.com
TICKET_PRICE=350
CURRENCY=LKR

# Event Details
EVENT_NAME=IJSE Movie Night 2025
EVENT_DATE=December 15, 2025
EVENT_TIME=7:00 PM
EVENT_VENUE=IJSE Campus Auditorium
```

#### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=https://your-api-domain.com/api
```

---

## Deployment Options

### Option 1: Deploy to VPS/Server (Recommended for IJSE)

This option gives you full control and is cost-effective for campus events.

#### Requirements

- Ubuntu/Debian server (20.04 LTS recommended)
- Node.js 18+
- Nginx (reverse proxy)
- MongoDB Atlas account
- Domain name (optional but recommended)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 2: Upload Code

```bash
# On your local machine, create deployment package
cd d:\ticker_booking
# Exclude node_modules and .env files
# Upload via SCP, FTP, or Git

# On server
cd /var/www
sudo git clone your-repository-url movie-night
cd movie-night
```

#### Step 3: Install Dependencies

```bash
# Backend
cd /var/www/movie-night/backend
npm install --production

# Frontend (build for production)
cd /var/www/movie-night/frontend
npm install
npm run build
```

#### Step 4: Configure Environment

```bash
# Backend
cd /var/www/movie-night/backend
nano .env
# Paste production environment variables

# Set permissions
chmod 600 .env
```

#### Step 5: Start Backend with PM2

```bash
cd /var/www/movie-night/backend
pm2 start server.js --name "movie-night-api"
pm2 save
pm2 startup
```

#### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/movie-night
```

Paste this configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/movie-night/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/movie-night /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 7: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

#### Step 8: Configure PayHere Webhook

In PayHere merchant dashboard, set notification URL:

```
https://api.your-domain.com/api/payment/notify
```

---

### Option 2: Deploy to Heroku (Quick & Easy)

#### Backend Deployment

```bash
cd backend

# Create Heroku app
heroku create movie-night-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set PAYHERE_MERCHANT_ID="your_merchant_id"
heroku config:set PAYHERE_MERCHANT_SECRET="your_secret"
# ... set all other env vars

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a movie-night-api
git push heroku main
```

#### Frontend Deployment (Netlify/Vercel)

```bash
cd frontend

# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Or deploy to Vercel
vercel --prod
```

---

### Option 3: Deploy to Railway (Modern Platform)

1. Go to https://railway.app
2. Create new project
3. Add backend (Node.js)
4. Add environment variables
5. Deploy from GitHub
6. Get deployment URL
7. Deploy frontend to Vercel/Netlify

---

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create free cluster (M0)
4. Choose region closest to your server
5. Create database: `movie-tickets`

### 2. Configure Access

1. Database Access → Add user
2. Network Access → Add IP Address
   - For testing: `0.0.0.0/0` (allow all)
   - For production: Add your server IP

### 3. Get Connection String

1. Clusters → Connect → Connect your application
2. Copy connection string
3. Replace `<password>` with your password
4. Replace `<dbname>` with `movie-tickets`

---

## Email Configuration (Gmail)

### 1. Enable 2-Factor Authentication

1. Go to Google Account settings
2. Security → 2-Step Verification → Turn on

### 2. Create App Password

1. Security → App passwords
2. Select app: Mail
3. Select device: Other (custom name)
4. Generate
5. Copy the 16-character password

### 3. Configure in .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=generated_app_password
```

**Alternatives:**

- SendGrid (Recommended for production)
- Mailgun
- Amazon SES

---

## Post-Deployment Testing

### 1. Test Health Endpoint

```bash
curl https://api.your-domain.com/health
```

### 2. Test Booking Flow

1. Open frontend URL
2. Fill booking form
3. Complete payment (use test card in sandbox)
4. Verify ticket received

### 3. Test Admin Dashboard

1. Navigate to `/admin`
2. Login with ADMIN_PASSWORD
3. Verify ticket list displays

### 4. Test PDF Download

1. Complete a booking
2. Click "Download Ticket"
3. Verify PDF opens correctly

---

## Monitoring & Maintenance

### Backend Logs (PM2)

```bash
# View logs
pm2 logs movie-night-api

# Monitor
pm2 monit

# Restart
pm2 restart movie-night-api
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Monitoring

- Use MongoDB Atlas dashboard
- Set up alerts for high usage

---

## Security Best Practices

✅ **HTTPS Only:** Always use SSL in production
✅ **Strong Passwords:** Use complex admin password
✅ **Environment Variables:** Never commit .env files
✅ **Rate Limiting:** Already implemented in backend
✅ **Input Validation:** Already implemented
✅ **Database Backups:** Enable in MongoDB Atlas

---

## Troubleshooting

### Backend won't start

- Check `pm2 logs`
- Verify MongoDB connection
- Check port availability

### Payment webhook not working

- Verify webhook URL is accessible
- Check PayHere signature validation
- Review backend logs

### Emails not sending

- Verify SMTP credentials
- Check spam folder
- Try SendGrid instead

### Frontend not loading

- Check API URL in frontend .env
- Verify CORS settings in backend
- Check browser console

---

## Scaling for Large Events

If expecting 1000+ bookings:

1. **Database:** Upgrade MongoDB cluster
2. **Server:** Use PM2 cluster mode
   ```bash
   pm2 start server.js -i max
   ```
3. **Caching:** Add Redis for sessions
4. **CDN:** Use Cloudflare for frontend
5. **Load Balancer:** Use Nginx load balancing

---

## Support & Maintenance

Regular maintenance tasks:

- Monitor server disk space
- Review error logs weekly
- Update dependencies monthly
- Backup database regularly
- Test payment flow before events

For questions, contact the IJSE IT team.
