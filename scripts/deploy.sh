#!/bin/bash
set -e

# 1. 환경 변수 로드 (PM2 및 Node 명령어 인식용)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "=== Deploy started ==="
# appspec.yml에서 설정한 destination 경로와 일치해야 합니다.
APP_DIR=/home/ubuntu/app/miniproject4-next  
cd $APP_DIR

# 2. 권한 확인 (CodeDeploy가 파일을 가져올 때 소유권을 ubuntu로 유지하게 함)
sudo chown -R ubuntu:ubuntu .

# 3. [수정됨] 빌드와 설치 과정 생략
# 이미 CodeBuild에서 .next와 node_modules를 만들어서 보내줬으므로 필요 없습니다.
echo "Skip: npm install & npm run build (Already done in CodeBuild)"

# 4. 앱 재시작
echo "Restarting app with PM2..."
# 기존 프로세스 삭제 (실패해도 무시)
pm2 delete front || true

# 신규 프로세스 실행
# -- run start는 package.json의 "start" 스크립트를 실행하며, 3000번 포트를 사용합니다.
pm2 start npm --name "front" -- run start -- -p 3000

# PM2 설정 저장 (서버 재부팅 시 자동 실행을 위해)
pm2 save

echo "=== Deploy finished ==="