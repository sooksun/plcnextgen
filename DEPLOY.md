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
| เปิดได้แต่พอร์ตไม่ตรง | พอร์ตใน docker-compose เป็น 9902 | เปิด `http://<IP>:9902` (ไม่ใช่ 3000; 3000 เป็นแค่ตอนรัน `npm run dev` บนเครื่องตัวเอง) |

**เช็คลิสต์บน server ก่อน build:**
1. มีไฟล์ `.env` ในโฟลเดอร์โปรเจกต์ (เดียวกับ `docker-compose.yml`)
2. ใน `.env` มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ไม่ว่าง
3. รัน `docker compose up -d --build` จากโฟลเดอร์เดียวกัน
4. เปิดด้วยพอร์ตที่ map ไว้ (เช่น 9902)

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
