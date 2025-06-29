# Docker Deployment Guide

This guide will help you deploy the WhatsApp bot using Docker and Docker Compose for production use.

## Prerequisites

- Docker and Docker Compose installed
- A domain name (optional but recommended)
- SSL certificates (for HTTPS)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd whatsapp-bot
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Generate SSL certificates (for HTTPS)**
   ```bash
   mkdir ssl
   # For development (self-signed)
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/key.pem -out ssl/cert.pem
   
   # For production, use Let's Encrypt or your SSL provider
   ```

4. **Start the services**
   ```bash
   docker-compose up -d
   ```

5. **Check logs**
   ```bash
   docker-compose logs -f whatsapp-bot
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Bot Configuration
BOT_NAME=WhatsApp AI Bot
BOT_PREFIX=!
OWNERS=your-phone-number@c.us

# Database
MONGODB_URI=mongodb://admin:password@mongo:27017/whatsapp-bot?authSource=admin

# AI Configuration
AI_API_KEY=your-openai-api-key
AI_MODEL=gpt-3.5-turbo

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key

# Web Interface
WEB_PORT=3000
WEB_HOST=0.0.0.0

# Logging
LOG_LEVEL=info
LOG_FILE=logs/bot.log

# Rate Limiting
RATE_LIMIT_MESSAGE=5
RATE_LIMIT_COMMAND=10
RATE_LIMIT_AI=3
RATE_LIMIT_BROADCAST=1
```

### SSL Configuration

For production, you should use proper SSL certificates:

1. **Using Let's Encrypt with Certbot**
   ```bash
   # Install certbot
   sudo apt-get install certbot
   
   # Get certificate
   sudo certbot certonly --standalone -d yourdomain.com
   
   # Copy certificates
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
   ```

2. **Update nginx.conf**
   Replace `localhost` with your domain name in `nginx.conf`.

## Production Deployment

### 1. Using Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d
```

### 2. Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml whatsapp-bot

# View services
docker service ls

# Scale services
docker service scale whatsapp-bot_whatsapp-bot=3
```

### 3. Using Kubernetes

Create a `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whatsapp-bot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: whatsapp-bot
  template:
    metadata:
      labels:
        app: whatsapp-bot
    spec:
      containers:
      - name: whatsapp-bot
        image: your-registry/whatsapp-bot:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          value: "mongodb://mongo:27017/whatsapp-bot"
        - name: BOT_NAME
          value: "WhatsApp AI Bot"
        volumeMounts:
        - name: session-storage
          mountPath: /app/session
        - name: logs-storage
          mountPath: /app/logs
      volumes:
      - name: session-storage
        persistentVolumeClaim:
          claimName: session-pvc
      - name: logs-storage
        persistentVolumeClaim:
          claimName: logs-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: whatsapp-bot-service
spec:
  selector:
    app: whatsapp-bot
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Monitoring and Maintenance

### Health Checks

The bot includes health check endpoints:

```bash
# Check bot health
curl https://yourdomain.com/api/health

# Check MongoDB
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Check nginx
curl -I https://yourdomain.com/health
```

### Logs

```bash
# View bot logs
docker-compose logs -f whatsapp-bot

# View nginx logs
docker-compose logs -f nginx

# View MongoDB logs
docker-compose logs -f mongo

# Access logs directory
docker-compose exec whatsapp-bot ls -la logs/
```

### Backup

```bash
# Backup MongoDB
docker-compose exec mongo mongodump --out /backup/$(date +%Y%m%d)

# Backup session files
docker cp whatsapp-bot_session:/app/session ./backup/session/

# Backup logs
docker cp whatsapp-bot_logs:/app/logs ./backup/logs/
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Or update specific service
docker-compose pull whatsapp-bot
docker-compose up -d whatsapp-bot
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using port 3000
   netstat -tulpn | grep :3000
   
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB status
   docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
   
   # Check logs
   docker-compose logs mongo
   ```

3. **SSL certificate issues**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Test nginx configuration
   docker-compose exec nginx nginx -t
   ```

4. **Bot not connecting**
   ```bash
   # Check bot logs
   docker-compose logs -f whatsapp-bot
   
   # Check session files
   docker-compose exec whatsapp-bot ls -la session/
   ```

### Performance Optimization

1. **Resource limits**
   ```yaml
   # In docker-compose.yml
   services:
     whatsapp-bot:
       deploy:
         resources:
           limits:
             cpus: '2.0'
             memory: 2G
           reservations:
             cpus: '1.0'
             memory: 1G
   ```

2. **Database optimization**
   ```bash
   # Create indexes
   docker-compose exec mongo mongosh whatsapp-bot --eval "
     db.messages.createIndex({timestamp: 1});
     db.users.createIndex({userId: 1});
     db.groups.createIndex({groupId: 1});
   "
   ```

3. **Nginx optimization**
   ```nginx
   # Add to nginx.conf
   worker_processes auto;
   worker_connections 1024;
   
   # Enable gzip
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript;
   ```

## Security Considerations

1. **Firewall configuration**
   ```bash
   # Allow only necessary ports
   ufw allow 22/tcp    # SSH
   ufw allow 80/tcp    # HTTP
   ufw allow 443/tcp   # HTTPS
   ufw enable
   ```

2. **Regular updates**
   ```bash
   # Update base images
   docker-compose pull
   
   # Update system packages
   sudo apt update && sudo apt upgrade
   ```

3. **Backup strategy**
   ```bash
   # Automated backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker-compose exec mongo mongodump --out /backup/$DATE
   tar -czf backup_$DATE.tar.gz backup/$DATE
   ```

## Scaling

### Horizontal Scaling

```bash
# Scale bot instances
docker-compose up -d --scale whatsapp-bot=3

# Use load balancer
docker-compose up -d nginx
```

### Database Scaling

```bash
# Add MongoDB replicas
docker-compose up -d mongo-replica-1 mongo-replica-2

# Configure replica set
docker-compose exec mongo mongosh --eval "
  rs.initiate({
    _id: 'rs0',
    members: [
      {_id: 0, host: 'mongo:27017'},
      {_id: 1, host: 'mongo-replica-1:27017'},
      {_id: 2, host: 'mongo-replica-2:27017'}
    ]
  })
"
```

This deployment guide provides a comprehensive approach to running your WhatsApp bot in production with Docker. The setup includes monitoring, backup strategies, and scaling options for high availability. 