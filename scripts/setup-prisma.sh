#!/bin/bash
set -e

echo "🔧 Setting up Prisma..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
bunx prisma generate

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set. Skipping migrations."
  echo "📝 Set DATABASE_URL in .env to run migrations: bunx prisma migrate dev"
else
  echo "🗄️  Running migrations..."
  bunx prisma migrate deploy || echo "⚠️  Migration already applied or failed"
fi

echo "✅ Prisma setup complete!"
