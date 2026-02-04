# ติดตั้งและรัน PLC Next Gen บน Ubuntu (Docker) — Path: /DATA/AppData/www/plcnextgen

## ชุดคำสั่ง (copy-paste ตามลำดับ)

### 1. เตรียมโฟลเดอร์และสิทธิ์
```bash
sudo mkdir -p /DATA/AppData/www
sudo chown -R "$USER:$USER" /DATA/AppData/www
```

### 2. ติดตั้ง Docker (ถ้ายังไม่มี)
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```
จากนั้น **logout แล้ว login ใหม่** (หรือเปิด terminal ใหม่) แล้วรันคำสั่งถัดไป

### 3. ไปที่ path และโคลนโปรเจกต์
```bash
cd /DATA/AppData/www/plcnextgen
```
ถ้ายังไม่มีโฟลเดอร์ `plcnextgen`:
```bash
cd /DATA/AppData/www
git clone https://github.com/sooksun/plcnextgen.git
cd plcnextgen
```

### 4. สร้างไฟล์ .env
```bash
cp .env.example .env
nano .env
```
แก้ค่าให้ถูกต้อง:
- `VITE_SUPABASE_URL` = URL โปรเจกต์ Supabase
- `VITE_SUPABASE_ANON_KEY` = anon key จาก Supabase

บันทึก (Ctrl+O, Enter) แล้วออก (Ctrl+X)

### 5. Build และรันใน Docker
```bash
cd /DATA/AppData/www/plcnextgen
docker compose up -d --build
```

### 6. เปิดใช้
- URL: `http://<IP-ของเซิร์ฟเวอร์>:3000`
- ดู IP: `hostname -I | awk '{print $1}'`

---

## คำสั่งจัดการ

| การกระทำ | คำสั่ง |
|----------|--------|
| ดู log | `cd /DATA/AppData/www/plcnextgen && docker compose logs -f` |
| หยุด | `cd /DATA/AppData/www/plcnextgen && docker compose down` |
| รันใหม่ | `cd /DATA/AppData/www/plcnextgen && docker compose up -d` |
| อัปเดตโค้ดแล้ว build ใหม่ | `cd /DATA/AppData/www/plcnextgen && git pull && docker compose up -d --build` |

---

## รันด้วยสคริปต์ (ทางเลือก)
```bash
chmod +x /DATA/AppData/www/plcnextgen/scripts/install-and-run-ubuntu.sh
/DATA/AppData/www/plcnextgen/scripts/install-and-run-ubuntu.sh
```
(ถ้าโคลนมาแล้วที่ path นี้แล้ว หรือ copy ไฟล์จากโปรเจกต์ไปไว้ที่ path นี้)
