#!/bin/bash
set -e

echo "=== Deploy started ==="

APP_DIR=/home/ubuntu/app/miniproject4-next

cd $APP_DIR

echo "Node version:"
node -v
npm -v

echo "Installing dependencies..."
npm install

echo "Building Next.js app..."
npm run build

echo "Restarting app with PM2..."
pm2 delete front || true
pm2 start npm --name front -- start

echo "=== Deploy finished ==="
