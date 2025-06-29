const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const qrcode = require('qrcode');
const config = require('./config');
const { handler, handleGroupEvents, handleConnectionEvents, cleanup } = require('./handler');
const { connectDB } = require('./lib/database');
const { logger } = require('./lib/logger');
const { securityManager } = require('./lib/security');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Global variables
let sock = null;
let qrCode = null;
let connectionStatus = 'disconnected';
let isShuttingDown = false;

// Setup Express
app.use(express.json());
app.use(express.static('public'));

// Security middleware
app.use((req, res, next) => {
    // Rate limiting for API endpoints
    const clientIP = req.ip || req.connection.remoteAddress;
    if (securityManager.isRateLimited(clientIP, 'API')) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    next();
});

// Serve the web interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        status: connectionStatus,
        qrCode: qrCode,
        botName: config.name,
        version: config.version || '1.0.0',
        uptime: process.uptime()
    });
});

// Bot statistics endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const { memoryPlugin } = require('./plugins/memory');
        const memoryStats = await memoryPlugin.getMemoryStats();
        const logStats = logger.getLogStats();
        
        res.json({
            memory: memoryStats,
            logs: logStats,
            uptime: process.uptime(),
            version: config.version || '1.0.0'
        });
    } catch (error) {
        logger.logError(error, 'api_stats');
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connection: connectionStatus,
        memory: process.memoryUsage()
    });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
    logger.info('Web client connected', { clientId: socket.id });
    
    socket.emit('status', { status: connectionStatus, qrCode: qrCode });
    
    socket.on('disconnect', () => {
        logger.info('Web client disconnected', { clientId: socket.id });
    });
    
    // Handle client requests
    socket.on('get_stats', async () => {
        try {
            const { memoryPlugin } = require('./plugins/memory');
            const memoryStats = await memoryPlugin.getMemoryStats();
            socket.emit('stats', memoryStats);
        } catch (error) {
            logger.logError(error, 'socket_stats');
        }
    });
});

// WhatsApp connection function
async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('session');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: {
                level: 'silent', // Use our custom logger instead
                logger: {
                    trace: () => {},
                    debug: () => {},
                    info: () => {},
                    warn: () => {},
                    error: () => {}
                }
            }
        });
        
        // Handle connection updates
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                try {
                    qrCode = await qrcode.toDataURL(qr);
                    connectionStatus = 'qr_ready';
                    io.emit('status', { status: connectionStatus, qrCode: qrCode });
                    logger.info('QR Code generated');
                } catch (error) {
                    logger.logError(error, 'qr_generation');
                }
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                logger.warn('Connection closed', { 
                    reason: lastDisconnect?.error?.message,
                    shouldReconnect
                });
                
                if (shouldReconnect) {
                    logger.info('Reconnecting to WhatsApp...');
                    setTimeout(() => connectToWhatsApp(), 5000);
                } else {
                    logger.error('WhatsApp connection closed permanently');
                    connectionStatus = 'disconnected';
                    io.emit('status', { status: connectionStatus });
                }
            }
            
            if (connection === 'open') {
                connectionStatus = 'connected';
                qrCode = null;
                io.emit('status', { status: connectionStatus });
                logger.info('WhatsApp connected successfully');
            }
        });
        
        // Handle group events
        sock.ev.on('groups.update', async (updates) => {
            try {
                for (const update of updates) {
                    await handleGroupEvents(sock, 'groups.update', update, config);
                }
            } catch (error) {
                logger.logError(error, 'groups_update');
            }
        });
        
        // Handle participants update
        sock.ev.on('group-participants.update', async (update) => {
            try {
                await handleGroupEvents(sock, 'group-participants.update', update, config);
            } catch (error) {
                logger.logError(error, 'group_participants_update');
            }
        });
        
        // Handle messages
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            
            if (!msg.key.fromMe && msg.message) {
                try {
                    await handler(sock, msg, config);
                } catch (error) {
                    logger.logError(error, 'message_handling');
                }
            }
        });
        
        // Handle message reactions
        sock.ev.on('messages.reaction', async (reactions) => {
            try {
                for (const reaction of reactions) {
                    logger.debug('Message reaction', {
                        messageId: reaction.key.id,
                        sender: reaction.key.participant,
                        reaction: reaction.reactions[0]?.text
                    });
                }
            } catch (error) {
                logger.logError(error, 'message_reaction');
            }
        });
        
        // Handle presence updates
        sock.ev.on('presence.update', async (presence) => {
            try {
                logger.debug('Presence update', {
                    userId: presence.id,
                    status: presence.presences[0]?.lastKnownPresence
                });
            } catch (error) {
                logger.logError(error, 'presence_update');
            }
        });
        
        // Handle credentials update
        sock.ev.on('creds.update', async (creds) => {
            try {
                await saveCreds(creds);
                await handleConnectionEvents(sock, 'creds.update', creds, config);
            } catch (error) {
                logger.logError(error, 'creds_update');
            }
        });
        
    } catch (error) {
        logger.logError(error, 'whatsapp_connection');
        throw error;
    }
}

// Initialize bot
async function startBot() {
    try {
        logger.info('Starting WhatsApp bot...');
        
        // Connect to database
        await connectDB();
        logger.info('Database connected successfully');
        
        // Start WhatsApp connection
        await connectToWhatsApp();
        
        // Start server
        server.listen(config.server.port, () => {
            logger.info(`Bot server started`, {
                port: config.server.port,
                botName: config.name,
                prefix: config.prefix,
                version: config.version || '1.0.0'
            });
            
            console.log(`🚀 Bot server running on port ${config.server.port}`);
            console.log(`📱 Open http://localhost:${config.server.port} to pair WhatsApp`);
            console.log(`🤖 Bot name: ${config.name}`);
            console.log(`🔧 Prefix: ${config.prefix}`);
            console.log(`📊 Logs: ./logs/`);
        });
        
        // Periodic cleanup
        setInterval(async () => {
            try {
                const { memoryPlugin } = require('./plugins/memory');
                const { stickerPlugin } = require('./plugins/sticker');
                const { mediaPlugin } = require('./plugins/media');
                
                // Clean old conversations
                await memoryPlugin.cleanup();
                
                // Clean old stickers
                await stickerPlugin.cleanOldStickers(7);
                
                // Clean old media
                await mediaPlugin.cleanOldFiles(7);
                
                // Clean old logs
                logger.cleanOldLogs(30);
                
                logger.debug('Periodic cleanup completed');
            } catch (error) {
                logger.logError(error, 'periodic_cleanup');
            }
        }, 60 * 60 * 1000); // Every hour
        
    } catch (error) {
        logger.logError(error, 'bot_startup');
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    
    isShuttingDown = true;
    logger.info(`Received ${signal}, shutting down gracefully...`);
    
    try {
        // Close WhatsApp connection
        if (sock) {
            sock.end();
            logger.info('WhatsApp connection closed');
        }
        
        // Close server
        if (server) {
            server.close(() => {
                logger.info('HTTP server closed');
            });
        }
        
        // Perform cleanup
        await cleanup();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
        
    } catch (error) {
        logger.logError(error, 'graceful_shutdown');
        process.exit(1);
    }
}

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.logError(error, 'uncaught_exception');
    gracefulShutdown('uncaught_exception');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.logError(new Error(`Unhandled Rejection at: ${promise}, reason: ${reason}`), 'unhandled_rejection');
    gracefulShutdown('unhandled_rejection');
});

// Start the bot
startBot(); 