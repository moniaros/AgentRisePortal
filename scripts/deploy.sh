#!/bin/bash

# AgentRise Portal Deployment Script
# This script deploys the application using Docker Compose

set -e  # Exit on error

echo "🚀 AgentRise Portal Deployment Script"
echo "======================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "   Please copy .env.production.example to .env.production and fill in the values."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo "📦 Pulling latest images..."
docker-compose -f docker-compose.yml pull

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.yml down

echo "🏗️  Building and starting containers..."
docker-compose -f docker-compose.yml up -d --build

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run db:migrate

echo "🌱 Seeding database (if needed)..."
docker-compose exec -T backend npm run db:seed || true

echo "🧹 Cleaning up old Docker images..."
docker system prune -af --volumes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "   Backend:  http://localhost:${PORT:-5000}"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
