import { useState, useCallback, useEffect } from 'react';
import type { PLCChatMessage } from '@/types';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

const STORAGE_PREFIX = 'plc_chat_';

function loadMessagesFromStorage(plcId: string): PLCChatMessage[] {
  if (typeof window === 'undefined' || !plcId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + plcId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessagesToStorage(plcId: string, messages: PLCChatMessage[]) {
  if (typeof window === 'undefined' || !plcId) return;
  localStorage.setItem(STORAGE_PREFIX + plcId, JSON.stringify(messages));
}

function mapRowToMessage(row: {
  id: string;
  plc_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}): PLCChatMessage {
  return {
    id: row.id,
    plcId: row.plc_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at
  };
}

async function loadMessagesFromSupabase(plcId: string): Promise<PLCChatMessage[]> {
  if (!supabase || !plcId) return [];
  try {
    const { data, error } = await supabase
      .from('plc_chat_messages')
      .select('id, plc_id, sender_id, sender_name, body, created_at')
      .eq('plc_id', plcId)
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('[usePLCChat] Supabase load error:', error.message);
      return [];
    }
    return (data || []).map(mapRowToMessage);
  } catch (e) {
    console.warn('[usePLCChat] Supabase load error:', e);
    return [];
  }
}

async function insertMessageToSupabase(
  plcId: string,
  senderId: string,
  senderName: string,
  body: string
): Promise<PLCChatMessage | null> {
  if (!supabase || !plcId) return null;
  try {
    const { data, error } = await supabase
      .from('plc_chat_messages')
      .insert({
        plc_id: plcId,
        sender_id: senderId,
        sender_name: senderName,
        body
      })
      .select('id, plc_id, sender_id, sender_name, body, created_at')
      .single();
    if (error) {
      console.warn('[usePLCChat] Supabase insert error:', error.message);
      return null;
    }
    return data ? mapRowToMessage(data) : null;
  } catch (e) {
    console.warn('[usePLCChat] Supabase insert error:', e);
    return null;
  }
}

export function usePLCChat(plcId: string | undefined, senderId: string, senderName: string) {
  const [messages, setMessages] = useState<PLCChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!plcId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (isSupabaseAvailable) {
      const list = await loadMessagesFromSupabase(plcId);
      setMessages(list);
    } else {
      setMessages(loadMessagesFromStorage(plcId));
    }
    setLoading(false);
  }, [plcId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime: ฟังข้อความใหม่ของห้องนี้
  useEffect(() => {
    if (!isSupabaseAvailable || !supabase || !plcId) return;
    const channel = supabase
      .channel(`plc_chat:${plcId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'plc_chat_messages',
          filter: `plc_id=eq.${plcId}`
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            plc_id: string;
            sender_id: string;
            sender_name: string;
            body: string;
            created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, mapRowToMessage(row)];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [plcId]);

  const sendMessage = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !plcId) return;

      if (isSupabaseAvailable) {
        const inserted = await insertMessageToSupabase(
          plcId,
          senderId,
          senderName,
          trimmed
        );
        if (inserted) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === inserted.id)) return prev;
            return [...prev, inserted];
          });
        } else {
          // fallback ลง localStorage เมื่อ insert ไม่สำเร็จ (เช่นตารางยังไม่มี)
          const newMsg: PLCChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            plcId,
            senderId,
            senderName,
            body: trimmed,
            createdAt: new Date().toISOString()
          };
          setMessages((prev) => {
            const next = [...prev, newMsg];
            saveMessagesToStorage(plcId, next);
            return next;
          });
        }
      } else {
        const newMsg: PLCChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          plcId,
          senderId,
          senderName,
          body: trimmed,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => {
          const next = [...prev, newMsg];
          saveMessagesToStorage(plcId, next);
          return next;
        });
      }
    },
    [plcId, senderId, senderName]
  );

  return { messages, sendMessage, loading };
}
