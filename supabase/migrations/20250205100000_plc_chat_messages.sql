-- ตารางเก็บข้อความสนทนาในห้อง PLC
-- รันใน Supabase Dashboard: SQL Editor → วางแล้ว Run

-- สร้างตาราง
CREATE TABLE IF NOT EXISTS public.plc_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plc_id text NOT NULL,
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.plc_chat_messages IS 'ข้อความในห้องสนทนาแต่ละกลุ่ม PLC';
COMMENT ON COLUMN public.plc_chat_messages.plc_id IS 'รหัสกลุ่ม PLC เช่น plc-thai, plc-math';
COMMENT ON COLUMN public.plc_chat_messages.sender_id IS 'รหัสผู้ส่ง (จากระบบ auth)';
COMMENT ON COLUMN public.plc_chat_messages.sender_name IS 'ชื่อผู้ส่งสำหรับแสดงในแชท';
COMMENT ON COLUMN public.plc_chat_messages.body IS 'เนื้อหาข้อความ';

-- index สำหรับดึงข้อความตาม plc_id เรียงตามเวลา
CREATE INDEX IF NOT EXISTS idx_plc_chat_messages_plc_created
  ON public.plc_chat_messages (plc_id, created_at ASC);

-- เปิด RLS (Row Level Security)
ALTER TABLE public.plc_chat_messages ENABLE ROW LEVEL SECURITY;

-- นโยบาย: ให้อ่านและเขียนได้ (ปรับเป็นใช้ auth.uid() ได้ถ้าใช้ Supabase Auth)
-- ตอนนี้ใช้ anon key ได้ เพื่อให้แอปที่ล็อกอินแล้วใช้งานได้
CREATE POLICY "Allow read plc_chat_messages"
  ON public.plc_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Allow insert plc_chat_messages"
  ON public.plc_chat_messages FOR INSERT
  WITH CHECK (true);

-- เปิด Realtime สำหรับตารางนี้ (ให้ข้อความใหม่โผล่ทันที)
ALTER PUBLICATION supabase_realtime ADD TABLE public.plc_chat_messages;
