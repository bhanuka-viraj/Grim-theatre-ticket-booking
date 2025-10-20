# Quick Setup Scripts

## Backend Setup Script (PowerShell)

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file from example
Copy-Item .env.example .env

Write-Host "Backend dependencies installed!"
Write-Host "Please configure .env file with your MongoDB URI and PayHere credentials."
```

## Frontend Setup Script (PowerShell)

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

Write-Host "Frontend dependencies installed!"
Write-Host "Run 'npm run dev' to start the development server."
```

## Complete Setup (PowerShell)

Run these commands from the `ticker_booking` directory:

```powershell
# Backend
cd backend
npm install
Copy-Item .env.example .env
cd ..

# Frontend
cd frontend
npm install
Copy-Item .env.example .env
cd ..

Write-Host ""
Write-Host "✅ Setup complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Configure backend/.env with MongoDB URI and PayHere credentials"
Write-Host "2. Start backend: cd backend; npm run dev"
Write-Host "3. Start frontend: cd frontend; npm run dev"
```
