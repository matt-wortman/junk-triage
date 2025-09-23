#!/bin/sh
set -e

echo "🚀 Starting Tech Triage Platform..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until npx prisma db push --accept-data-loss; do
  echo "Database not ready, retrying in 5 seconds..."
  sleep 5
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed the database if needed
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  No seed script found or seeding failed"

echo "🎉 Starting Next.js application..."

# Start the Next.js application
exec node server.js