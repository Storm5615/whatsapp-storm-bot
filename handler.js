const fs = require('fs-extra');
const path = require('path');
const { getContentType } = require('@whiskeysockets/baileys');
const { logger } = require('./lib/logger');
const { securityManager, PERMISSIONS } = require('./lib/security');
const { memoryPlugin } = require('./plugins/memory');

// Load plugins
const plugins = new Map();
const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(file => file.endsWith('.js'));

for (const file of pluginFiles) {
    try {
        const pluginModule = require(`./plugins/${file}`);
        const pluginName = file.replace('.js', '');
        
        // Handle different plugin export formats
        let plugin;
        if (pluginModule.plugin) {
            plugin = pluginModule.plugin;
        } else if (pluginModule[`${pluginName}Plugin`]) {
            plugin = pluginModule[`${pluginName}Plugin`];
        } else {
            plugin = pluginModule;
        }
        
        plugins.set(pluginName, plugin);
        logger.info(`Plugin loaded: ${pluginName}`);
    } catch (error) {
        logger.error(`Failed to load plugin ${file}`, error);
    }
}

// Message handler
async function handler(sock, msg, config) {
    const startTime = Date.now();
    
    try {
        const { key, message } = msg;
        const chatId = key.remoteJid;
        const sender = key.participant || key.remoteJid;
        const messageType = getContentType(message);
        
        // Log incoming message
        logger.debug('Incoming message', {
            chatId,
            sender,
            messageType,
            hasMedia: !!message.imageMessage || !!message.videoMessage || !!message.audioMessage || !!message.documentMessage
        });
        
        // Extract text content
        let text = '';
        if (messageType === 'conversation') {
            text = message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            text = message.extendedTextMessage.text;
        }
        
        // Sanitize input
        text = securityManager.sanitizeInput(text);
        
        // Check rate limiting
        if (securityManager.isRateLimited(sender, 'MESSAGE')) {
            const limitInfo = securityManager.getRateLimitInfo(sender, 'MESSAGE');
            const remainingTime = Math.ceil((limitInfo.resetTime - Date.now()) / 1000);
            await sock.sendMessage(chatId, { 
                text: `⚠️ Rate limit exceeded. Please wait ${remainingTime} seconds before sending another message.` 
            });
            return;
        }
        
        // Add message to memory
        if (text && !text.startsWith(config.prefix)) {
            await memoryPlugin.addMessage(sender, chatId, text, false);
        }
        
        // Check if message is a command
        if (text && text.startsWith(config.prefix)) {
            const commandParts = text.slice(config.prefix.length).trim().split(' ');
            const command = commandParts[0].toLowerCase();
            const args = commandParts.slice(1);
            
            // Check command cooldown
            if (securityManager.isCommandOnCooldown(sender, command)) {
                const remainingCooldown = securityManager.getRemainingCooldown(sender, command);
                await sock.sendMessage(chatId, { 
                    text: `⏳ Please wait ${Math.ceil(remainingCooldown / 1000)} seconds before using this command again.` 
                });
                return;
            }
            
            // Log command execution
            logger.logCommand(sender, command, args);
            
            // Find and execute command
            let commandExecuted = false;
            
            for (const [pluginName, plugin] of plugins) {
                if (plugin.commands && plugin.commands.includes(command)) {
                    try {
                        // Check permissions for admin commands
                        if (command.startsWith('admin') || command.startsWith('mod')) {
                            const hasPermission = await securityManager.hasPermission(
                                sender, 
                                PERMISSIONS.MODERATOR, 
                                config
                            );
                            
                            if (!hasPermission) {
                                await sock.sendMessage(chatId, { 
                                    text: '❌ You need moderator permissions to use this command.' 
                                });
                                return;
                            }
                        }
                        
                        // Execute plugin command
                        if (plugin.execute) {
                            await plugin.execute(sock, msg, { command, args, config });
                        } else if (plugin.handleCommand) {
                            await plugin.handleCommand(msg, args, sock);
                        } else if (plugin.handleStickerCommand && command === 'sticker') {
                            await plugin.handleStickerCommand(msg, args, sock);
                        } else if (plugin.handleMediaCommand && command === 'media') {
                            await plugin.handleMediaCommand(msg, args, sock);
                        } else if (plugin.handleGroupCommand && command === 'group') {
                            await plugin.handleGroupCommand(msg, args, sock);
                        } else if (plugin.handleMemoryCommand && command === 'memory') {
                            await plugin.handleMemoryCommand(msg, args, sock);
                        }
                        
                        commandExecuted = true;
                        break;
                    } catch (error) {
                        logger.logError(error, `plugin_${pluginName}_${command}`);
                        await sock.sendMessage(chatId, { text: config.messages.error });
                        return;
                    }
                }
            }
            
            // Command not found
            if (!commandExecuted) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Command "${command}" not found. Type ${config.prefix}help for available commands.` 
                });
            }
            return;
        }
        
        // Handle media messages
        if (messageType === 'imageMessage' || messageType === 'videoMessage' || 
            messageType === 'audioMessage' || messageType === 'documentMessage') {
            
            // Add media message to memory
            const mediaType = messageType.replace('Message', '');
            await memoryPlugin.addMessage(sender, chatId, `[${mediaType.toUpperCase()}]`, false);
            
            // Handle sticker creation
            if (text && text.toLowerCase().includes('sticker')) {
                const stickerPlugin = plugins.get('sticker');
                if (stickerPlugin && stickerPlugin.handleStickerCommand) {
                    await stickerPlugin.handleStickerCommand(msg, [], sock);
                    return;
                }
            }
            
            // Handle media processing
            if (text && text.toLowerCase().includes('media')) {
                const mediaPlugin = plugins.get('media');
                if (mediaPlugin && mediaPlugin.handleMediaCommand) {
                    await mediaPlugin.handleMediaCommand(msg, ['download'], sock);
                    return;
                }
            }
        }
        
        // AI chat response (if enabled and no command)
        if (config.ai.enabled && text && !text.startsWith(config.prefix)) {
            const aiPlugin = plugins.get('ai');
            if (aiPlugin) {
                try {
                    // Get conversation context
                    const context = await memoryPlugin.getContext(sender, chatId, 10);
                    
                    // Execute AI with context
                    if (aiPlugin.execute) {
                        await aiPlugin.execute(sock, msg, { 
                            command: 'chat', 
                            args: text, 
                            config,
                            context 
                        });
                    }
                    
                    // Add AI response to memory
                    // Note: This would need to be done after the AI responds
                    
                    return;
                } catch (error) {
                    logger.logError(error, 'ai_chat');
                    await sock.sendMessage(chatId, { text: '❌ AI service is currently unavailable.' });
                    return;
                }
            }
        }
        
        // Auto reply for non-command messages
        if (config.features.autoReply && text && !text.startsWith(config.prefix)) {
            await sock.sendMessage(chatId, { 
                text: config.features.welcomeMessage 
            });
        }
        
        // Log performance
        logger.logPerformance('message_handling', Date.now() - startTime, {
            chatId,
            sender,
            messageType,
            hasCommand: text.startsWith(config.prefix)
        });
        
    } catch (error) {
        logger.logError(error, 'message_handler');
        try {
            await sock.sendMessage(msg.key.remoteJid, { text: config.messages.error });
        } catch (sendError) {
            logger.logError(sendError, 'send_error_message');
        }
    }
}

// Event handler for group events
async function handleGroupEvents(sock, event, data, config) {
    try {
        const groupPlugin = plugins.get('group');
        if (groupPlugin && groupPlugin.handleGroupEvent) {
            await groupPlugin.handleGroupEvent(event, data, sock);
        }
        
        logger.logWhatsAppEvent(event, data);
        
    } catch (error) {
        logger.logError(error, 'group_event_handler');
    }
}

// Connection event handler
async function handleConnectionEvents(sock, event, data, config) {
    try {
        switch (event) {
            case 'connection.update':
                if (data.state === 'open') {
                    logger.info('WhatsApp connection established');
                } else if (data.state === 'close') {
                    logger.warn('WhatsApp connection closed');
                }
                break;
            case 'creds.update':
                logger.debug('Credentials updated');
                break;
            case 'messages.upsert':
                logger.debug('Messages upserted', { count: data.messages?.length || 0 });
                break;
            default:
                logger.debug(`WhatsApp event: ${event}`);
        }
        
    } catch (error) {
        logger.logError(error, 'connection_event_handler');
    }
}

// Cleanup function
function cleanup() {
    try {
        // Cleanup memory plugin
        const memoryPlugin = plugins.get('memory');
        if (memoryPlugin && memoryPlugin.destroy) {
            memoryPlugin.destroy();
        }
        
        // Cleanup security manager
        securityManager.destroy();
        
        // Cleanup logger
        logger.destroy();
        
        logger.info('Cleanup completed');
        
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

module.exports = {
    handler,
    handleGroupEvents,
    handleConnectionEvents,
    cleanup
}; 