@echo off
echo ========================================
echo 🐼 PumpPanda Trading Agent Setup
echo ========================================
echo.

echo 📋 Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

echo 📦 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

echo 🔧 Setting up environment...
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy "env.template" ".env"
    echo ✅ .env file created. Please edit it with your configuration.
    echo.
    echo ⚠️  IMPORTANT: Edit the .env file with your actual values:
    echo    - INFURA_PROJECT_ID
    echo    - Private keys for your wallets
    echo    - Other API keys as needed
    echo.
    pause
) else (
    echo ✅ .env file already exists
)

echo.
echo 🚀 Building the project...
npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully
echo.

echo 🧪 Running basic tests...
npm run test:pump-panda
if errorlevel 1 (
    echo ❌ Tests failed. Please check your configuration.
    pause
    exit /b 1
)

echo ✅ All tests passed!
echo.

echo ========================================
echo 🎉 Setup completed successfully!
echo ========================================
echo.
echo 🚀 To start the trading agent:
echo    npm run pump-panda
echo.
echo 🎬 To run the demo:
echo    npm run demo
echo.
echo 📋 To see configuration demo:
echo    npm run demo:config
echo.
echo 📖 For more information, see RECALL_COMPETITION_README.md
echo.

pause
