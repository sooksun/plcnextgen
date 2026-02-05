#!/bin/bash
# Deploy บน Server (หลัง git pull)
# ต้องมีไฟล์ .env และมีค่า VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY ก่อน build

set -e
cd "$(dirname "$0")/.."

echo "=== ตรวจสอบ .env ==="
if [ ! -f .env ]; then
  echo "ERROR: ไม่พบไฟล์ .env"
  echo "สร้างไฟล์ .env จาก .env.example แล้วใส่ค่า Supabase จริง:"
  echo "  cp .env.example .env"
  echo "  nano .env   # แก้ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY"
  exit 1
fi

url_line=$(grep -E '^VITE_SUPABASE_URL=' .env 2>/dev/null | cut -d= -f2-)
key_line=$(grep -E '^VITE_SUPABASE_ANON_KEY=' .env 2>/dev/null | cut -d= -f2-)
if [ -z "$url_line" ] || [ "$url_line" = "https://your-project.supabase.co" ] || [ -z "$key_line" ] || [ "$key_line" = "your-anon-key" ]; then
  echo "ERROR: ใน .env ต้องมี VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY เป็นค่าโปรเจกต์ Supabase จริง (ไม่ใช่ placeholder)"
  echo "ถ้าไม่มี ค่าเหล่านี้จะถูกฝังลงแอปตอน build ทำให้บน server แสดงแต่ข้อมูลตัวอย่างและปุ่มแชร์ไม่ทำงาน"
  exit 1
fi

echo "=== ดึงโค้ดล่าสุด ==="
git pull

echo "=== Build และรัน Docker ==="
docker compose down
docker compose build --no-cache
docker compose up -d

echo "=== เสร็จแล้ว เปิดใช้ที่พอร์ต 9902 (หรือตามที่ map ใน docker-compose.yml) ==="
