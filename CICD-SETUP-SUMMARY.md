# 📦 Project Files Summary - CI/CD Setup

## What Was Created

### 1. CI/CD Pipeline (`.github/workflows/deploy.yml`)

- **Purpose**: Automated deployment on every push to `main` branch
- **Triggers**: Git push or manual workflow dispatch
- **Actions**:
  - Connects to Digital Ocean via SSH
  - Pulls latest code
  - Installs dependencies
  - Builds frontend
  - Restarts backend with PM2

### 2. Process Manager (`ecosystem.config.js`)

- **Purpose**: PM2 configuration for Node.js backend
- **Features**:
  - Cluster mode with 2 instances
  - Auto-restart on crashes
  - Memory limit (1GB)
  - Log rotation
  - Production environment variables

### 3. Deployment Scripts (`scripts/`)

#### `setup-server.sh`

- One-time server setup script
- Installs Node.js, PM2, Nginx, Git
- Creates directory structure
- Configures PM2 startup

#### `deploy.sh`

- Main deployment script
- Pulls latest code
- Installs dependencies
- Builds frontend
- Restarts PM2 processes
- Copies build to Nginx directory

#### `nginx.conf`

- Nginx web server configuration
- Serves frontend static files
- Reverse proxy for backend API
- SSL/HTTPS setup
- Security headers
- Gzip compression
- Cache control

### 4. Documentation

#### `CICD-GUIDE.md` (Main Guide)

- Complete step-by-step deployment guide
- Server setup instructions
- Environment configuration
- DNS/domain setup
- SSL certificate installation
- GitHub Actions configuration
- PayHere production setup
- Security hardening
- Monitoring and logs
- Troubleshooting guide
- **Use this as your main reference**

#### `DEPLOYMENT-CHECKLIST.md` (Quick Reference)

- One-page checklist
- All commands in order
- Verification steps
- Common commands reference
- Environment variables list
- **Use this for quick setup**

### 5. Environment Examples

#### `backend/.env.example` (Updated)

- Production environment template
- MongoDB Atlas connection
- PayHere production settings
- Email SMTP configuration
- Admin credentials
- Security settings

#### `frontend/.env.example`

- API endpoint configuration
- Production vs development URLs

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                                                          │
│  Push to main ──> GitHub Actions Workflow ──> Deploy    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓ SSH Connection
┌─────────────────────────────────────────────────────────┐
│              Digital Ocean Droplet (Ubuntu)              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    Nginx                         │  │
│  │  - Serves frontend (React build)                 │  │
│  │  - Reverse proxy to backend                      │  │
│  │  - SSL/HTTPS (Let's Encrypt)                     │  │
│  │  - Port 80/443                                   │  │
│  └───────────┬──────────────────────┬────────────────┘  │
│              │                      │                    │
│              ↓                      ↓                    │
│   ┌──────────────────┐   ┌───────────────────┐         │
│   │    Frontend      │   │      Backend      │         │
│   │  /frontend/dist  │   │   PM2 (Node.js)   │         │
│   │  (Static files)  │   │   Port 5000       │         │
│   └──────────────────┘   └─────────┬─────────┘         │
│                                     │                    │
└─────────────────────────────────────┼────────────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────┐
                        │    MongoDB Atlas         │
                        │    (Cloud Database)      │
                        └──────────────────────────┘
```

## Deployment Flow

### Initial Setup (One-Time)

1. Create Digital Ocean droplet
2. Point domain DNS to droplet IP
3. Run `setup-server.sh` on server
4. Clone repository to `/var/www/ticket-booking`
5. Configure `.env` files
6. Setup Nginx with `nginx.conf`
7. Install SSL with Let's Encrypt
8. Run `deploy.sh` for first deployment
9. Add GitHub secrets for CI/CD
10. Configure PayHere production settings

### Ongoing Workflow (Automated)

1. Developer makes code changes locally
2. Commits and pushes to GitHub main branch
3. GitHub Actions workflow triggers automatically
4. Workflow SSHs into Digital Ocean server
5. Pulls latest code from GitHub
6. Installs dependencies
7. Builds frontend (Vite)
8. Restarts backend (PM2)
9. Application is live with updates

## Key Technologies

| Component           | Technology        | Purpose                       |
| ------------------- | ----------------- | ----------------------------- |
| **Frontend**        | React + Vite      | User interface                |
| **Backend**         | Node.js + Express | API server                    |
| **Database**        | MongoDB Atlas     | Data storage                  |
| **Process Manager** | PM2               | Keep backend running          |
| **Web Server**      | Nginx             | Serve frontend, proxy backend |
| **CI/CD**           | GitHub Actions    | Automated deployment          |
| **SSL**             | Let's Encrypt     | Free HTTPS certificates       |
| **Server**          | Digital Ocean     | Cloud hosting                 |
| **Payment**         | PayHere           | Payment gateway               |

## File Locations on Server

```
/var/www/ticket-booking/
├── backend/
│   ├── server.js (Entry point)
│   ├── .env (Production secrets - not in git)
│   └── ... (Node.js backend code)
├── frontend/
│   ├── dist/ (Local build)
│   ├── dist-prod/ (Production build served by Nginx)
│   ├── .env (API URL config)
│   └── ... (React frontend code)
├── scripts/
│   ├── setup-server.sh (One-time setup)
│   ├── deploy.sh (Deployment script)
│   └── nginx.conf (Web server config)
├── .github/workflows/
│   └── deploy.yml (CI/CD pipeline)
├── ecosystem.config.js (PM2 configuration)
├── logs/ (Application logs)
├── CICD-GUIDE.md (Full deployment guide)
└── DEPLOYMENT-CHECKLIST.md (Quick reference)
```

## Security Features

- ✅ HTTPS with SSL certificates
- ✅ Firewall (UFW) configured
- ✅ Nginx security headers
- ✅ PayHere signature verification
- ✅ Environment variables (secrets not in code)
- ✅ Admin password protection
- ✅ MongoDB Atlas with authentication
- ✅ Rate limiting on backend
- ✅ Input validation
- ✅ CORS configured

## Monitoring & Maintenance

### Logs

```bash
# Backend logs
pm2 logs ticket-booking-backend
tail -f /var/www/ticket-booking/logs/backend-out.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Process Management

```bash
# Check status
pm2 status

# Restart backend
pm2 restart ticket-booking-backend

# Monitor resources
pm2 monit
```

### Updates

- **Code updates**: Automatic via GitHub Actions on push
- **Dependencies**: Installed automatically during deployment
- **SSL renewal**: Automatic (certbot auto-renews)
- **System updates**: Run manually or schedule with cron

## URLs After Deployment

| Service             | URL                                           | Description           |
| ------------------- | --------------------------------------------- | --------------------- |
| **Frontend**        | https://yourdomain.com                        | Main website          |
| **Admin**           | https://yourdomain.com/admin                  | Admin dashboard       |
| **API**             | https://api.yourdomain.com/api                | Backend API           |
| **Health Check**    | https://api.yourdomain.com/api/health         | API status            |
| **PayHere Webhook** | https://api.yourdomain.com/api/payment/notify | Payment notifications |

## Next Steps

1. **Read** `CICD-GUIDE.md` for detailed setup instructions
2. **Follow** `DEPLOYMENT-CHECKLIST.md` for quick deployment
3. **Configure** environment variables for production
4. **Test** the entire booking flow after deployment
5. **Monitor** logs and PM2 status regularly
6. **Update** PayHere with production domains and webhook URL

## Support & Troubleshooting

- Check `CICD-GUIDE.md` troubleshooting section
- Review PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify environment variables in `.env` files
- Test MongoDB connection
- Confirm PayHere domain authorization
- Review GitHub Actions workflow logs

---

**Everything is ready for deployment! Follow the CICD-GUIDE.md for step-by-step instructions.**

Good luck with your IJSE Movie Night event! 🎬🍿
