#!/bin/bash
# 기존 PM2 프로세스 안전하게 종료
echo "=== ApplicationStop: stopping existing PM2 app ==="
pm2 stop front || true
pm2 delete front || true
echo "=== ApplicationStop finished ==="