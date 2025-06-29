// MongoDB initialization script
db = db.getSiblingDB('whatsapp-bot');

// Create collections with validation
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'phoneNumber', 'createdAt'],
            properties: {
                userId: {
                    bsonType: 'string',
                    description: 'WhatsApp user ID'
                },
                phoneNumber: {
                    bsonType: 'string',
                    description: 'Phone number'
                },
                name: {
                    bsonType: 'string',
                    description: 'User name'
                },
                permissionLevel: {
                    bsonType: 'int',
                    minimum: 0,
                    maximum: 3,
                    description: 'Permission level (0=User, 1=Moderator, 2=Admin, 3=Owner)'
                },
                isBlocked: {
                    bsonType: 'bool',
                    description: 'Whether user is blocked'
                },
                lastSeen: {
                    bsonType: 'date',
                    description: 'Last seen timestamp'
                },
                messageCount: {
                    bsonType: 'int',
                    minimum: 0,
                    description: 'Total message count'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Account creation date'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Last update date'
                }
            }
        }
    }
});

db.createCollection('groups', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['groupId', 'name', 'createdAt'],
            properties: {
                groupId: {
                    bsonType: 'string',
                    description: 'WhatsApp group ID'
                },
                name: {
                    bsonType: 'string',
                    description: 'Group name'
                },
                description: {
                    bsonType: 'string',
                    description: 'Group description'
                },
                participants: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'string'
                    },
                    description: 'Group participants'
                },
                admins: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'string'
                    },
                    description: 'Group admins'
                },
                isActive: {
                    bsonType: 'bool',
                    description: 'Whether bot is active in group'
                },
                settings: {
                    bsonType: 'object',
                    description: 'Group settings'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Group creation date'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Last update date'
                }
            }
        }
    }
});

db.createCollection('messages', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['messageId', 'userId', 'chatId', 'content', 'timestamp'],
            properties: {
                messageId: {
                    bsonType: 'string',
                    description: 'Unique message ID'
                },
                userId: {
                    bsonType: 'string',
                    description: 'Sender user ID'
                },
                chatId: {
                    bsonType: 'string',
                    description: 'Chat/Group ID'
                },
                content: {
                    bsonType: 'string',
                    description: 'Message content'
                },
                type: {
                    enum: ['text', 'image', 'video', 'audio', 'document', 'sticker'],
                    description: 'Message type'
                },
                timestamp: {
                    bsonType: 'date',
                    description: 'Message timestamp'
                },
                isCommand: {
                    bsonType: 'bool',
                    description: 'Whether message is a command'
                },
                command: {
                    bsonType: 'string',
                    description: 'Command name if applicable'
                }
            }
        }
    }
});

db.createCollection('logs', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['level', 'message', 'timestamp'],
            properties: {
                level: {
                    enum: ['error', 'warn', 'info', 'debug'],
                    description: 'Log level'
                },
                message: {
                    bsonType: 'string',
                    description: 'Log message'
                },
                timestamp: {
                    bsonType: 'date',
                    description: 'Log timestamp'
                },
                userId: {
                    bsonType: 'string',
                    description: 'Related user ID'
                },
                chatId: {
                    bsonType: 'string',
                    description: 'Related chat ID'
                },
                error: {
                    bsonType: 'object',
                    description: 'Error details'
                },
                metadata: {
                    bsonType: 'object',
                    description: 'Additional metadata'
                }
            }
        }
    }
});

// Create indexes for better performance
db.users.createIndex({ "userId": 1 }, { unique: true });
db.users.createIndex({ "phoneNumber": 1 });
db.users.createIndex({ "permissionLevel": 1 });
db.users.createIndex({ "isBlocked": 1 });

db.groups.createIndex({ "groupId": 1 }, { unique: true });
db.groups.createIndex({ "isActive": 1 });
db.groups.createIndex({ "participants": 1 });

db.messages.createIndex({ "messageId": 1 }, { unique: true });
db.messages.createIndex({ "userId": 1 });
db.messages.createIndex({ "chatId": 1 });
db.messages.createIndex({ "timestamp": 1 });
db.messages.createIndex({ "isCommand": 1 });

db.logs.createIndex({ "timestamp": 1 });
db.logs.createIndex({ "level": 1 });
db.logs.createIndex({ "userId": 1 });
db.logs.createIndex({ "chatId": 1 });

// Create TTL index for logs (auto-delete after 30 days)
db.logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 2592000 });

print('MongoDB initialization completed successfully!'); 