#!/bin/bash

# Database Backup Script for AgentRise Portal

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="agentrise_backup_${TIMESTAMP}.sql"

echo "💾 AgentRise Database Backup"
echo "============================"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env.production not found, using defaults"
fi

DB_NAME=${DB_NAME:-agentrise_db}
DB_USER=${DB_USER:-agentrise}
DB_PASSWORD=${DB_PASSWORD:-agentrise123}

echo "📦 Creating backup of database: $DB_NAME"

# Create backup using Docker
docker-compose exec -T database mysqldump \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    "$DB_NAME" \
    > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

COMPRESSED_FILE="$BACKUP_FILE.gz"
FILE_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)

echo ""
echo "✅ Backup complete!"
echo "   File: $BACKUP_DIR/$COMPRESSED_FILE"
echo "   Size: $FILE_SIZE"
echo ""
echo "📋 To restore this backup:"
echo "   gunzip $BACKUP_DIR/$COMPRESSED_FILE"
echo "   docker-compose exec -T database mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $BACKUP_DIR/$BACKUP_FILE"
echo ""

# Remove backups older than 30 days
echo "🧹 Removing backups older than 30 days..."
find "$BACKUP_DIR" -name "agentrise_backup_*.sql.gz" -mtime +30 -delete

echo "✅ Cleanup complete!"
