#!/bin/bash
set -e

# 1. 환경 변수 로드 (NVM/Node 경로 확보)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "=== Deploy started ==="
APP_DIR=/home/ubuntu/app/miniproject4-next  
cd $APP_DIR

# 2. 권한 초기화 (아까 났던 EACCES 방지)
sudo chown -R ubuntu:ubuntu .

echo "Installing dependencies..."
npm install

echo "Building Next.js app..."
npm run build

echo "Restarting app with PM2..."
# 기존에 돌던 3000번 포트 프로세스를 PM2가 알아서 관리하게 함
# --update-env는 환경변수 변경사항을 반영함
pm2 delete front || true
pm2 start npm --name "front" -- run start -- -p 3000

echo "=== Deploy finished ==="