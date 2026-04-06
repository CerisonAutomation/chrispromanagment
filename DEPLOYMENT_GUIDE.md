# Deployment Guide

## Overview

This is a Next.js 16 application with Prisma ORM, shadcn/ui components, and Puck page builder integration. This guide covers deployment to Vercel and self-hosted environments.

## Prerequisites

- Node.js 18+ (or Bun 1.0+)
- Git repository connected
- Environment variables configured
- Database (SQLite, PostgreSQL, MySQL)

## Vercel Deployment (Recommended)

### 1. Connect Repository

```bash
# Push code to GitHub
git push origin main

# Connect to Vercel
# Visit https://vercel.com/new and select your repository
```

### 2. Configure Environment Variables

In Vercel dashboard:

1. Go to Settings > Environment Variables
2. Add required variables:
   - `DATABASE_URL`: Your database connection string
   - `NEXT_PUBLIC_SITE_URL`: Production domain
   - `NODE_ENV`: `production`

3. Add optional variables:
   - `DEBUG_MODE`: `false` for production
   - `NEXT_PUBLIC_ENABLE_ANALYTICS`: `true`

### 3. Configure Build Settings

In Vercel dashboard:

1. Go to Settings > Build & Development Settings
2. Build Command: `bun install && bun run build`
3. Output Directory: `.next`
4. Install Command: `bun install`

### 4. Database Migration

After connecting, run migrations:

```bash
# Via Vercel's built-in preview environment
# Or via manual deployment with:
bunx prisma migrate deploy
```

## Self-Hosted Deployment

### 1. Prepare Server

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Bun (optional, faster than npm)
curl https://bun.sh/install | bash

# Clone repository
git clone <your-repo> app
cd app
```

### 2. Install Dependencies

```bash
# Using bun (faster)
bun install

# Or using npm
npm install
```

### 3. Configure Environment

```bash
# Copy example env and configure
cp .env.example .env.local

# Edit with production values
nano .env.local

# Required variables:
# - DATABASE_URL
# - NEXT_PUBLIC_SITE_URL
# - NODE_ENV=production
```

### 4. Setup Database

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate deploy

# Or for SQLite, use
bunx prisma db push
```

### 5. Build Application

```bash
# Build for production
bun run build

# Verify build succeeded
ls -la .next/
```

### 6. Run Application

```bash
# Start production server
NODE_ENV=production bun .next/standalone/server.js

# Or using pm2 for process management
npm install -g pm2
pm2 start "NODE_ENV=production bun .next/standalone/server.js" --name "app"
pm2 save
```

### 7. Setup Reverse Proxy (Nginx)

```nginx
upstream app {
  server localhost:3000;
}

server {
  listen 80;
  server_name christianopropertymanagement.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name christianopropertymanagement.com;

  ssl_certificate /etc/letsencrypt/live/christianopropertymanagement.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/christianopropertymanagement.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Proxy to app
  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 8. Setup SSL Certificate

```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d christianopropertymanagement.com
sudo certbot renew --dry-run
```

## Monitoring & Maintenance

### Monitor Logs

```bash
# View application logs
pm2 logs

# Or with journalctl
journalctl -u app -f
```

### Monitor Performance

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Monitor processes
top
```

### Backup Database

```bash
# For SQLite
cp -r db/ db.backup.$(date +%Y%m%d)

# For PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Automate with cron
0 2 * * * /usr/local/bin/backup-db.sh
```

## Troubleshooting

### Build Fails

```bash
# Clear build cache
rm -rf .next

# Rebuild
bun run build
```

### Database Connection Issues

```bash
# Test connection
bunx prisma db execute --stdin < test.sql

# Check connection string
echo $DATABASE_URL

# Verify database is accessible
psql $DATABASE_URL -c "SELECT 1"
```

### Performance Issues

```bash
# Check build size
du -sh .next/

# Analyze bundle
bunx next-bundle-analyzer

# Review logs for slow queries
```

## Rollback Procedure

```bash
# Keep previous build backed up
cp -r .next .next.backup

# Revert to previous version
git revert HEAD
git push

# Rebuild
bun run build

# Restart application
pm2 restart all
```

## Security Checklist

- [ ] HTTPS/SSL enabled
- [ ] Environment variables not exposed
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] CORS properly configured
- [ ] Input validation enforced
- [ ] Error logs don't expose sensitive data
- [ ] Admin panel protected
- [ ] Dependencies updated
