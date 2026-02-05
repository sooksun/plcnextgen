import { ArrowLeft, MessageCircle, Send, Plus } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useNotes } from '@/hooks/useNotes';
import { usePLCChat } from '@/hooks/usePLCChat';
import { getPlcIdByName } from '@/data/plcGroups';
import { useAuthContext } from '@/contexts/AuthContext';
import type { TabType, SharedRecord } from '@/types';

interface PLCDetailScreenProps {
  plcName: string;
  onBack?: () => void;
  /** เปิดโฟลว์สร้าง/แชร์บันทึกใหม่เข้า PLC นี้ */
  onShareNewNote?: () => void;
}

export function PLCDetailScreen({ plcName, onBack, onShareNewNote }: PLCDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('shared');
  const { confirm: confirmDialog } = useConfirm();
  const { notes, refresh } = useNotes();
  const { user } = useAuthContext();
  const plcId = useMemo(() => getPlcIdByName(plcName), [plcName]);

  // ผู้นำ PLC = ADMIN, PRINCIPAL หรือ TEACHER (อนาคตอาจเช็คจากตาราง plc_members)
  const isPLCLead = useMemo(() => {
    const role = user?.role?.toUpperCase();
    return role === 'ADMIN' || role === 'PRINCIPAL' || role === 'TEACHER';
  }, [user?.role]);

  // ห้องสนทนา PLC (เก็บใน localStorage ตาม plcId)
  const { messages: chatMessages, sendMessage } = usePLCChat(
    plcId ?? undefined,
    user?.id ?? 'anonymous',
    user?.full_name || user?.email || 'ผู้ใช้'
  );
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refresh();
  }, [plcName, refresh]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ดึงเฉพาะบันทึกที่แชร์มาในกลุ่ม PLC นี้ (visibility = PLC และ shared_to_plc_id ตรงกับกลุ่ม)
  const sharedRecords: SharedRecord[] = useMemo(() => {
    if (!plcId) return [];

    const plcIdStr = String(plcId);
    const filtered = notes.filter((n) => {
      const vis = n.visibility ? String(n.visibility).toUpperCase() : '';
      const sharedId = n.shared_to_plc_id != null ? String(n.shared_to_plc_id) : '';
      return vis === 'PLC' && sharedId === plcIdStr;
    });

    return filtered.map((n) => ({
      id: n.id,
      title: n.title || 'ไม่มีชื่อ',
      owner: user?.full_name || user?.email || undefined,
      tags: n.tags || [],
      commentCount: 0,
      isOwner: true
    }));
  }, [notes, plcId, user?.full_name, user?.email]);

  const handleProposeToSchool = (recordId: string, recordTitle: string) => {
    confirmDialog({
      title: 'เสนอเป็นข้อเสนอของโรงเรียน',
      message: `เสนอ "${recordTitle}" เป็นข้อเสนอของโรงเรียน?`,
      confirmLabel: 'ตกลง',
      cancelLabel: 'ยกเลิก',
      onConfirm: () => {
        toast.success('ส่งข้อเสนอเรียบร้อยแล้ว');
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* App Bar */}
      <div className="bg-blue-600 text-white px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg">{plcName}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 px-4 py-3 text-sm transition-colors ${
              activeTab === 'shared'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            บันทึกที่แชร์
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`flex-1 px-4 py-3 text-sm transition-colors ${
              activeTab === 'discussion'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            สนทนา
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 px-4 py-3 text-sm transition-colors ${
              activeTab === 'insights'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            อินไซต์
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        {activeTab === 'shared' && (
          <div className="p-4 space-y-3">
            {sharedRecords.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 text-sm">
                ยังไม่มีบันทึกที่แชร์ในกลุ่มนี้
              </div>
            )}
            {sharedRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Title */}
                <h3 className="text-gray-900 mb-2">{record.title}</h3>

                {/* Owner */}
                {record.owner && (
                  <p className="text-sm text-gray-600 mb-2">โดย {record.owner}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {record.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{record.commentCount} ความคิดเห็น</span>
                  </div>

                  {/* Propose to School Button (only for owner or PLC lead) */}
                  {(record.isOwner || isPLCLead) && (
                    <button
                      onClick={() => handleProposeToSchool(record.id, record.title)}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>เสนอเป็นข้อเสนอของโรงเรียน</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="flex flex-col h-full">
            {/* รายการข้อความ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {chatMessages.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-gray-900 font-medium mb-1">ห้องสนทนา PLC</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    พูดคุยและแลกเปลี่ยนความคิดเห็นกับสมาชิก PLC
                  </p>
                  <p className="text-xs text-gray-500">พิมพ์ข้อความด้านล่างเพื่อเริ่มสนทนา</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      msg.senderId === (user?.id ?? 'anonymous')
                        ? 'ml-auto items-end'
                        : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-xs text-gray-500 mb-0.5 px-1">
                      {msg.senderName}
                    </span>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        msg.senderId === (user?.id ?? 'anonymous')
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-gray-200 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      {msg.body}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ช่องพิมพ์ข้อความ */}
            <div className="flex-none p-3 bg-white border-t border-gray-200 safe-area-bottom">
              <div className="flex gap-2 items-end">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (chatInput.trim()) {
                        sendMessage(chatInput);
                        setChatInput('');
                      }
                    }
                  }}
                  placeholder="พิมพ์ข้อความ..."
                  rows={1}
                  className="flex-1 min-h-[44px] max-h-24 px-4 py-3 rounded-xl border border-gray-300 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (chatInput.trim()) {
                      sendMessage(chatInput);
                      setChatInput('');
                    }
                  }}
                  disabled={!chatInput.trim()}
                  className="shrink-0 h-[44px] w-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="p-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📊</span>
                <h3 className="text-gray-900">อินไซต์ของ PLC</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm text-gray-900 mb-2">📈 สถิติการมีส่วนร่วม</h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-2xl text-blue-600">{sharedRecords.length}</p>
                      <p className="text-xs text-gray-600">บันทึกที่แชร์</p>
                    </div>
                    <div>
                      <p className="text-2xl text-green-600">
                        {sharedRecords.reduce((sum, r) => sum + r.commentCount, 0)}
                      </p>
                      <p className="text-xs text-gray-600">ความคิดเห็น</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm text-gray-900 mb-2">🔥 หัวข้อยอดนิยม</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex justify-between">
                      <span>การสอน</span>
                      <span className="text-blue-600">6 บันทึก</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Active Learning</span>
                      <span className="text-blue-600">4 บันทึก</span>
                    </li>
                    <li className="flex justify-between">
                      <span>เทคโนโลยี</span>
                      <span className="text-blue-600">3 บันทึก</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button — z-30 ให้อยู่เหนือเนื้อหา */}
      {activeTab === 'shared' && (
        <button
          type="button"
          onClick={() => onShareNewNote?.()}
          className="absolute bottom-6 right-4 z-30 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white pl-4 pr-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer touch-manipulation select-none"
          aria-label="แชร์บันทึกของฉันเข้า PLC"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">แชร์บันทึกของฉันเข้า PLC</span>
        </button>
      )}
    </div>
  );
}
