# Deployment Scripts

This directory contains utility scripts for deploying and managing the AgentRise Portal.

## Available Scripts

### `deploy.sh`

Main deployment script that:
- Pulls latest Docker images
- Stops existing containers
- Builds and starts new containers
- Runs database migrations
- Seeds database (if needed)
- Cleans up old images

**Usage:**
```bash
./scripts/deploy.sh
```

**Prerequisites:**
- Docker and Docker Compose installed
- `.env.production` file configured

### `backup.sh`

Database backup script that:
- Creates compressed SQL backup
- Stores in `./backups` directory
- Removes backups older than 30 days

**Usage:**
```bash
./scripts/backup.sh
```

**Restore from backup:**
```bash
gunzip backups/agentrise_backup_YYYYMMDD_HHMMSS.sql.gz
docker compose exec -T database mysql -u root -p agentrise_db < backups/agentrise_backup_YYYYMMDD_HHMMSS.sql
```

## Automation

### Schedule Daily Backups

Add to crontab:
```bash
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /opt/agentrise/scripts/backup.sh >> /var/log/agentrise-backup.log 2>&1
```

### Schedule Weekly Restarts

```bash
# Restart services every Sunday at 3 AM
0 3 * * 0 cd /opt/agentrise && docker compose restart >> /var/log/agentrise-restart.log 2>&1
```

## Manual Operations

### View Running Containers
```bash
docker compose ps
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database
```

### Restart Services
```bash
# All services
docker compose restart

# Specific service
docker compose restart backend
```

### Update Application
```bash
cd /opt/agentrise
git pull
docker compose up -d --build
docker compose exec backend npm run db:migrate
```

### Clean Docker Resources
```bash
# Remove unused containers, networks, images
docker system prune -af

# Remove volumes (⚠️ deletes data!)
docker system prune -af --volumes
```

## Troubleshooting

### Deployment fails
```bash
# Check logs
docker compose logs

# Verify environment variables
cat .env.production

# Check disk space
df -h

# Check Docker status
docker ps -a
```

### Database connection issues
```bash
# Check if database is running
docker compose ps database

# View database logs
docker compose logs database

# Verify database credentials
docker compose exec database mysql -u root -p
```

### Out of disk space
```bash
# Check usage
df -h

# Clean Docker
docker system prune -af

# Clean old backups
rm -f backups/*$(date -d '30 days ago' +%Y%m%d)*.sql.gz
```

## Security Notes

- Scripts require proper file permissions (`chmod +x`)
- Database backups contain sensitive data - store securely
- Never commit `.env.production` to version control
- Regularly rotate database passwords
- Monitor script execution logs

For more information, see [DEPLOYMENT.md](../DEPLOYMENT.md)
