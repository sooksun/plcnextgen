import { useState, useEffect, useCallback } from 'react';
import type { StoredNote } from '@/types';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

const STORAGE_KEY = 'school_notes';

// ---- localStorage fallback ----
function loadNotesFromStorage(): StoredNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotesToStorage(notes: StoredNote[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// รองรับทั้ง schema เก่า (title, content, created_at) และ schema ใหม่ (transcript เท่านั้น, text เป็น array)
function mapRowToNote(row: any): StoredNote {
  const rawContent = row.content ?? row.transcript ?? (Array.isArray(row.text) ? row.text.join(' ') : row.text);
  const content = typeof rawContent === 'string' ? rawContent : (rawContent ? String(rawContent) : '');
  const title = row.title || (content ? (content.slice(0, 50) + (content.length > 50 ? '…' : '')) : 'บันทึกเสียง');
  const date = row.created_at || row.createdAt || '';
  const ai_reflection = row.ai_reflection;
  const hasAiReflection =
    ai_reflection &&
    typeof ai_reflection === 'object' &&
    Array.isArray(ai_reflection.keyPoints) &&
    Array.isArray(ai_reflection.questions) &&
    Array.isArray(ai_reflection.suggestions);

  // รองรับ visibility จาก DB ที่อาจเป็น 'PLC' หรือ 'plc'
  const rawVisibility = (row.visibility || 'ส่วนตัว').toString().trim();
  const visibility =
    rawVisibility.toUpperCase() === 'PLC'
      ? 'PLC'
      : rawVisibility.toUpperCase() === 'ข้อเสนอ'
        ? 'ข้อเสนอ'
        : rawVisibility || 'ส่วนตัว';

  return {
    id: row.id,
    title,
    content,
    type: row.type || 'ประชุม',
    visibility,
    date,
    timestamp: date,
    tags: Array.isArray(row.tags) ? row.tags : [],
    source: row.source || 'voice',
    ai_reflection: hasAiReflection ? (ai_reflection as StoredNote['ai_reflection']) : undefined,
    shared_to_plc_id: row.shared_to_plc_id != null ? String(row.shared_to_plc_id) : undefined
  };
}

// ---- Supabase helpers ----
async function loadNotesFromSupabase(): Promise<StoredNote[]> {
  if (!supabase) return [];
  try {
    // ดึงคอลัมน์ที่ใช้แสดงและกรอง (รวม visibility, shared_to_plc_id) — ถ้า RLS บัง SELECT จะได้แถวว่าง
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, transcript, type, visibility, shared_to_plc_id, created_at, tags, source, ai_reflection, deleted_at')
      .is('deleted_at', null)
      .order('id', { ascending: false });
    if (error) {
      // ถ้า deleted_at column ยังไม่มี ให้ดึงทั้งหมดแทน
      if (error.message?.includes('deleted_at')) {
        const { data: allData, error: fallbackError } = await supabase
          .from('notes')
          .select('id, title, content, transcript, type, visibility, shared_to_plc_id, created_at, tags, source, ai_reflection')
          .order('id', { ascending: false });
        if (fallbackError) {
          console.error('Supabase load error:', fallbackError);
          return [];
        }
        const notes = (allData || []).map(mapRowToNote);
        notes.sort((a, b) => {
          const tA = new Date(a.timestamp || a.date || 0).getTime();
          const tB = new Date(b.timestamp || b.date || 0).getTime();
          return tB - tA;
        });
        return notes;
      }
      console.error('Supabase load error:', error);
      return [];
    }
    const notes = (data || []).map(mapRowToNote);
    notes.sort((a, b) => {
      const tA = new Date(a.timestamp || a.date || 0).getTime();
      const tB = new Date(b.timestamp || b.date || 0).getTime();
      return tB - tA;
    });
    return notes;
  } catch (e) {
    console.error('Supabase load error:', e);
    return [];
  }
}

async function insertNoteToSupabase(note: StoredNote): Promise<string | null> {
  if (!supabase) return null;

  const basePayload: Record<string, unknown> = {
    transcript: note.content,
    title: note.title,
    content: note.content,
    type: note.type,
    visibility: note.visibility,
    source: note.source,
    tags: note.tags || []
  };
  if (note.ai_reflection) basePayload.ai_reflection = note.ai_reflection;

  // ลอง insert แบบเต็ม (รวม shared_to_plc_id)
  const fullPayload = { ...basePayload };
  if (note.shared_to_plc_id) fullPayload.shared_to_plc_id = note.shared_to_plc_id;

  const { data, error } = await supabase.from('notes').insert(fullPayload).select('id').single();

  if (!error) {
    return data?.id || null;
  }

  // ถ้า error น่าจะเป็นเพราะคอลัมน์ shared_to_plc_id ยังไม่มี → ลอง insert โดยไม่ใส่คอลัมน์นี้
  const maybeMissingColumn =
    error.message?.includes('shared_to_plc_id') ||
    error.message?.includes('column') ||
    error.code === '42703';

  if (maybeMissingColumn && note.shared_to_plc_id) {
    console.warn(
      '[useNotes] Supabase insert with shared_to_plc_id failed (อาจยังไม่มีคอลัมน์). ลอง insert โดยไม่ใส่ shared_to_plc_id. Error:',
      error.message
    );
    const { data: data2, error: error2 } = await supabase
      .from('notes')
      .insert(basePayload)
      .select('id')
      .single();
    if (!error2) {
      console.warn('[useNotes] บันทึกสำเร็จแต่ไม่มี shared_to_plc_id. กรุณารัน migration ใน Supabase (ดู supabase/migrations)');
      return data2?.id || null;
    }
  }

  // fallback สุดท้าย: insert เฉพาะ transcript
  console.error('Supabase insert error:', error.message, error.code);
  const { data: data3, error: error3 } = await supabase
    .from('notes')
    .insert({ transcript: note.content, title: note.title, visibility: note.visibility })
    .select('id')
    .single();
  if (!error3) {
    return data3?.id || null;
  }
  console.error('Supabase insert fallback error:', error3.message);
  return null;
}

async function updateNoteInSupabase(id: string, patch: Partial<StoredNote>): Promise<boolean> {
  if (!supabase) return false;
  
  // สร้าง update payload แบบเต็ม
  const fullUpdateData: Record<string, unknown> = {};
  if (patch.title !== undefined) fullUpdateData.title = patch.title;
  if (patch.content !== undefined) {
    fullUpdateData.content = patch.content;
    fullUpdateData.transcript = patch.content; // อัปเดต transcript ด้วย
  }
  if (patch.type !== undefined) fullUpdateData.type = patch.type;
  if (patch.visibility !== undefined) fullUpdateData.visibility = patch.visibility;
  if (patch.tags !== undefined) fullUpdateData.tags = patch.tags;
  if (patch.source !== undefined) fullUpdateData.source = patch.source;
  if (patch.ai_reflection !== undefined) fullUpdateData.ai_reflection = patch.ai_reflection;
  if (patch.shared_to_plc_id !== undefined) fullUpdateData.shared_to_plc_id = patch.shared_to_plc_id;
  fullUpdateData.updated_at = new Date().toISOString();

  // ลอง update แบบเต็มก่อน
  const { error } = await supabase.from('notes').update(fullUpdateData).eq('id', id);
  if (!error) {
    return true;
  }
  
  console.warn('Full update failed, trying minimal update...', error.message);
  
  // ถ้าล้มเหลว ลองอัปเดตเฉพาะฟิลด์พื้นฐานที่น่าจะมี
  const minimalUpdateData: Record<string, unknown> = {};
  if (patch.content !== undefined) minimalUpdateData.transcript = patch.content;
  if (patch.ai_reflection !== undefined) minimalUpdateData.ai_reflection = patch.ai_reflection;
  
  if (Object.keys(minimalUpdateData).length === 0) {
    // ไม่มีอะไรอัปเดตในแบบ minimal ถือว่าสำเร็จ (UI จะ fallback ไป local)
    console.warn('No minimal fields to update, falling back to local');
    return false;
  }
  
  const { error: minimalError } = await supabase.from('notes').update(minimalUpdateData).eq('id', id);
  if (minimalError) {
    console.error('Supabase minimal update error:', minimalError);
    return false;
  }
  return true;
}

// Soft delete: อัปเดต deleted_at แทนการลบจริง
async function softDeleteNoteInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('Supabase soft delete error:', error);
    return false;
  }
  return true;
}

// ---- Hook ----
export function useNotes() {
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (isSupabaseAvailable) {
      const fromSupabase = await loadNotesFromSupabase();
      const fromStorage = loadNotesFromStorage();
      const supabaseIds = new Set(fromSupabase.map((n) => n.id));
      const merged = [...fromSupabase];
      for (const n of fromStorage) {
        if (!supabaseIds.has(n.id)) {
          merged.push(n);
          supabaseIds.add(n.id);
        }
      }
      merged.sort((a, b) => {
        const tA = new Date(a.timestamp || a.date || 0).getTime();
        const tB = new Date(b.timestamp || b.date || 0).getTime();
        return tB - tA;
      });
      setNotes(merged);
    } else {
      setNotes(loadNotesFromStorage());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // localStorage sync (fallback mode)
  useEffect(() => {
    if (isSupabaseAvailable) return;
    const handleStorage = () => setNotes(loadNotesFromStorage());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => setNotes(loadNotesFromStorage()), 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Supabase realtime subscription
  useEffect(() => {
    if (!isSupabaseAvailable || !supabase) return;
    const channel = supabase
      .channel('notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addNote = useCallback(async (note: Omit<StoredNote, 'id'> & { id?: string }) => {
    const localId = note.id ?? Date.now().toString();
    const full: StoredNote = {
      id: localId,
      title: note.title,
      content: note.content,
      type: note.type,
      visibility: note.visibility,
      date: note.date,
      timestamp: note.timestamp ?? note.date,
      tags: note.tags,
      source: note.source,
      ...(note.ai_reflection && { ai_reflection: note.ai_reflection }),
      ...(note.shared_to_plc_id && { shared_to_plc_id: note.shared_to_plc_id })
    };

    if (isSupabaseAvailable) {
      const newId = await insertNoteToSupabase(full);
      if (newId) {
        // กรณี insert แบบ fallback (ไม่มีคอลัมน์ shared_to_plc_id) โน้ตใน DB จะไม่มี shared_to_plc_id
        // อัปเดตให้ชัดเจนเพื่อให้แสดงใน PLC ได้
        if (full.shared_to_plc_id || full.visibility === 'PLC') {
          await updateNoteInSupabase(String(newId), {
            visibility: full.visibility,
            ...(full.shared_to_plc_id && { shared_to_plc_id: full.shared_to_plc_id })
          });
        }
        await refresh();
        return newId;
      }
      // Supabase insert ล้มเหลว → บันทึกลง localStorage เพื่อไม่ให้ข้อมูลหาย
      console.warn('[useNotes] Supabase insert ไม่สำเร็จ บันทึกลง localStorage แทน');
    }
    // ใช้ Supabase หรือ fallback ไป localStorage
    setNotes((prev) => {
      const next = [full, ...prev];
      saveNotesToStorage(next);
      return next;
    });
    return localId;
  }, [refresh]);

  const updateNote = useCallback(async (id: string, patch: Partial<StoredNote>): Promise<boolean> => {
    // อัปเดต local state ก่อนเสมอ (optimistic update)
    const updateLocal = () => {
      setNotes((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, ...patch } : n));
        saveNotesToStorage(next);
        return next;
      });
    };

    if (isSupabaseAvailable) {
      const success = await updateNoteInSupabase(id, patch);
      if (success) {
        await refresh();
        return true;
      }
      // Supabase update ล้มเหลว (เช่น ไม่มีคอลัมน์) - อัปเดต local แทน
      console.warn('Supabase update failed, updating local state only');
      updateLocal();
      return true; // ให้ถือว่าสำเร็จสำหรับ UX
    }

    updateLocal();
    return true;
  }, [refresh]);

  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    const removeFromLocal = () => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        saveNotesToStorage(next);
        return next;
      });
    };

    try {
      if (isSupabaseAvailable) {
        // ใช้ soft delete แทน hard delete
        const success = await softDeleteNoteInSupabase(id);
        if (success) {
          await refresh();
          return true;
        }
        // Supabase soft delete ไม่สำเร็จ (เช่น RLS บัง หรือไม่มี deleted_at column)
        // ลบออกจากรายการในแอปเพื่อให้ UX ใช้งานได้
        removeFromLocal();
        return true;
      }

      removeFromLocal();
      return true;
    } catch (e) {
      console.error('deleteNote error:', e);
      // ลบจาก local เสมอเพื่อให้แอปไม่ค้าง และให้ UI แสดงว่าลบแล้ว
      removeFromLocal();
      return true;
    }
  }, [refresh]);

  const search = useCallback((query: string): StoredNote[] => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title?.toLowerCase().includes(q));
  }, [notes]);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    search,
    refresh,
    isSupabaseAvailable
  };
}
