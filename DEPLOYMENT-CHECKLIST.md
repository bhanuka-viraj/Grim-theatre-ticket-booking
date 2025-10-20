# 🚀 Quick Deployment Checklist

## Before Starting

- [ ] Digital Ocean account created
- [ ] Droplet created (Ubuntu 22.04, 2GB RAM)
- [ ] Domain name purchased and DNS pointed to droplet IP
- [ ] GitHub repository created with code
- [ ] MongoDB Atlas setup completed

## Server Setup (One-Time)

```bash
# 1. SSH into server
ssh root@YOUR_DROPLET_IP

# 2. Run setup script
cd ~
git clone YOUR_REPO_URL temp
cd temp
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh

# 3. Clone to production directory
cd /var/www/ticket-booking
git clone YOUR_REPO_URL .

# 4. Configure environment
cd backend && cp .env.example .env && nano .env
cd ../frontend && cp .env.example .env && nano .env

# 5. Setup Nginx
sudo cp scripts/nginx.conf /etc/nginx/sites-available/ticket-booking
sudo nano /etc/nginx/sites-available/ticket-booking  # Update domain names
sudo ln -s /etc/nginx/sites-available/ticket-booking /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. Get SSL certificate
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# 7. Deploy
cd /var/www/ticket-booking
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 8. Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## GitHub CI/CD Setup (One-Time)

```bash
# 1. Generate SSH key on server
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions  # Copy this

# 2. Add GitHub Secrets
# Go to: GitHub Repo → Settings → Secrets → Actions
# Add these secrets:
DO_HOST=YOUR_DROPLET_IP
DO_USERNAME=deployer
DO_SSH_KEY=<paste private key>
DO_PORT=22

# 3. Test deployment
git add . && git commit -m "test: CI/CD" && git push origin main
```

## PayHere Production Setup

- [ ] Add domains in PayHere dashboard:
  - yourdomain.com
  - www.yourdomain.com
  - api.yourdomain.com
- [ ] Set webhook URL: `https://api.yourdomain.com/api/payment/notify`
- [ ] Update .env with production credentials
- [ ] Set `PAYHERE_SANDBOX=false`
- [ ] Restart: `pm2 restart ticket-booking-backend`

## Verification

- [ ] Visit https://yourdomain.com (frontend loads)
- [ ] Check https://api.yourdomain.com/api/health (returns OK)
- [ ] Test admin panel at https://yourdomain.com/admin
- [ ] Complete test booking
- [ ] Verify payment flow
- [ ] Check PDF ticket generation
- [ ] Test QR scanner in admin
- [ ] Push code to GitHub (CI/CD deploys automatically)

## Common Commands

```bash
# SSH into server
ssh deployer@YOUR_DROPLET_IP

# Check backend status
pm2 status
pm2 logs ticket-booking-backend

# Restart backend
pm2 restart ticket-booking-backend

# Manual deployment
cd /var/www/ticket-booking && ./scripts/deploy.sh

# Check Nginx
sudo nginx -t
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/error.log
tail -f /var/www/ticket-booking/logs/backend-out.log
```

## Environment Variables (Backend)

```env
NODE_ENV=production
PORT=5000
BACKEND_URL=https://api.yourdomain.com
MONGODB_URI=mongodb+srv://...
PAYHERE_APP_ID=your_production_id
PAYHERE_APP_SECRET=your_production_secret
PAYHERE_SANDBOX=false
ADMIN_PASSWORD=strong_password
FRONTEND_URL=https://yourdomain.com
```

## Environment Variables (Frontend)

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## DNS Records

| Type | Name | Value      |
| ---- | ---- | ---------- |
| A    | @    | DROPLET_IP |
| A    | www  | DROPLET_IP |
| A    | api  | DROPLET_IP |

## Troubleshooting

**Backend not starting:** `pm2 logs ticket-booking-backend`
**Frontend 404:** Check `/var/www/ticket-booking/frontend/dist-prod`
**Payment failing:** Verify PayHere domain authorization
**CI/CD failing:** Check GitHub Actions logs
**SSL issues:** `sudo certbot renew --dry-run`

## Success Criteria

✅ Green padlock (HTTPS working)
✅ Frontend loads without errors
✅ Admin panel accessible
✅ Can complete booking
✅ Payment processes successfully
✅ PDF generates with QR code
✅ QR scanner works
✅ Git push triggers auto-deployment

---

**Full Guide:** See `CICD-GUIDE.md` for detailed instructions
