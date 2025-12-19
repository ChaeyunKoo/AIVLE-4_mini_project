#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # nvm 로드
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/$(nvm current)/bin

echo "=== Deploy started ==="
APP_DIR=/home/ubuntu/app/miniproject4-next  
cd $APP_DIR

echo "Node version:"
node -v || { echo "Node not found"; exit 1; }
npm -v

echo "Installing dependencies..."
npm install

echo "Building Next.js app..."
npm run build

echo "Restarting app with PM2..."
pm2 delete front || true
pm2 start npm --name front -- start

echo "=== Deploy finished ==="