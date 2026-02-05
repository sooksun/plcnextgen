-- เพิ่มคอลัมน์ shared_to_plc_id ในตาราง notes สำหรับเก็บว่าบันทึกแชร์ไปกลุ่ม PLC ไหน
-- รันใน Supabase Dashboard: SQL Editor → วางแล้ว Run

-- เพิ่มคอลัมน์ (ถ้ามีอยู่แล้วจะ error ได้ ให้ข้ามหรือรันแยก)
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS shared_to_plc_id text;

-- ใส่ comment
COMMENT ON COLUMN public.notes.shared_to_plc_id IS 'กลุ่ม PLC ที่แชร์ไป เช่น plc-thai, plc-math';

-- ตรวจสอบว่ามีคอลัมน์ visibility (ถ้าไม่มีให้เพิ่ม)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notes' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE public.notes ADD COLUMN visibility text DEFAULT 'ส่วนตัว';
  END IF;
END $$;
