# การติดตั้งบน Ubuntu Server 24.x.x (Docker Compose)

## 1. ติดตั้งบน Ubuntu Server 24.x.x ด้วย Docker Compose — **ได้**

### ความต้องการ
- Ubuntu Server 24.04 LTS (หรือ 24.x.x)
- Docker และ Docker Compose v2

### ขั้นตอน

```bash
# ติดตั้ง Docker (ถ้ายังไม่มี)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# ออกจาก shell แล้ว login ใหม่

# ติดตั้ง Docker Compose plugin (รวมใน Docker ใหม่แล้ว)
docker compose version
```

คลอนโปรเจกต์แล้วเข้าโฟลเดอร์:

```bash
cd /path/to/plcnextgen
```

**สำคัญ:** สร้างไฟล์ `.env` **บน server** (ต้องมีก่อน build):

```bash
cp .env.example .env
nano .env   # หรือ vi .env
```

แก้ให้เป็นค่า Supabase จริง (ห้ามเว้นว่าง):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

Build และรัน:

```bash
docker compose up -d --build
```

เปิดใช้ที่ **`http://<IP-server>:9902`** (พอร์ตใน docker-compose คือ 9902 → 80 ใน container)

หยุด:

```bash
docker compose down
```

---

## 1.1 ทำไมบน server เปิดแล้วไม่ขึ้น / ใช้ไม่ได้

| อาการ | สาเหตุ | วิธีแก้ |
|--------|--------|--------|
| หน้าเปล่า / ขาว | Build ครั้งที่รันบน server **ไม่มีไฟล์ .env** หรือค่า VITE_* ว่าง | สร้าง `.env` บน server ให้มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` แล้วรัน `docker compose up -d --build` ใหม่ |
| 404 ตอนกด refresh หรือเปิด URL ย่อย | Nginx ไม่ได้ส่งทุก path ไปที่ index.html | ใช้ Dockerfile ล่าสุดที่มี `nginx.conf` (SPA fallback) แล้ว build ใหม่ |
| ล็อกอิน/โหลดข้อมูลไม่ได้ | แอปถูก build โดยไม่มีค่า Supabase (ฝังลง bundle ตอน build) | Build ใหม่บน server **หลัง**สร้าง/แก้ `.env` แล้วสั่ง `docker compose build --no-cache` จากนั้น `docker compose up -d` |
| รายการบันทึกที่แชร์เป็น mock / ปุ่มแชร์บันทึกไม่ทำงาน | Build บน server ทำโดยไม่มี `.env` หรือค่า `VITE_SUPABASE_*` ว่าง | สร้าง/แก้ `.env` บน server ให้มีค่า Supabase จริง แล้ว `docker compose build --no-cache` และ `docker compose up -d` ใหม่ |
| เปิดได้แต่พอร์ตไม่ตรง | พอร์ตใน docker-compose เป็น 9902 | เปิด `http://<IP>:9902` (ไม่ใช่ 3000; 3000 เป็นแค่ตอนรัน `npm run dev` บนเครื่องตัวเอง) |

**เช็คลิสต์บน server ก่อน build:**
1. มีไฟล์ `.env` ในโฟลเดอร์โปรเจกต์ (เดียวกับ `docker-compose.yml`)
2. ใน `.env` มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ไม่ว่าง
3. รัน `docker compose up -d --build` จากโฟลเดอร์เดียวกัน
4. เปิดด้วยพอร์ตที่ map ไว้ (เช่น 9902)

---

## 1.2 ขั้นตอนบน Server จริง (หลัง upload ขึ้น GitHub)

เช่น server ที่ `https://plcnextgen.cnppai.com/` — หลัง `git pull` **ต้องมี .env ก่อน build** ถึงจะได้ข้อมูลจาก database จริงและปุ่ม "แชร์บันทึกของฉัน" ทำงาน

**ครั้งแรกบน server (หรือครั้งแรกที่ยังไม่มี .env):**

```bash
cd /DATA/AppData/www/plcnextgen   # หรือ path จริงของโปรเจกต์บน server

# สร้าง .env และใส่ค่า Supabase จริง (ห้ามข้ามขั้นตอนนี้)
cp .env.example .env
nano .env   # แก้ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ให้เป็นค่าโปรเจกต์ Supabase จริง
```

**ทุกครั้งที่ deploy (หลัง git pull):**

```bash
cd /DATA/AppData/www/plcnextgen
git pull
docker compose down
docker compose build --no-cache   # ต้อง build ใหม่เพื่อให้ค่าใน .env ถูกฝังลงแอป
docker compose up -d
```

**หรือใช้สคริปต์ (จะตรวจสอบว่ามี .env และค่าครบก่อน build):**

```bash
cd /DATA/AppData/www/plcnextgen
chmod +x scripts/server-deploy.sh
./scripts/server-deploy.sh
```

ถ้า build โดยไม่มี .env หรือค่า VITE_* ว่าง แอปบน server จะแสดงแถบ "โหมดออฟไลน์" รายการบันทึกที่แชร์จะเป็นเพียงตัวอย่าง และปุ่ม "แชร์บันทึกของฉันเข้า PLC" จะเก็บข้อมูลเฉพาะในเบราว์เซอร์ (ไม่ sync กับ database)

---

## 1.3 แท็บ "บันทึกที่แชร์" ว่าง / ยังไม่มีบันทึกที่แชร์ในกลุ่มนี้

ถ้าเชื่อม Supabase ได้ปกติ (สถานะระบบแสดง "เชื่อมต่อ Supabase ได้ปกติ") แต่แท็บ "บันทึกที่แชร์" ในกลุ่ม PLC แสดงว่า "ยังไม่มีบันทึกที่แชร์ในกลุ่มนี้" ให้ตรวจตามนี้:

**เช็คลิสต์ฐานข้อมูล (Supabase):**

1. **Migration ต้องรันแล้ว**
   - ตาราง `notes` ต้องมีคอลัมน์ `shared_to_plc_id` (text) และ `visibility` (text)
   - รัน migration ในโฟลเดอร์ `supabase/migrations/` ผ่าน Supabase Dashboard → SQL Editor (เช่น `20250205000000_add_shared_to_plc_id.sql`)

2. **RLS (Row Level Security)**
   - ตาราง `notes` ต้องมี policy ให้ผู้ใช้ที่ล็อกอินแล้ว **SELECT** และ **INSERT/UPDATE** แถวของตัวเองได้
   - ถ้า RLS บังคับแต่ไม่มี policy ที่อนุญาตอ่านแถวที่ `visibility = 'PLC'` และ `shared_to_plc_id = <plc_id>` ผู้ใช้จะไม่เห็นบันทึกที่แชร์

3. **ข้อมูลจริง**
   - บันทึกที่แชร์เข้า PLC ต้องมี `visibility = 'PLC'` และ `shared_to_plc_id` = รหัสกลุ่ม PLC (เช่น `plc-thai`)
   - ตรวจใน Supabase → Table Editor → `notes` ว่ามีแถวที่ `shared_to_plc_id` ไม่ว่างและตรงกับกลุ่มที่เปิดอยู่

**ฝั่งแอป:** แอปจะกรองเฉพาะ `visibility === 'PLC'` และ `shared_to_plc_id` ตรงกับกลุ่ม PLC ที่เลือก ดังนั้นถ้า migration ยังไม่รันหรือ RLS ตัดการอ่าน แท็บจะว่างแม้จะมีข้อมูลในตาราง

---

## 2. บันทึกเสียงการประชุม 1–2 ชั่วโมง — **ได้แต่มีข้อจำกัด**

- **ตอนนี้**: แอปใช้ **Web Speech API** (ถอดเสียงในเบราว์เซอร์) **ไม่มีการบันทึกไฟล์เสียง**  
  มีเฉพาะ **ข้อความถอดเสียง (transcript)** แบบ real-time และไม่มีตัวจำกัดเวลาในโค้ด (จับได้เรื่อยๆ ตามที่เบราว์เซอร์รองรับ)

- **ข้อจำกัดที่อาจเจอเมื่อบันทึกยาว 1–2 ชม.**
  - เบราว์เซอร์หรือบริการถอดเสียงอาจตัดเซสชัน (timeout / reconnect)
  - แท็บอาจถูกปิดหรือเบราว์เซอร์คืนหน่วยความจำ
  - การเชื่อมต่อเน็ตไม่เสถียรอาจทำให้ขาดช่วง

**แนวทางถ้าต้องการประชุมยาว 1–2 ชม. แนะนำ**  
- แบ่งบันทึกเป็นช่วง (เช่น 30–45 นาที) แล้วกดหยุดแล้วเริ่มใหม่ หรือ  
- พัฒนาต่อ: บันทึกไฟล์เสียงจริง (MediaRecorder) แล้วส่งไปถอดเสียงที่เซิร์ฟเวอร์ (เช่น Supabase + Edge Function เรียก STT API) เพื่อรองรับความยาวและความเสถียรที่ดีขึ้น

---

## 3. การบันทึกข้อมูล — **มีเฉพาะข้อความถอดเสียง ไม่มีไฟล์เสียง**

| ประเภทข้อมูล        | บันทึกหรือไม่ | รายละเอียด |
|---------------------|---------------|------------|
| **ไฟล์เสียง (audio)** | **ไม่บันทึก** | ไม่มีการอัดหรือเก็บไฟล์เสียงในแอปและใน Supabase |
| **ข้อความถอดเสียง (transcript)** | **บันทึก** | เก็บเฉพาะข้อความที่ถอดจากเสียง |

**ที่เก็บข้อความถอดเสียง**
- หลังกด "บันทึกและดูสรุป": เก็บใน **Supabase** ตาราง `notes` (ฟิลด์ `content`, `transcript`) และถ้า Supabase ไม่ใช้ได้จะ fallback ไป **localStorage** (เบราว์เซอร์)
- ก่อนกดบันทึก: ข้อความชั่วคราวอยู่ใน **localStorage** (`temp_transcript`) ในเบราว์เซอร์เท่านั้น

**สรุป**: ไม่มีการบันทึกข้อมูลเสียง มีเฉพาะการบันทึก **ข้อความที่ถอดจากเสียง** ลง Supabase หรือ localStorage ตามที่อธิบายข้างต้น
