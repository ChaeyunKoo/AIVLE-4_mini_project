#!/bin/bash

APP_DIR="/home/ubuntu/app"
PID_FILE="$APP_DIR/app.pid"
LOG_FILE="$APP_DIR/app.log"

# 디렉토리가 없으면 생성
if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    chmod 755 "$APP_DIR"
    chown ubuntu:ubuntu "$APP_DIR"
fi

# 로그 파일이 없으면 생성
if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
    chmod 664 "$LOG_FILE"
    chown ubuntu:ubuntu "$LOG_FILE"
fi

# PID 확인 후 프로세스 종료
if [ -f "$PID_FILE" ]; then
  PGID=$(cat "$PID_FILE")

  # 프로세스 그룹 전체 종료
  kill -TERM -- -$PGID || true

  # PID 파일 삭제
  rm -f "$PID_FILE"

  # 로그 기록
  echo "App stopped (PGID: $PGID)" >> "$LOG_FILE"
else
  echo "No PID file found" >> "$LOG_FILE"
fi