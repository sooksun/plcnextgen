import { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Check, X, Trash2, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNotes } from '@/hooks/useNotes';
import { useConfirm } from '@/contexts/ConfirmContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from './ui/utils';

function formatDate(timestamp: string) {
  if (!timestamp) return '–';
  const date = new Date(timestamp);
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${(date.getFullYear() + 543).toString().slice(-2)}`;
}

const RECORD_TYPES = ['ประชุม', 'PLC', 'ไอเดีย', 'การสอน'] as const;
const VISIBILITY_OPTIONS = ['ส่วนตัว', 'PLC', 'ข้อเสนอ'] as const;

const typeColors: Record<string, string> = {
  'ประชุม': 'bg-blue-100 text-blue-700',
  'PLC': 'bg-purple-100 text-purple-700',
  'ไอเดีย': 'bg-yellow-100 text-yellow-700',
  'การสอน': 'bg-green-100 text-green-700'
};

const visibilityColors: Record<string, string> = {
  'ส่วนตัว': 'bg-gray-100 text-gray-700',
  'PLC': 'bg-indigo-100 text-indigo-700',
  'ข้อเสนอ': 'bg-orange-100 text-orange-700'
};

interface RecordDetailScreenProps {
  noteId: string;
  onBack?: () => void;
}

export function RecordDetailScreen({ noteId, onBack }: RecordDetailScreenProps) {
  const { notes, updateNote, deleteNote } = useNotes();
  const { confirm: confirmDialog } = useConfirm();
  const note = notes.find((n) => n.id === noteId);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [isEditingType, setIsEditingType] = useState(false);
  const [editType, setEditType] = useState('ประชุม');
  const [editVisibility, setEditVisibility] = useState('ส่วนตัว');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSavingType, setIsSavingType] = useState(false);

  useEffect(() => {
    if (note) {
      setEditType(note.type || 'ประชุม');
      setEditVisibility(note.visibility || 'ส่วนตัว');
    }
  }, [note?.id, note?.type, note?.visibility]);

  if (!note) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-blue-700 rounded transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg">ดูบันทึก</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500">ไม่พบบันทึกนี้</p>
        </div>
      </div>
    );
  }

  const displayTitle = note.title || 'บันทึกเสียง';
  const displayType = note.type || 'ประชุม';
  const displayVisibility = note.visibility || 'ส่วนตัว';

  const handleStartEditTitle = () => {
    setEditTitleValue(displayTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    const trimmed = editTitleValue.trim();
    if (!trimmed) {
      toast.info('กรุณากรอกชื่อเรื่อง');
      return;
    }
    setIsSavingTitle(true);
    try {
      const ok = await updateNote(note.id, { title: trimmed });
      setIsEditingTitle(false);
      if (ok) toast.success('บันทึกชื่อเรื่องแล้ว');
      else toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCancelEditTitle = () => {
    setEditTitleValue(displayTitle);
    setIsEditingTitle(false);
  };

  const handleStartEditType = () => {
    setEditType(displayType);
    setEditVisibility(displayVisibility);
    setIsEditingType(true);
  };

  const handleSaveType = async () => {
    setIsSavingType(true);
    try {
      const ok = await updateNote(note.id, { type: editType, visibility: editVisibility });
      setIsEditingType(false);
      if (ok) toast.success('บันทึกประเภทและสิทธิการมองเห็นแล้ว');
      else toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setIsSavingType(false);
    }
  };

  const handleCancelEditType = () => {
    setEditType(displayType);
    setEditVisibility(displayVisibility);
    setIsEditingType(false);
  };

  const handleDelete = () => {
    confirmDialog({
      title: 'ลบบันทึก',
      message: 'ต้องการลบบันทึกนี้ใช่หรือไม่?',
      confirmLabel: 'ลบ',
      cancelLabel: 'ยกเลิก',
      onConfirm: async () => {
        try {
          const ok = await deleteNote(note.id);
          if (ok) {
            toast.success('ลบบันทึกแล้ว');
            onBack?.();
          } else {
            toast.error('ลบไม่สำเร็จ');
          }
        } catch (e) {
          console.error('handleDelete error:', e);
          toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-blue-600 text-white px-4 py-3 safe-area-top">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-blue-700 rounded-lg transition-colors shrink-0"
            aria-label="กลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <Input
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                className="flex-1 bg-white/20 border-white/50 text-white placeholder:text-blue-200"
                autoFocus
                disabled={isSavingTitle}
                onKeyDown={(e) => e.key === 'Enter' && !isSavingTitle && handleSaveTitle()}
              />
              <button 
                onClick={handleSaveTitle} 
                disabled={isSavingTitle}
                className="p-1.5 hover:bg-blue-700 rounded-lg shrink-0 disabled:opacity-50" 
                aria-label="บันทึก"
              >
                {isSavingTitle ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={handleCancelEditTitle} 
                disabled={isSavingTitle}
                className="p-1.5 hover:bg-blue-700 rounded-lg shrink-0 disabled:opacity-50" 
                aria-label="ยกเลิก"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-lg truncate flex-1 min-w-0">{displayTitle}</h1>
              <button
                onClick={handleStartEditTitle}
                className="p-1.5 hover:bg-blue-700 rounded-lg shrink-0"
                aria-label="แก้ไขชื่อเรื่อง"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <p className="text-sm text-blue-100 mt-1">{formatDate(note.timestamp || note.date || '')}</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          {isEditingType ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ประเภทบันทึก</p>
                <div className="flex flex-wrap gap-2">
                  {RECORD_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditType(t)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                        editType === t ? typeColors[t] : 'bg-gray-50 text-gray-600 border-gray-200'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">สิทธิการมองเห็น</p>
                <div className="flex flex-wrap gap-2">
                  {VISIBILITY_OPTIONS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEditVisibility(v)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                        editVisibility === v ? visibilityColors[v] : 'bg-gray-50 text-gray-600 border-gray-200'
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveType} 
                  disabled={isSavingType}
                  className="gap-1.5"
                >
                  {isSavingType ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isSavingType ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelEditType}
                  disabled={isSavingType}
                  className="gap-1.5"
                >
                  <X className="w-4 h-4" />
                  ยกเลิก
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn('px-2 py-0.5', typeColors[displayType] || 'bg-gray-100 text-gray-700')}>
                {displayType}
              </Badge>
              <Badge variant="outline" className={cn('px-2 py-0.5', visibilityColors[displayVisibility] || 'bg-gray-100 text-gray-700')}>
                {displayVisibility}
              </Badge>
              <button
                onClick={handleStartEditType}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="แก้ไขประเภท"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-gray-900 font-medium mb-2">บันทึกคำพูด</h2>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {note.content || '–'}
          </div>
        </div>

        {note.ai_reflection && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <h2 className="text-gray-900 font-medium">คำเสนอแนะและคำชี้แนะจาก AI</h2>
            </div>
            {note.ai_reflection.keyPoints?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">💡 ประเด็นสำคัญ</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {note.ai_reflection.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            {note.ai_reflection.questions?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">🤔 คำถามชวนคิด</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {note.ai_reflection.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {note.ai_reflection.suggestions?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-2">🎯 ข้อเสนอเบื้องต้น</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {note.ai_reflection.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            ลบบันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
