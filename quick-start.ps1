# PumpPanda Trading Agent Setup Script
# Run this script in PowerShell to set up your trading agent

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🐼 PumpPanda Trading Agent Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Setup environment
Write-Host "🔧 Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.template" ".env"
    Write-Host "✅ .env file created. Please edit it with your configuration." -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit the .env file with your actual values:" -ForegroundColor Yellow
    Write-Host "   - INFURA_PROJECT_ID" -ForegroundColor White
    Write-Host "   - Private keys for your wallets" -ForegroundColor White
    Write-Host "   - Other API keys as needed" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to continue after editing .env file"
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Build project
Write-Host "🚀 Building the project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Run tests
Write-Host "🧪 Running basic tests..." -ForegroundColor Yellow
npm run test:pump-panda
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed. Please check your configuration." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 To start the trading agent:" -ForegroundColor White
Write-Host "   npm run pump-panda" -ForegroundColor Gray
Write-Host ""
Write-Host "🎬 To run the demo:" -ForegroundColor White
Write-Host "   npm run demo" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 To see configuration demo:" -ForegroundColor White
Write-Host "   npm run demo:config" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For more information, see RECALL_COMPETITION_README.md" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
