# 🚀 Quick Start Guide

## Before You Deploy - Essential Steps

### 1. Create Environment File
Copy `env.example` to `.env` and fill in these **REQUIRED** variables:

```env
# Your phone number (replace with your actual number)
OWNERS=your-phone-number@c.us

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-bot

# OpenAI API key
AI_API_KEY=sk-your-openai-api-key-here

# Security keys (generate random strings)
JWT_SECRET=your-32-character-jwt-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
WEB_SESSION_SECRET=your-web-session-secret

# Your domain (for Vercel deployment)
WEB_BASE_URL=https://your-app-name.vercel.app
```

### 2. Get Required Services

#### MongoDB Atlas (Free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Get connection string
5. Replace in `.env`

#### OpenAI API Key (Paid)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account
3. Add payment method
4. Get API key
5. Replace in `.env`

### 3. Deploy to Vercel

#### Option A: GitHub + Vercel (Recommended)
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/whatsapp-ai-bot.git
git push -u origin main

# Connect to Vercel
# 1. Go to vercel.com
# 2. Import GitHub repo
# 3. Add environment variables
# 4. Deploy!
```

#### Option B: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### 4. Vercel Framework Detection Fix

**If Vercel can't detect Node.js framework:**

1. **Manual Framework Selection:**
   - In Vercel dashboard, when importing project
   - Select "Other" or "Node.js" from framework preset
   - Or choose "No Framework" and it will auto-detect

2. **Alternative: Use Vercel CLI with explicit config:**
   ```bash
   vercel --prod --build-env NODE_ENV=production
   ```

3. **Check Configuration Files:**
   - ✅ `vercel.json` - Explicitly specifies Node.js
   - ✅ `package.json` - Has proper Node.js configuration
   - ✅ `.vercelignore` - Excludes unnecessary files

### 5. Connect WhatsApp

1. Visit your deployed app URL
2. Click "Connect WhatsApp"
3. Scan QR code with your phone
4. Bot is ready!

## 🎯 What You Get

- ✅ AI-powered responses
- ✅ Sticker creation
- ✅ Group management
- ✅ Media processing
- ✅ Memory system
- ✅ Admin dashboard
- ✅ Security features
- ✅ Analytics

## 🆘 Common Issues

**QR Code not showing?**
- Check if MongoDB is connected
- Verify environment variables
- Check logs for errors

**Bot not responding?**
- Ensure WhatsApp is connected
- Check if commands start with `!`
- Verify AI API key is valid

**Deployment fails?**
- Check all required env variables
- Ensure Node.js version is 16+
- Verify MongoDB connection string

**Vercel can't detect Node.js?**
- Select "Other" or "Node.js" manually in framework preset
- Use Vercel CLI instead of dashboard
- Check that `package.json` and `vercel.json` are present

## 📞 Support

- Check logs in Vercel dashboard
- Review error messages
- Ensure all services are active

---

**Ready to deploy?** Follow the steps above and you'll have a fully functional WhatsApp AI bot! 🚀 