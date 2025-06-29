require('dotenv').config();

module.exports = {
    // Bot Information
    name: process.env.BOT_NAME || 'Storm Bot',
    prefix: process.env.BOT_PREFIX || '.',
    owners: process.env.OWNERS ? process.env.OWNERS.split(',') : [],
    
    // WhatsApp Settings
    phoneNumber: process.env.PHONE_NUMBER || '',
    
    // Database
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot'
    },
    
    // AI Configuration
    ai: {
        enabled: process.env.AI_ENABLED === 'true',
        openaiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-3.5-turbo',
        maxTokens: 150
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 5000,
        sessionSecret: process.env.SESSION_SECRET || 'your-secret-key'
    },
    
    // Features
    features: {
        stickerWatermark: process.env.STICKER_WATERMARK || 'Storm Bot',
        autoReply: process.env.AUTO_REPLY === 'true',
        welcomeMessage: process.env.WELCOME_MESSAGE || 'Hello! I\'m Storm Bot, your AI assistant. Type .help for commands.'
    },
    
    // Messages
    messages: {
        welcome: '🎉 Welcome! I\'m Storm Bot, your AI assistant.\n\nCommands:\n.help - Show all commands\n.ping - Check bot status\n.menu - Show main menu\n\nType .help for more info!',
        help: '🤖 *Available Commands:*\n\n*Basic:*\n.ping - Check bot status\n.menu - Show main menu\n.help - Show this help\n\n*AI Chat:*\nJust send me a message and I\'ll respond!\n\n*Tools:*\n.sticker - Create sticker from image\n.info - Get chat info\n\n*Admin:*\n.broadcast - Send message to all users (Owner only)',
        error: '❌ An error occurred. Please try again.',
        notOwner: '⛔ This command is only for bot owners.',
        processing: '⏳ Processing your request...'
    }
}; 