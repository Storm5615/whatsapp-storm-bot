#!/bin/bash

echo "🚀 WhatsApp AI Bot Deployment Script"
echo "====================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from template..."
    cp env.example .env
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env file with your configuration before deploying"
    echo ""
    echo "Required variables to set:"
    echo "- OWNERS (your phone number)"
    echo "- MONGODB_URI (MongoDB Atlas connection)"
    echo "- AI_API_KEY (OpenAI API key)"
    echo "- JWT_SECRET (32 character secret)"
    echo "- ENCRYPTION_KEY (32 character key)"
    echo "- WEB_SESSION_SECRET (session secret)"
    echo "- WEB_BASE_URL (your domain)"
    echo ""
    exit 1
fi

# Check if required directories exist
echo "📁 Creating required directories..."
mkdir -p logs public/uploads backups ssl custom-commands
echo "✅ Directories created!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed!"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version check passed: $(node -v)"

# Test configuration
echo "🔧 Testing configuration..."
node -e "
require('dotenv').config();
const required = ['OWNERS', 'MONGODB_URI', 'AI_API_KEY', 'JWT_SECRET', 'ENCRYPTION_KEY'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.log('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
}
console.log('✅ All required environment variables are set!');
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup complete! Your bot is ready for deployment."
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Deploy to Vercel: vercel --prod"
    echo "3. Or use GitHub integration with Vercel"
    echo ""
    echo "📖 Read QUICK_START.md for detailed instructions"
else
    echo "❌ Configuration test failed. Please check your .env file."
    exit 1
fi 