# WhatsApp AI Bot

A powerful WhatsApp bot with AI capabilities, security features, and advanced automation built with Node.js, Baileys, and OpenAI.

## 🚀 Features

- **AI Integration**: OpenAI-powered responses and image generation
- **Security**: Rate limiting, input validation, and permission system
- **Media Handling**: Sticker creation, image processing, and file management
- **Group Management**: Advanced group controls and moderation
- **Memory System**: Variable storage and formula templates
- **Real-time Web Interface**: Live monitoring and control panel
- **Comprehensive Logging**: Detailed activity tracking and analytics
- **MongoDB Integration**: Persistent data storage and user management

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **WhatsApp API**: @whiskeysockets/baileys
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI API
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 16+ 
- MongoDB Atlas account
- OpenAI API key
- Vercel account (for deployment)

## 🔧 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whatsapp-ai-bot.git
   cd whatsapp-ai-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   # Bot Configuration
   BOT_NAME=YourBotName
   BOT_PREFIX=!
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-3.5-turbo
   
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string
   
   # Security
   JWT_SECRET=your_jwt_secret_key
   ADMIN_PASSWORD=your_admin_password
   
   # Rate Limiting
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the bot**
   ```bash
   npm run dev
   ```

5. **Access the web interface**
   Open `http://localhost:3000` in your browser

## 🚀 Deployment to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/whatsapp-ai-bot.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `whatsapp-ai-bot` repository
   - Configure environment variables in Vercel dashboard
   - Deploy!

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```env
BOT_NAME=YourBotName
BOT_PREFIX=!
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_PASSWORD=your_admin_password
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
```

## 📱 Usage

### Bot Commands

- `!help` - Show available commands
- `!ai <question>` - Ask AI a question
- `!sticker` - Create sticker from image
- `!admin` - Admin panel (if authorized)
- `!memory` - Memory management
- `!group` - Group management commands

### Web Interface

- **Pairing**: Scan QR code to connect WhatsApp
- **Dashboard**: Monitor bot activity and statistics
- **Admin Panel**: Manage users, settings, and bot behavior
- **Logs**: View detailed activity logs

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Sanitizes user inputs
- **Permission System**: Role-based access control
- **JWT Authentication**: Secure web interface access
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP headers protection

## 📊 Monitoring

- **Real-time Logs**: Live activity monitoring
- **Performance Metrics**: Response times and usage statistics
- **Error Tracking**: Automatic error logging and reporting
- **User Analytics**: Usage patterns and engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/whatsapp-ai-bot/issues)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our Discord server for help

## 🙏 Acknowledgments

- [Baileys](https://github.com/whiskeysockets/baileys) - WhatsApp Web API
- [OpenAI](https://openai.com) - AI capabilities
- [Vercel](https://vercel.com) - Deployment platform
- [MongoDB](https://mongodb.com) - Database service

---

**Note**: This bot is for educational purposes. Please comply with WhatsApp's Terms of Service and API usage guidelines. 