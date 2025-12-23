#!/usr/bin/env bash
set -e

APP_DIR="/home/ubuntu/app/miniproject4-next"
APP_NAME="next-app"
LOG_FILE="/home/ubuntu/app/deploy.log"

cd "$APP_DIR"

echo "===== DEPLOY START $(date) =====" >> "$LOG_FILE"

# 의존성 설치 (필요 시)
if [ ! -d "node_modules" ]; then
  echo "node_modules not found. Installing..." >> "$LOG_FILE"
  npm ci --omit=dev >> "$LOG_FILE" 2>&1
fi

# 기존 pm2 프로세스 종료 (없어도 무시)
pm2 delete "$APP_NAME" || true

# pm2로 실행
pm2 start npm --name "$APP_NAME" -- start >> "$LOG_FILE" 2>&1

# pm2 상태 저장 (재부팅 대비)
pm2 save >> "$LOG_FILE" 2>&1

echo "===== DEPLOY END $(date) =====" >> "$LOG_FILE"