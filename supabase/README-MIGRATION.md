# Supabase: Migration และการเชื่อมต่อ

## 1. เพิ่มคอลัมน์ `shared_to_plc_id` (จำเป็นสำหรับการแชร์เข้า PLC)

ถ้าแชร์บันทึกเข้า PLC แล้วไม่โผล่ในกลุ่ม แสดงว่าตาราง `notes` ยังไม่มีคอลัมน์นี้

1. เปิด **Supabase Dashboard** → โปรเจกต์ของคุณ  
2. ไปที่ **SQL Editor**  
3. เปิดไฟล์ `supabase/migrations/20250205000000_add_shared_to_plc_id.sql` ในโปรเจกต์  
4. Copy SQL ทั้งหมดไปวางใน SQL Editor แล้วกด **Run**

หรือรันคำสั่งนี้โดยตรง:

```sql
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS shared_to_plc_id text;

COMMENT ON COLUMN public.notes.shared_to_plc_id IS 'กลุ่ม PLC ที่แชร์ไป เช่น plc-thai';
```

## 2. ตรวจสอบการเชื่อมต่อ

ในแอป ตรวจสอบว่า:

- ไฟล์ `.env` (หรือ `.env.local`) มี:
  - `VITE_SUPABASE_URL=https://xxxx.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=eyJ...`
- เปิด Console (F12) ตอนแชร์บันทึก:
  - ถ้าเห็น `[useNotes] Supabase insert with shared_to_plc_id failed` = ยังไม่ได้รัน migration ด้านบน
  - ถ้าเห็น `Note saved: ... (Supabase)` = บันทึกลง Supabase แล้ว

## 3. ตารางสนทนา PLC (`plc_chat_messages`)

เก็บข้อความในห้องสนทนาของแต่ละกลุ่ม PLC ลงฐานข้อมูล

1. เปิด **Supabase Dashboard** → **SQL Editor**
2. เปิดไฟล์ `supabase/migrations/20250205100000_plc_chat_messages.sql` แล้ว copy SQL ทั้งหมดไปวางใน SQL Editor → **Run**

หรือรันเฉพาะส่วนสร้างตาราง:

```sql
CREATE TABLE IF NOT EXISTS public.plc_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plc_id text NOT NULL,
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plc_chat_messages_plc_created
  ON public.plc_chat_messages (plc_id, created_at ASC);

ALTER TABLE public.plc_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read plc_chat_messages" ON public.plc_chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow insert plc_chat_messages" ON public.plc_chat_messages FOR INSERT WITH CHECK (true);
```

- **Realtime:** ถ้าต้องการให้ข้อความใหม่โผล่ทันทีโดยไม่ต้องรีเฟรช ไปที่ **Database** → **Replication** แล้วเพิ่มตาราง `plc_chat_messages` ใน publication `supabase_realtime` (หรือรันบรรทัด `ALTER PUBLICATION supabase_realtime ADD TABLE public.plc_chat_messages;` ใน SQL Editor)

หลังรัน migration แล้ว แชทในแท็บ "สนทนา" ของแต่ละ PLC จะเก็บลง Supabase และ sync ระหว่างอุปกรณ์/ผู้ใช้ได้

## 4. ตรวจสอบ RLS (Row Level Security)

ถ้า insert/select ไม่ทำงาน อาจเป็นเพราะ RLS:

- ไปที่ **Table Editor** → ตาราง `notes` → **Policies**
- ตรวจสอบว่ามี policy ให้ผู้ใช้ที่ login แล้วสามารถ INSERT และ SELECT แถวของตัวเองได้
