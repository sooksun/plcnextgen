import { X, FileText, Check, Share2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useNotes } from '@/hooks/useNotes';
import { useAuthContext } from '@/contexts/AuthContext';
import { PLC_GROUPS, getPlcNameById } from '@/data/plcGroups';

interface ShareNoteToPLCModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** PLC ID ที่จะแชร์เข้าไป (ถ้าไม่ส่งมาจะให้เลือก) */
  targetPlcId?: string;
  onSuccess?: () => void;
}

export function ShareNoteToPLCModal({
  isOpen,
  onClose,
  targetPlcId,
  onSuccess
}: ShareNoteToPLCModalProps) {
  const { notes, updateNote, refresh } = useNotes();
  const { user } = useAuthContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedPlcId, setSelectedPlcId] = useState<string>(targetPlcId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // บันทึกของผู้ใช้ที่ยังไม่ได้แชร์ไป PLC ใดๆ หรือยังไม่แชร์ไป PLC เป้าหมาย
  const myAvailableNotes = useMemo(() => {
    return notes.filter((n) => {
      // ต้องเป็นบันทึกของผู้ใช้เอง
      if (n.user_id && user?.id && n.user_id !== user.id) {
        return false;
      }
      // ไม่รวมบันทึกที่แชร์ไป PLC เป้าหมายแล้ว
      const plcTarget = selectedPlcId || targetPlcId;
      if (plcTarget) {
        const sharedId = n.shared_to_plc_id != null ? String(n.shared_to_plc_id) : '';
        const vis = n.visibility ? String(n.visibility).toUpperCase() : '';
        if (vis === 'PLC' && sharedId === plcTarget) {
          return false;
        }
      }
      return true;
    });
  }, [notes, user?.id, selectedPlcId, targetPlcId]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedNoteId) {
      toast.info('กรุณาเลือกบันทึกที่ต้องการแชร์');
      return;
    }

    const plcToShare = selectedPlcId || targetPlcId;
    if (!plcToShare) {
      toast.info('กรุณาเลือก PLC ที่ต้องการแชร์');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateNote(selectedNoteId, {
        visibility: 'PLC',
        shared_to_plc_id: plcToShare
      });
      
      const plcName = getPlcNameById(plcToShare) || plcToShare;
      toast.success(`แชร์บันทึกไปยัง ${plcName} เรียบร้อยแล้ว`);
      refresh();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error sharing note:', error);
      toast.error('เกิดข้อผิดพลาดในการแชร์บันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedNote = myAvailableNotes.find((n) => n.id === selectedNoteId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg text-gray-900">แชร์บันทึกเข้า PLC</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* PLC Selector (ถ้าไม่ได้ระบุ targetPlcId) */}
          {!targetPlcId && (
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                เลือกกลุ่ม PLC ที่ต้องการแชร์
              </label>
              <select
                value={selectedPlcId}
                onChange={(e) => {
                  setSelectedPlcId(e.target.value);
                  setSelectedNoteId(null); // Reset note selection
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือก PLC...</option>
                {PLC_GROUPS.map((plc) => (
                  <option key={plc.id} value={plc.id}>
                    {plc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Target PLC Info (ถ้าระบุมา) */}
          {targetPlcId && (
            <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                📍 แชร์ไปยัง: <strong>{getPlcNameById(targetPlcId)}</strong>
              </p>
            </div>
          )}

          {/* Note Selection */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              เลือกบันทึกที่ต้องการแชร์
            </label>

            {myAvailableNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">ไม่มีบันทึกที่สามารถแชร์ได้</p>
                <p className="text-xs mt-1">
                  บันทึกทั้งหมดอาจแชร์ไป PLC นี้แล้ว หรือคุณยังไม่มีบันทึก
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {myAvailableNotes.map((note) => (
                  <label
                    key={note.id}
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedNoteId === note.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {selectedNoteId === note.id ? (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="radio"
                        name="selectedNote"
                        value={note.id}
                        checked={selectedNoteId === note.id}
                        onChange={() => setSelectedNoteId(note.id)}
                        className="sr-only"
                      />
                      <div className="text-gray-900 text-sm line-clamp-2">
                        {note.title || 'ไม่มีชื่อ'}
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {note.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {note.created_at
                          ? new Date(note.created_at).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : ''}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Note Preview */}
          {selectedNote && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ เลือกแล้ว: <strong>{selectedNote.title || 'ไม่มีชื่อ'}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedNoteId || (!targetPlcId && !selectedPlcId)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังแชร์...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>แชร์บันทึก</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
