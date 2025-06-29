# 🚀 Deployment Guide

This guide covers deploying the WhatsApp AI Bot to various platforms with all the enhanced features.

## 📋 Prerequisites

Before deploying, ensure you have:

- **Node.js 16+** installed
- **MongoDB database** (local or cloud)
- **WhatsApp account** for bot pairing
- **OpenAI API key** (for AI features)
- **Git** for version control

## 🔧 Environment Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Bot Configuration
BOT_NAME=WhatsApp AI Bot
BOT_PREFIX=.
BOT_VERSION=1.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp-bot

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
AI_ENABLED=true
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=150

# Security
OWNERS=1234567890,0987654321
SECURITY_ENABLED=true
RATE_LIMIT_MESSAGES=5
RATE_LIMIT_COMMANDS=10

# Server
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_ENABLE_FILE=true

# Features
FEATURES_AUTO_REPLY=true
FEATURES_STICKER_CREATION=true
FEATURES_MEDIA_PROCESSING=true
```

### 2. Database Setup

#### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Add to `MONGODB_URI`

#### Local MongoDB
```bash
# Install MongoDB
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb

# Create database
mongo
use whatsapp-bot
```

## 🚀 Platform Deployment

### Vercel Deployment (Recommended)

1. **Fork the Repository**
```bash
git clone https://github.com/yourusername/whatsapp-ai-bot.git
cd whatsapp-ai-bot
```

2. **Install Vercel CLI**
```bash
npm i -g vercel
```

3. **Deploy**
```bash
vercel --prod
```

4. **Set Environment Variables**
- Go to Vercel Dashboard
- Select your project
- Go to Settings > Environment Variables
- Add all variables from `.env`

5. **Configure Build Settings**
```json
{
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
```

### Railway Deployment

1. **Connect Repository**
- Go to [Railway](https://railway.app)
- Connect your GitHub repository
- Deploy automatically

2. **Set Environment Variables**
- Go to project settings
- Add all environment variables

3. **Configure Domain**
- Railway provides a custom domain
- Use for web interface access

### Heroku Deployment

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Create Heroku App**
```bash
heroku create your-bot-name
```

3. **Set Environment Variables**
```bash
heroku config:set BOT_NAME="WhatsApp AI Bot"
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set OPENAI_API_KEY="your_openai_key"
# ... add all other variables
```

4. **Deploy**
```bash
git push heroku main
```

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'
services:
  bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/whatsapp-bot
    depends_on:
      - mongo
    volumes:
      - ./logs:/app/logs
      - ./storage:/app/storage

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

3. **Deploy**
```bash
docker-compose up -d
```

### PM2 Deployment (Production)

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

3. **Start with PM2**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔒 Security Configuration

### 1. Rate Limiting
```javascript
// In config.js
security: {
  rateLimiting: {
    messages: 5,      // 5 messages per minute
    commands: 10,     // 10 commands per minute
    ai: 3,           // 3 AI requests per 30 seconds
    broadcast: 1      // 1 broadcast per 5 minutes
  }
}
```

### 2. Input Validation
```javascript
// Enable input sanitization
INPUT_VALIDATION=true
AUTO_MODERATION=true
```

### 3. Permission System
```javascript
// Set owner phone numbers
OWNERS=1234567890,0987654321

// Permission levels
DEFAULT_PERMISSION_LEVEL=0
MODERATOR_PERMISSION_LEVEL=1
ADMIN_PERMISSION_LEVEL=2
OWNER_PERMISSION_LEVEL=3
```

## 📊 Monitoring Setup

### 1. Logging Configuration
```javascript
// Enable structured logging
LOG_LEVEL=info
LOG_ENABLE_FILE=true
LOG_DIR=./logs
LOG_MAX_FILE_SIZE=5242880  // 5MB
LOG_MAX_FILES=5
```

### 2. Health Checks
```bash
# Check bot status
curl https://your-domain.com/api/health

# Get statistics
curl https://your-domain.com/api/stats
```

### 3. Performance Monitoring
```javascript
// Enable performance tracking
PERFORMANCE_TRACKING=true
PERFORMANCE_LOG_SLOW_QUERIES=true
PERFORMANCE_SLOW_QUERY_THRESHOLD=1000
```

## 🔧 Advanced Configuration

### 1. Custom Plugins
```javascript
// plugins/custom.js
class CustomPlugin {
  constructor() {
    this.commands = ['custom'];
  }
  
  async execute(sock, msg, { command, args, config }) {
    // Your plugin logic
  }
}

module.exports = { CustomPlugin };
```

### 2. Webhook Integration
```javascript
// In config.js
webhooks: {
  enabled: true,
  url: 'https://your-webhook-url.com',
  secret: 'your_webhook_secret',
  events: ['message', 'group_update', 'user_join']
}
```

### 3. External Services
```javascript
// Redis for caching
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

// AWS S3 for file storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

## 🚨 Troubleshooting

### Common Issues

1. **QR Code Not Appearing**
```bash
# Check logs
tail -f logs/error-$(date +%Y-%m-%d).log

# Restart bot
pm2 restart whatsapp-bot
```

2. **Database Connection Issues**
```bash
# Test MongoDB connection
mongo "your_mongodb_uri" --eval "db.runCommand('ping')"

# Check network connectivity
telnet your-mongodb-host 27017
```

3. **Memory Issues**
```bash
# Monitor memory usage
pm2 monit

# Increase memory limit
pm2 restart whatsapp-bot --max-memory-restart 2G
```

4. **Rate Limiting Issues**
```javascript
// Adjust rate limits in config
RATE_LIMIT_MESSAGES=10
RATE_LIMIT_COMMANDS=20
```

### Performance Optimization

1. **Database Indexing**
```javascript
// Add indexes for better performance
db.users.createIndex({ "phoneNumber": 1 })
db.conversations.createIndex({ "userId": 1, "chatId": 1 })
db.messages.createIndex({ "timestamp": -1 })
```

2. **Caching**
```javascript
// Enable Redis caching
CACHE_ENABLED=true
CACHE_TTL=3600000  // 1 hour
```

3. **File Cleanup**
```javascript
// Automatic cleanup
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000  // Daily
BACKUP_RETENTION_DAYS=30
```

## 📈 Scaling

### Horizontal Scaling
```javascript
// Use load balancer
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./index.js');
}
```

### Database Scaling
- Use MongoDB Atlas for managed scaling
- Implement read replicas
- Use connection pooling

### File Storage Scaling
- Use AWS S3 or Google Cloud Storage
- Implement CDN for media files
- Use image optimization

## 🔄 Updates & Maintenance

### 1. Automatic Updates
```bash
# Set up GitHub Actions for auto-deploy
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

### 2. Backup Strategy
```bash
# Database backup
mongodump --uri="your_mongodb_uri" --out=./backups

# File backup
tar -czf backup-$(date +%Y%m%d).tar.gz logs/ storage/
```

### 3. Monitoring Alerts
```javascript
// Set up monitoring alerts
MONITORING_ENABLED=true
MONITORING_ALERTS=true
ALERT_EMAIL=admin@example.com
```

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: GitHub Issues
- **Community**: GitHub Discussions
- **Wiki**: Project Wiki

---

**Happy Deploying! 🚀** 