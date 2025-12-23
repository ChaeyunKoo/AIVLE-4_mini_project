#!/bin/bash
set +e   # 실패해도 종료하지 않음

APP_DIR="/home/ubuntu/app"
PID_FILE="$APP_DIR/app.pid"

# PID 파일이 있으면 프로세스 종료
if [ -f "$PID_FILE" ]; then
  PGID=$(cat "$PID_FILE")

  # 프로세스 그룹 전체 종료 (없어도 실패 무시)
  kill -TERM -- -$PGID || true

  # PID 파일 삭제
  rm -f "$PID_FILE"
fi

exit 0