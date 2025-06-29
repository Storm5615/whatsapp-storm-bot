# 🗄️ MongoDB Setup Guide for WhatsApp Bot

## Quick Setup (5 minutes)

### 1. Create MongoDB Atlas Account
- Go to [mongodb.com/atlas](https://mongodb.com/atlas)
- Click "Try Free"
- Sign up with Google/GitHub or email

### 2. Create Database
- Choose "FREE" tier (M0)
- Select cloud provider (AWS/Google/Azure)
- Pick region close to you
- Click "Create Cluster"

### 3. Create Database User
- Go to "Database Access" → "Add New Database User"
- Username: `whatsappbot`
- Password: `your_secure_password`
- Privileges: "Read and write to any database"
- Click "Add User"

### 4. Allow Network Access
- Go to "Network Access" → "Add IP Address"
- Click "Allow Access from Anywhere"
- Click "Confirm"

### 5. Get Connection String
- Go to "Database" → "Connect"
- Choose "Connect your application"
- Copy the connection string

### 6. Customize Connection String

**Original:**
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**Modified (add database name):**
```
mongodb+srv://whatsappbot:your_secure_password@cluster.mongodb.net/whatsapp-bot?retryWrites=true&w=majority
```

### 7. Add to Vercel Environment Variables

In your Vercel dashboard:
```
MONGODB_URI=mongodb+srv://whatsappbot:your_secure_password@cluster.mongodb.net/whatsapp-bot?retryWrites=true&w=majority
```

## 🔧 Database Structure

Your bot will automatically create these collections:

- `users` - User information and preferences
- `conversations` - Chat history and context
- `groups` - Group settings and data
- `stickers` - Sticker metadata
- `media` - Media file information
- `logs` - Bot activity logs

## 🆘 Troubleshooting

### Connection Issues
- Check if username/password are correct
- Verify network access allows all IPs
- Ensure connection string format is correct

### Database Not Found
- The database will be created automatically
- No need to create it manually

### Permission Errors
- Make sure user has "Read and write" permissions
- Check if user is active in Database Access

## 💡 Tips

- **Use a strong password** for your database user
- **Save your credentials** in a secure place
- **Free tier includes** 512MB storage (plenty for a bot)
- **Automatic backups** are included
- **No credit card required** for free tier 