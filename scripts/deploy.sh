#!/bin/bash

# IJSE Movie Night Ticket Booking - Deployment Script
# This script deploys the application on the server

set -e

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/ticket-booking

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Backend deployment
echo "🔧 Building backend..."
cd backend
npm install --production
echo "✅ Backend dependencies installed"

# Frontend deployment
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build
echo "✅ Frontend built successfully"

# Copy built frontend to serve with Nginx
echo "📂 Copying frontend build..."
sudo rm -rf /var/www/ticket-booking/frontend/dist-prod
sudo cp -r dist /var/www/ticket-booking/frontend/dist-prod
sudo chown -R www-data:www-data /var/www/ticket-booking/frontend/dist-prod

# Restart backend with PM2
echo "♻️ Restarting backend..."
cd ..
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Deployment completed successfully!"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs ticket-booking-backend"
