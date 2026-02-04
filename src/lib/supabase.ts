import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing, falling back to localStorage');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseAvailable = !!supabase;

/** ตรวจสอบการเชื่อมต่อ Supabase จริง (ยิง query เล็กน้อย) */
export async function checkSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  details?: string;
}> {
  if (!supabase) {
    return {
      ok: false,
      message: 'ไม่ได้ตั้งค่า Supabase',
      details: !supabaseUrl ? 'ไม่มี VITE_SUPABASE_URL' : 'ไม่มี VITE_SUPABASE_ANON_KEY'
    };
  }
  try {
    const { data, error } = await supabase.from('notes').select('id').limit(1);
    if (error) {
      return {
        ok: false,
        message: 'เชื่อมต่อไม่ได้',
        details: error.message || error.code || String(error)
      };
    }
    return { ok: true, message: 'เชื่อมต่อ Supabase ได้ปกติ' };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return {
      ok: false,
      message: 'เกิดข้อผิดพลาด',
      details: err.message
    };
  }
}
