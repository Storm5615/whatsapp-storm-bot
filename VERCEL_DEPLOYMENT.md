# 🚀 Vercel Deployment Guide

This guide will walk you through deploying your WhatsApp AI Bot to Vercel using GitHub integration.

## 📋 Prerequisites

- GitHub account
- Vercel account
- MongoDB Atlas account
- OpenAI API key

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done)
   ```bash
   cd whatsapp-bot
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name it `whatsapp-ai-bot`
   - Make it public or private
   - Don't initialize with README (we already have one)

3. **Push to GitHub**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/whatsapp-ai-bot.git
   git push -u origin main
   ```

### Step 2: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier is fine)

2. **Configure Database**
   - Create a database user
   - Set up network access (allow all IPs: `0.0.0.0/0`)
   - Get your connection string

3. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/whatsapp-bot?retryWrites=true&w=majority
   ```

### Step 3: Deploy to Vercel

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"

2. **Import Repository**
   - Select your `whatsapp-ai-bot` repository
   - Vercel will automatically detect it's a Node.js project

3. **Configure Project**
   - **Framework Preset**: Node.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (not needed for this project)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   Click "Environment Variables" and add:

   ```env
   # Bot Configuration
   BOT_NAME=YourBotName
   BOT_PREFIX=!
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_atlas_connection_string
   
   # Security
   JWT_SECRET=your_very_long_random_secret_key
   ADMIN_PASSWORD=your_secure_admin_password
   
   # Rate Limiting
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your bot will be live at `https://your-project-name.vercel.app`

### Step 4: Configure Vercel Settings

1. **Function Configuration**
   - Go to your project settings in Vercel
   - Navigate to "Functions"
   - Set timeout to 30 seconds (maximum for free tier)

2. **Domain Configuration** (Optional)
   - Go to "Domains"
   - Add a custom domain if desired

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy when you push changes to your GitHub repository:

```bash
git add .
git commit -m "Update bot features"
git push origin main
```

## 📱 Using Your Deployed Bot

1. **Access Web Interface**
   - Go to your Vercel URL: `https://your-project-name.vercel.app`
   - You'll see the pairing page

2. **Connect WhatsApp**
   - Scan the QR code with WhatsApp
   - The bot will connect and be ready to use

3. **Test Commands**
   - Send `!help` to see available commands
   - Try `!ai Hello, how are you?` to test AI features

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is 16+ in `package.json`

2. **Environment Variables Not Working**
   - Double-check variable names (case-sensitive)
   - Redeploy after adding new variables

3. **MongoDB Connection Issues**
   - Verify connection string format
   - Check network access settings in MongoDB Atlas
   - Ensure database user has correct permissions

4. **WhatsApp Connection Issues**
   - Check if the bot is running (logs in Vercel dashboard)
   - Verify all environment variables are set
   - Try reconnecting by refreshing the web interface

### Vercel Logs

1. **View Logs**
   - Go to your Vercel project
   - Click "Functions" tab
   - Click on your function to see logs

2. **Debug Issues**
   - Check for error messages in logs
   - Verify environment variables are loaded
   - Test database connectivity

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to GitHub
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **Rate Limiting**
   - Configure appropriate limits for your use case
   - Monitor usage to prevent abuse

3. **Access Control**
   - Use strong admin passwords
   - Limit admin access to trusted users

## 📊 Monitoring

1. **Vercel Analytics**
   - Monitor function execution times
   - Track error rates
   - View usage statistics

2. **Custom Monitoring**
   - Use the bot's built-in logging system
   - Monitor MongoDB Atlas metrics
   - Set up alerts for critical issues

## 🔄 Updates and Maintenance

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm update
   git add package*.json
   git commit -m "Update dependencies"
   git push origin main
   ```

2. **Backup Strategy**
   - MongoDB Atlas provides automatic backups
   - Consider exporting important data regularly
   - Keep local backups of configuration

## 🆘 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Help**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **GitHub Issues**: Report bugs in your repository

---

**🎉 Congratulations!** Your WhatsApp AI Bot is now deployed and ready to use on Vercel! 