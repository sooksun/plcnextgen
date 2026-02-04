#!/bin/bash
# ติดตั้งและรัน PLC Next Gen บน Ubuntu Server ด้วย Docker
# Path: /DATA/AppData/www/plcnextgen

set -e
APP_PATH="/DATA/AppData/www/plcnextgen"
REPO_URL="https://github.com/sooksun/plcnextgen.git"

echo "=== PLC Next Gen - Install & Run (Docker) ==="
echo "Path: $APP_PATH"
echo ""

# 1. สร้างโฟลเดอร์
sudo mkdir -p /DATA/AppData/www
sudo chown -R "$USER:$USER" /DATA/AppData/www
mkdir -p "$APP_PATH"
cd "$APP_PATH"

# 2. ติดตั้ง Docker (ถ้ายังไม่มี)
if ! command -v docker &> /dev/null; then
  echo ">>> ติดตั้ง Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo ">>> กรุณาออกจาก shell แล้ว login ใหม่ แล้วรันสคริปต์นี้อีกครั้ง"
  exit 0
fi

# 3. ดึงโค้ด (clone หรือ pull)
if [ -d ".git" ]; then
  echo ">>> อัปเดตโค้ด (git pull)..."
  git pull origin main || true
else
  echo ">>> โคลนโปรเจกต์..."
  git clone "$REPO_URL" .
fi

# 4. สร้าง .env (ถ้ายังไม่มี)
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo ">>> สร้าง .env จาก .env.example แล้ว — กรุณาแก้ไข .env ให้ใส่ค่า Supabase จริง"
    echo "    nano .env"
    read -p "แก้ไข .env เรียบร้อยแล้วกด Enter เพื่อ build และรัน..."
  else
    echo ">>> สร้าง .env ด้วยมือ (ต้องมี VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY)"
    echo "    nano .env"
    exit 1
  fi
fi

# 5. Build และรันด้วย Docker Compose
echo ">>> Build และรัน Docker..."
docker compose up -d --build

echo ""
echo "=== เสร็จสิ้น ==="
echo "เปิดใช้ที่: http://$(hostname -I | awk '{print $1}'):3000"
echo "ดู log:    docker compose -f $APP_PATH/docker-compose.yml logs -f"
echo "หยุด:      cd $APP_PATH && docker compose down"
