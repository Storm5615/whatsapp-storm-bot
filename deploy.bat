@echo off
echo 🚀 WhatsApp AI Bot Deployment Script
echo =====================================

REM Check if .env exists
if not exist .env (
    echo ❌ .env file not found!
    echo 📝 Creating .env from template...
    copy env.example .env
    echo ✅ .env file created!
    echo ⚠️  Please edit .env file with your configuration before deploying
    echo.
    echo Required variables to set:
    echo - OWNERS (your phone number)
    echo - MONGODB_URI (MongoDB Atlas connection)
    echo - AI_API_KEY (OpenAI API key)
    echo - JWT_SECRET (32 character secret)
    echo - ENCRYPTION_KEY (32 character key)
    echo - WEB_SESSION_SECRET (session secret)
    echo - WEB_BASE_URL (your domain)
    echo.
    pause
    exit /b 1
)

REM Create required directories
echo 📁 Creating required directories...
if not exist logs mkdir logs
if not exist public\uploads mkdir public\uploads
if not exist backups mkdir backups
if not exist ssl mkdir ssl
if not exist custom-commands mkdir custom-commands
echo ✅ Directories created!

REM Install dependencies
echo 📦 Installing dependencies...
npm install
echo ✅ Dependencies installed!

REM Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

echo.
echo 🎉 Setup complete! Your bot is ready for deployment.
echo.
echo Next steps:
echo 1. Push to GitHub: git push origin main
echo 2. Deploy to Vercel: vercel --prod
echo 3. Or use GitHub integration with Vercel
echo.
echo 📖 Read QUICK_START.md for detailed instructions
pause 