# 🚀 CI/CD Deployment Guide - Digital Ocean + GitHub Actions

Complete guide for deploying IJSE Movie Night Ticket Booking system with automated CI/CD pipeline.

## 📋 Quick Overview

- **Frontend**: React + Vite → Nginx (served as static files)
- **Backend**: Node.js + Express → PM2 (process manager)
- **Database**: MongoDB Atlas (cloud-hosted)
- **CI/CD**: GitHub Actions (automated deployment)
- **Server**: Digital Ocean Ubuntu Droplet
- **SSL**: Let's Encrypt (free SSL certificates)

---

## 🖥️ STEP 1: Server Setup on Digital Ocean

### 1.1 Create Droplet

1. Log into Digital Ocean
2. Create new Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($12/month - 2GB RAM recommended)
   - **Region**: Closest to Sri Lanka (Bangalore/Singapore)
   - **Authentication**: SSH Key (recommended) or Password

### 1.2 Initial Server Configuration

```bash
# SSH into your server
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Create deployment user
adduser deployer
usermod -aG sudo deployer
su - deployer
```

### 1.3 Run Setup Script

```bash
# Clone your repository temporarily
git clone YOUR_GITHUB_REPO_URL ~/temp-setup
cd ~/temp-setup

# Make setup script executable and run
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

The setup script will install:

- ✅ Node.js 18
- ✅ PM2 (process manager)
- ✅ Nginx (web server)
- ✅ Git

### 1.4 Clone Production Repository

```bash
cd /var/www/ticket-booking
git clone YOUR_GITHUB_REPO_URL .
```

---

## ⚙️ STEP 2: Environment Configuration

### 2.1 Backend Environment

```bash
cd /var/www/ticket-booking/backend
cp .env.example .env
nano .env
```

**Critical settings for production:**

```env
NODE_ENV=production
PORT=5000
BACKEND_URL=https://api.yourdomain.com

# Your existing MongoDB Atlas connection
MONGODB_URI=mongodb+srv://ijsescgrimtheatre_db_user:...@cluster0.pa8zmim.mongodb.net

# PayHere PRODUCTION credentials (not sandbox!)
PAYHERE_APP_ID=your_production_app_id
PAYHERE_APP_SECRET=your_production_secret_key
PAYHERE_SANDBOX=false

# Strong admin password
ADMIN_PASSWORD=create-very-strong-password-here

# Production frontend URL
FRONTEND_URL=https://yourdomain.com

# Email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

TICKET_PRICE=350
CURRENCY=LKR
```

### 2.2 Frontend Environment

```bash
cd /var/www/ticket-booking/frontend
cp .env.example .env
nano .env
```

```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🌐 STEP 3: Domain & DNS Configuration

### 3.1 Point Domain to Droplet

In your domain registrar (Namecheap, GoDaddy, etc.), add these DNS records:

| Type | Name | Value           | TTL |
| ---- | ---- | --------------- | --- |
| A    | @    | YOUR_DROPLET_IP | 300 |
| A    | www  | YOUR_DROPLET_IP | 300 |
| A    | api  | YOUR_DROPLET_IP | 300 |

**Wait 5-30 minutes** for DNS propagation.

Verify:

```bash
ping yourdomain.com
ping api.yourdomain.com
```

---

## 🔧 STEP 4: Nginx Configuration

### 4.1 Configure Nginx

```bash
# Copy nginx config
sudo cp /var/www/ticket-booking/scripts/nginx.conf /etc/nginx/sites-available/ticket-booking

# Edit and replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/ticket-booking
```

**Replace all instances of:**

- `yourdomain.com` → `youractual domain.com`
- `api.yourdomain.com` → `api.youractualdomain.com`

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ticket-booking /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx
```

### 4.2 Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get FREE SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🚀 STEP 5: Initial Deployment

### 5.1 Deploy Application

```bash
cd /var/www/ticket-booking
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This will:

- ✅ Install backend dependencies
- ✅ Build frontend production bundle
- ✅ Start backend with PM2
- ✅ Serve frontend via Nginx

### 5.2 Verify Services

```bash
# Check PM2 status
pm2 status

# Check backend logs
pm2 logs ticket-booking-backend

# Check Nginx
sudo systemctl status nginx

# Test backend API
curl https://api.yourdomain.com/api/health

# Visit frontend
# Open browser: https://yourdomain.com
```

---

## 🔄 STEP 6: GitHub Actions CI/CD Setup

### 6.1 Generate SSH Key on Server

```bash
# Generate key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""

# Add to authorized keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# Copy PRIVATE key (you'll need this for GitHub)
cat ~/.ssh/github-actions
```

**Copy the entire private key output** (including BEGIN and END lines)

### 6.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these 4 secrets:

| Secret Name   | Value                                    |
| ------------- | ---------------------------------------- |
| `DO_HOST`     | Your droplet IP (e.g., `147.182.123.45`) |
| `DO_USERNAME` | `deployer`                               |
| `DO_SSH_KEY`  | Full private key from step 6.1           |
| `DO_PORT`     | `22`                                     |

### 6.3 Test Automated Deployment

```bash
# Make a small change
echo "# CI/CD Test" >> README.md

# Commit and push
git add .
git commit -m "test: CI/CD deployment"
git push origin main
```

**Watch the deployment:**

1. Go to GitHub repository
2. Click **Actions** tab
3. See "Deploy to Digital Ocean" workflow running
4. Check logs for any errors

---

## 💳 STEP 7: PayHere Production Configuration

### 7.1 Update PayHere Domain Authorization

1. Log into PayHere merchant dashboard
2. Go to **Domains** section
3. **Add these domains:**
   - `yourdomain.com`
   - `www.yourdomain.com`
   - `api.yourdomain.com`
4. **Save and verify**

### 7.2 Update Webhook URL

In PayHere settings, set webhook/notification URL:

```
https://api.yourdomain.com/api/payment/notify
```

### 7.3 Get Production Credentials

If still using sandbox:

1. Contact PayHere support
2. Request production credentials
3. Update `PAYHERE_APP_ID` and `PAYHERE_APP_SECRET` in `/var/www/ticket-booking/backend/.env`
4. Set `PAYHERE_SANDBOX=false`
5. Restart backend: `pm2 restart ticket-booking-backend`

---

## 🔐 STEP 8: Security Hardening

### 8.1 Configure Firewall

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 8.2 Disable Password Authentication (Optional but Recommended)

```bash
sudo nano /etc/ssh/sshd_config

# Set these values:
PasswordAuthentication no
PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

### 8.3 Regular Updates

```bash
# Create update script
echo '#!/bin/bash
sudo apt update && sudo apt upgrade -y
pm2 update
sudo certbot renew
' > ~/update.sh

chmod +x ~/update.sh

# Run weekly
sudo crontab -e
# Add: 0 2 * * 0 /home/deployer/update.sh
```

---

## 📊 STEP 9: Monitoring & Logs

### PM2 Commands

```bash
# View all processes
pm2 status

# View logs (real-time)
pm2 logs ticket-booking-backend

# View specific logs
pm2 logs ticket-booking-backend --lines 100
pm2 logs ticket-booking-backend --err

# Restart
pm2 restart ticket-booking-backend

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save
```

### Application Logs

```bash
# Backend logs
tail -f /var/www/ticket-booking/logs/backend-out.log
tail -f /var/www/ticket-booking/logs/backend-error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 STEP 10: Ongoing Workflow

### Making Changes

1. **Develop locally**

   ```bash
   # Make changes
   git add .
   git commit -m "feat: new feature"
   ```

2. **Push to GitHub**

   ```bash
   git push origin main
   ```

3. **Automatic Deployment**

   - GitHub Actions detects push
   - Runs deployment workflow
   - Pulls latest code on server
   - Installs dependencies
   - Builds frontend
   - Restarts backend with PM2

4. **Verify**
   - Visit https://yourdomain.com
   - Check admin panel
   - Test booking flow

### Manual Deployment (if needed)

```bash
ssh deployer@YOUR_DROPLET_IP
cd /var/www/ticket-booking
git pull origin main
./scripts/deploy.sh
```

---

## 🚨 Troubleshooting Guide

### Backend Not Responding

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs ticket-booking-backend --lines 50

# Restart
pm2 restart ticket-booking-backend

# If still issues, check environment
cd /var/www/ticket-booking/backend
node server.js
# Look for errors
```

### Frontend Shows 404

```bash
# Check if build exists
ls -la /var/www/ticket-booking/frontend/dist-prod

# Rebuild
cd /var/www/ticket-booking/frontend
npm run build
sudo cp -r dist /var/www/ticket-booking/frontend/dist-prod
sudo systemctl reload nginx
```

### Payment Failing

1. **Check PayHere domain authorization** - domains must be approved
2. **Verify BACKEND_URL** - must match your actual API domain
3. **Check webhook** - `https://api.yourdomain.com/api/payment/notify` must be accessible
4. **Review logs** - `pm2 logs` for payment processing errors
5. **Test with sandbox first** - set `PAYHERE_SANDBOX=true` and use test cards

### CI/CD Deployment Failing

```bash
# Check GitHub Actions logs in repository

# Test SSH connection
ssh deployer@YOUR_DROPLET_IP

# Check git on server
cd /var/www/ticket-booking
git status
git log -1

# Manually trigger deployment
./scripts/deploy.sh
```

### Database Connection Issues

```bash
# Test MongoDB connection
cd /var/www/ticket-booking/backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌', err));"

# Check MongoDB Atlas
# - IP whitelist: Add your droplet IP or allow all (0.0.0.0/0)
# - Database user permissions
# - Connection string format
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend accessible at https://yourdomain.com
- [ ] Backend API responding at https://api.yourdomain.com/api/health
- [ ] SSL certificates installed (green padlock in browser)
- [ ] Admin panel accessible at https://yourdomain.com/admin
- [ ] Test booking flow end-to-end
- [ ] PayHere payment working (test card or real payment)
- [ ] PDF tickets generating correctly
- [ ] QR code scanner working in admin
- [ ] Email notifications configured (or logging to console)
- [ ] GitHub Actions workflow running successfully
- [ ] PM2 processes running (`pm2 status`)
- [ ] Firewall configured (`sudo ufw status`)
- [ ] Backups scheduled (MongoDB Atlas auto-backup)
- [ ] Monitoring setup (PM2 logs, Nginx logs)

---

## 🎉 Success!

Your application is now:

- ✅ **Live** at https://yourdomain.com
- ✅ **Secure** with SSL encryption
- ✅ **Automated** with CI/CD pipeline
- ✅ **Scalable** with PM2 clustering
- ✅ **Monitored** with logs and PM2

**Every time you push code to GitHub main branch, it automatically deploys to production!**

---

## 📞 Quick Commands Reference

```bash
# SSH into server
ssh deployer@YOUR_DROPLET_IP

# View PM2 processes
pm2 status

# View backend logs
pm2 logs ticket-booking-backend

# Restart backend
pm2 restart ticket-booking-backend

# Manual deployment
cd /var/www/ticket-booking && ./scripts/deploy.sh

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test MongoDB connection
cd /var/www/ticket-booking/backend && npm run test:db
```

---

**Need Help?** Check logs first:

1. `pm2 logs ticket-booking-backend`
2. `sudo tail -f /var/log/nginx/error.log`
3. Check GitHub Actions workflow logs
4. Review PayHere transaction dashboard

Good luck with your movie night! 🎬🍿
