#!/bin/bash

# IJSE Movie Night Ticket Booking - Initial Server Setup Script
# Run this script once on your Digital Ocean server

echo "🚀 Starting server setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/ticket-booking
sudo chown -R $USER:$USER /var/www/ticket-booking

# Clone repository (you'll need to provide your repo URL)
echo "📥 Clone your repository manually:"
echo "cd /var/www/ticket-booking"
echo "git clone YOUR_REPO_URL ."

# Create logs directory
mkdir -p /var/www/ticket-booking/logs

# Setup PM2 startup script
echo "⚙️ Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "✅ Basic setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Clone your repository to /var/www/ticket-booking"
echo "2. Copy backend/.env.example to backend/.env and configure"
echo "3. Copy frontend/.env.example to frontend/.env and configure"
echo "4. Run the deployment script: ./scripts/deploy.sh"
echo "5. Configure Nginx using the config in scripts/nginx.conf"
