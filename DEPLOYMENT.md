# AgentRise Portal - Deployment Guide

Comprehensive guide for deploying the AgentRise Insurance Portal to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Deployment Options](#deployment-options)
  - [Option 1: Docker Compose (Recommended)](#option-1-docker-compose-recommended)
  - [Option 2: VPS (DigitalOcean, Linode, AWS EC2)](#option-2-vps-digitalocean-linode-aws-ec2)
  - [Option 3: Platform-as-a-Service (Render, Railway)](#option-3-platform-as-a-service-render-railway)
  - [Option 4: Separate Hosting (Vercel + Heroku/Railway)](#option-4-separate-hosting-vercel--herokuranaway)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Database Management](#database-management)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for version control
- **Domain name** (for production)
- **SSL certificate** (can use Let's Encrypt)

### Required Accounts

- GitHub account (for CI/CD)
- Cloud provider account (DigitalOcean, AWS, etc.)
- Domain registrar access

### Environment Variables

Copy the production environment template:

```bash
cp .env.production.example .env.production
```

Fill in all required values (see [Production Environment Configuration](#production-environment-configuration))

---

## Quick Start with Docker

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/AgentRisePortal.git
cd AgentRisePortal
```

### 2. Configure Environment

```bash
# Copy and edit production environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values
```

### 3. Deploy

```bash
# Run deployment script
./scripts/deploy.sh
```

### 4. Access Application

- **Frontend**: http://localhost (or your domain)
- **Backend API**: http://localhost:5000

### 5. Login

Use the seeded credentials:
- **Email**: admin@agentrise.com
- **Password**: password123

**⚠️ IMPORTANT**: Change the default password immediately!

---

## Deployment Options

### Option 1: Docker Compose (Recommended)

**Best for**: VPS deployment, full control, cost-effective

#### Architecture

```
┌─────────────────────────────────────────┐
│          Nginx Reverse Proxy            │
│     (SSL Termination + Load Balancing)  │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼───────┐      ┌───────▼────────┐
│   Frontend    │      │    Backend     │
│   (Nginx)     │      │  (Node.js)     │
│   Port 80     │      │   Port 5000    │
└───────────────┘      └────────┬───────┘
                                │
                       ┌────────▼────────┐
                       │     MySQL       │
                       │   Database      │
                       └─────────────────┘
```

#### Step-by-Step Guide

**1. Set up VPS**

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

**2. Clone Repository**

```bash
# Create application directory
mkdir -p /opt/agentrise
cd /opt/agentrise

# Clone repository
git clone https://github.com/yourusername/AgentRisePortal.git .

# Set permissions
chown -R $USER:$USER /opt/agentrise
```

**3. Configure Environment**

```bash
# Copy production environment
cp .env.production.example .env.production

# Generate strong secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET

# Edit environment file
nano .env.production
```

Required changes in `.env.production`:
- Set `DB_PASSWORD` to a strong password
- Set `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Set `CORS_ORIGIN` to your frontend domain
- Set `VITE_API_URL` to your backend domain

**4. Deploy**

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

**5. Verify Deployment**

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs -f

# Check health
curl http://localhost/health
curl http://localhost:5000/health
```

**6. Set up Nginx Reverse Proxy (Optional but Recommended)**

```bash
# Install Nginx on host
apt install nginx -y

# Create Nginx configuration
nano /etc/nginx/sites-available/agentrise
```

Add this configuration:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost;
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

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
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

Enable the site:

```bash
ln -s /etc/nginx/sites-available/agentrise /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

### Option 2: VPS (DigitalOcean, Linode, AWS EC2)

**Best for**: Maximum control, custom infrastructure

#### DigitalOcean Droplet

**1. Create Droplet**

- Size: 2 vCPUs, 4GB RAM minimum
- OS: Ubuntu 22.04 LTS
- Enable monitoring
- Add SSH keys

**2. Initial Setup**

```bash
# Create non-root user
adduser agentrise
usermod -aG sudo agentrise
usermod -aG docker agentrise

# Switch to new user
su - agentrise
```

**3. Configure Firewall**

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

**4. Follow Docker Compose deployment steps** (from Option 1)

#### AWS EC2

**1. Launch EC2 Instance**

- AMI: Ubuntu Server 22.04 LTS
- Instance type: t3.medium or larger
- Storage: 30GB GP3
- Security Group: Allow ports 22, 80, 443

**2. Connect and Deploy**

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@ec2-instance-ip

# Follow Docker Compose deployment steps
```

#### Cost Estimates

| Provider | Instance Type | vCPU | RAM | Storage | Cost/Month |
|----------|---------------|------|-----|---------|------------|
| DigitalOcean | Basic Droplet | 2 | 4GB | 80GB SSD | $24 |
| Linode | Shared CPU | 2 | 4GB | 80GB SSD | $24 |
| AWS EC2 | t3.medium | 2 | 4GB | 30GB GP3 | ~$35 |
| Hetzner | CX21 | 2 | 4GB | 40GB SSD | €5.83 (~$6) |

---

### Option 3: Platform-as-a-Service (Render, Railway)

**Best for**: Simplified deployment, auto-scaling, managed services

#### Render.com Deployment

**1. Create Render Account**

Sign up at https://render.com

**2. Create MySQL Database**

- New → PostgreSQL (or use external MySQL)
- Plan: Starter ($7/month)
- Note the connection string

**3. Deploy Backend**

- New → Web Service
- Connect GitHub repository
- Settings:
  - Name: `agentrise-backend`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment: Add all variables from `.env.production.example`

**4. Deploy Frontend**

- New → Static Site
- Connect GitHub repository
- Settings:
  - Name: `agentrise-frontend`
  - Build Command: `npm run build`
  - Publish Directory: `dist`
  - Environment Variables:
    - `VITE_API_URL`: Your backend URL

**5. Custom Domains**

- Add custom domains in Render dashboard
- Update DNS records:
  - Frontend: `A` record to Render IP
  - Backend: `CNAME` to Render domain

#### Railway.app Deployment

**1. Create Railway Account**

Sign up at https://railway.app

**2. New Project from GitHub**

- Connect GitHub repository
- Railway auto-detects services

**3. Configure Services**

```yaml
# railway.json (create in project root)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**4. Add MySQL**

- New → Database → MySQL
- Link to backend service

**5. Environment Variables**

Add all variables from `.env.production.example`

#### Cost Estimates

| Platform | Tier | Features | Cost/Month |
|----------|------|----------|------------|
| Render | Starter | 512MB RAM, SSL | $7/service |
| Railway | Hobby | $5 credit/month | $5+ |
| Heroku | Eco | 512MB RAM | $5/dyno |

---

### Option 4: Separate Hosting (Vercel + Heroku/Railway)

**Best for**: Frontend on CDN, backend on specialized service

#### Frontend on Vercel

**1. Connect Repository**

- Sign up at https://vercel.com
- Import GitHub repository
- Framework: Vite
- Root Directory: `/`

**2. Build Settings**

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**3. Environment Variables**

```env
VITE_API_URL=https://your-backend.herokuapp.com/api/v1
VITE_APP_NAME=AgentRise Insurance Portal
VITE_APP_VERSION=1.0.0
```

**4. Custom Domain**

- Add domain in Vercel dashboard
- Update DNS records

#### Backend on Heroku

**1. Create Heroku App**

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create agentrise-backend

# Add MySQL (ClearDB add-on)
heroku addons:create cleardb:ignite
```

**2. Configure**

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_here
heroku config:set CORS_ORIGIN=https://yourdomain.com

# Get database URL
heroku config:get CLEARDB_DATABASE_URL
```

**3. Deploy**

```bash
# Add heroku remote
heroku git:remote -a agentrise-backend

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npm run db:migrate
heroku run npm run db:seed
```

---

## SSL/HTTPS Setup

### Option 1: Let's Encrypt with Certbot (Free)

**Recommended for VPS deployment**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot automatically:
- Obtains SSL certificates
- Configures Nginx
- Sets up auto-renewal

### Option 2: Cloudflare (Free SSL + CDN)

**Best for**: Additional DDoS protection, CDN, DNS management

1. **Add domain to Cloudflare**
   - Sign up at https://cloudflare.com
   - Add your domain
   - Update nameservers at registrar

2. **SSL Settings**
   - SSL/TLS → Full (strict)
   - Edge Certificates → Always Use HTTPS: On
   - Automatic HTTPS Rewrites: On

3. **DNS Records**
   ```
   Type  Name  Content            Proxy
   A     @     your-server-ip     Proxied
   A     www   your-server-ip     Proxied
   A     api   your-server-ip     Proxied
   ```

4. **Page Rules** (optional)
   - `http://*yourdomain.com/*` → Always Use HTTPS

### Option 3: Platform SSL (Automatic)

Render, Vercel, Railway, and Heroku provide automatic SSL certificates.

---

## CI/CD with GitHub Actions

### Setup

The repository includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that automatically:

1. **Tests** - Runs linter and tests on push/PR
2. **Builds** - Creates Docker images
3. **Deploys** - Deploys to production on main branch

### Required Secrets

Add these secrets in GitHub Repository Settings → Secrets:

```
VITE_API_URL              # Frontend API URL
VITE_APP_NAME             # App name
DEPLOY_HOST               # Server IP/hostname
DEPLOY_USER               # SSH username
DEPLOY_SSH_KEY            # SSH private key
```

### Generate SSH Key for Deployment

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions"  -f github-deploy-key

# Add public key to server
ssh-copy-id -i github-deploy-key.pub user@your-server

# Add private key to GitHub Secrets as DEPLOY_SSH_KEY
cat github-deploy-key
```

### Workflow Triggers

- **Push to main**: Full CI/CD pipeline with deployment
- **Push to develop**: CI tests only
- **Pull Request**: CI tests only

### Manual Deployment

Trigger manual deployment:

```bash
# Via GitHub Actions UI
Actions → CI/CD Pipeline → Run workflow
```

---

## Database Management

### Migrations

Run database migrations:

```bash
# Docker
docker compose exec backend npm run db:migrate

# Direct
cd backend && npm run db:migrate
```

### Seeding

Add demo data:

```bash
docker compose exec backend npm run db:seed
```

### Backup

Create database backup:

```bash
# Using included script
./scripts/backup.sh

# Manual backup
docker compose exec database mysqldump -u root -p agentrise_db > backup.sql
```

### Restore

Restore from backup:

```bash
# Decompress if needed
gunzip backup.sql.gz

# Restore
docker compose exec -T database mysql -u root -p agentrise_db < backup.sql
```

### Automated Backups

Set up daily backups with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/agentrise/scripts/backup.sh >> /var/log/agentrise-backup.log 2>&1
```

---

## Monitoring & Logging

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database

# Last 100 lines
docker compose logs --tail=100 backend
```

### Health Checks

```bash
# Frontend health
curl http://localhost/health

# Backend health
curl http://localhost:5000/health

# Database health
docker compose exec database mysqladmin ping -h localhost
```

### Monitoring Tools (Optional)

**1. Prometheus + Grafana**

```bash
# Add to docker-compose.yml
# See: https://github.com/prometheus/prometheus
```

**2. Uptime Monitoring**

- UptimeRobot (free)
- Pingdom
- StatusCake

**3. Application Performance Monitoring (APM)**

- New Relic
- DataDog
- Sentry (error tracking)

---

## Production Environment Configuration

### Generate Secrets

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Database Password
openssl rand -base64 24
```

### Minimum Required Variables

```env
# Database
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>

# CORS
CORS_ORIGIN=https://yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com/api/v1
```

### Security Checklist

- [ ] Strong database password (16+ characters)
- [ ] Unique JWT secrets (never reuse)
- [ ] CORS restricted to your domain only
- [ ] HTTPS enabled
- [ ] Firewall configured (only ports 80, 443, 22)
- [ ] SSH key-based authentication
- [ ] Default passwords changed
- [ ] Database not exposed publicly
- [ ] Environment variables not in version control
- [ ] Regular backups enabled
- [ ] Monitoring/alerting configured

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs backend

# Common issues:
# - Database not ready: Wait 30 seconds and retry
# - Port conflict: Change PORT in .env
# - Permission issues: Check file ownership
```

### Database connection failed

```bash
# Verify database is running
docker compose ps database

# Check connection
docker compose exec backend npm run db:migrate

# Reset database (⚠️ deletes data)
docker compose down -v
docker compose up -d
```

### Frontend can't connect to backend

1. Check CORS_ORIGIN in backend .env
2. Verify VITE_API_URL in frontend .env
3. Check network connectivity
4. Verify backend is running: `curl http://localhost:5000/health`

### SSL certificate issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Performance issues

1. **Check resource usage**
   ```bash
   docker stats
   ```

2. **Scale services**
   ```bash
   docker compose up -d --scale backend=3
   ```

3. **Optimize database**
   ```sql
   OPTIMIZE TABLE customers, leads, policies;
   ```

### Logs filling disk

```bash
# Limit log size in docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] HTTPS working correctly
- [ ] Login functionality working
- [ ] Database migrations completed
- [ ] Demo data seeded (if needed)
- [ ] Default passwords changed
- [ ] Backups configured
- [ ] Monitoring/alerting set up
- [ ] DNS records updated
- [ ] Firewall configured
- [ ] CI/CD pipeline working
- [ ] Error tracking configured
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Cross-browser testing completed

---

## Support & Resources

- **Documentation**: `backend/README.md`, `FRONTEND_API_INTEGRATION.md`
- **Docker Docs**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/
- **GitHub Actions**: https://docs.github.com/en/actions

---

## Quick Reference

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f
```

### Backup Database
```bash
./scripts/backup.sh
```

### Update Application
```bash
git pull
docker compose up -d --build
```

### Restart Service
```bash
docker compose restart backend
```

---

**Deployment complete!** 🚀

Your AgentRise Insurance Portal is now running in production. For issues, check the troubleshooting section or review logs.
