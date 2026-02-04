import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import type { ShareLevel } from '@/types';

interface ShareDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (level: ShareLevel, plcId?: string) => void;
}

const plcGroups = [
  { id: 'plc-math', name: 'PLC คณิตศาสตร์' },
  { id: 'plc-science', name: 'PLC วิทยาศาสตร์' },
  { id: 'plc-thai', name: 'PLC ภาษาไทย' },
  { id: 'plc-english', name: 'PLC ภาษาอังกฤษ' },
  { id: 'plc-social', name: 'PLC สังคมศึกษา' },
  { id: 'plc-arts', name: 'PLC ศิลปะ' }
];

export function ShareDecisionModal({ isOpen, onClose, onConfirm }: ShareDecisionModalProps) {
  const [shareLevel, setShareLevel] = useState<ShareLevel>('private');
  const [selectedPLC, setSelectedPLC] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (shareLevel === 'plc' && !selectedPLC) {
      toast.info('กรุณาเลือก PLC');
      return;
    }
    onConfirm(shareLevel, selectedPLC || undefined);
    onClose();
  };

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
          <h2 className="text-lg text-gray-900">เลือกระดับการแชร์</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {/* Option 1: Private */}
            <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                borderColor: shareLevel === 'private' ? '#2563eb' : '#e5e7eb',
                backgroundColor: shareLevel === 'private' ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="shareLevel"
                value="private"
                checked={shareLevel === 'private'}
                onChange={(e) => setShareLevel(e.target.value as ShareLevel)}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="text-gray-900">ของฉันคนเดียว (ส่วนตัว)</div>
                <p className="text-sm text-gray-600 mt-1">
                  เก็บไว้ใช้ส่วนตัว ไม่มีใครเห็นนอกจากคุณ
                </p>
              </div>
            </label>

            {/* Option 2: Share with PLC */}
            <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                borderColor: shareLevel === 'plc' ? '#2563eb' : '#e5e7eb',
                backgroundColor: shareLevel === 'plc' ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="shareLevel"
                value="plc"
                checked={shareLevel === 'plc'}
                onChange={(e) => setShareLevel(e.target.value as ShareLevel)}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="text-gray-900">แชร์กับ PLC</div>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  เพื่อนครูใน PLC เดียวกันเห็นและแสดงความคิดเห็นได้
                </p>
                
                {/* PLC Dropdown */}
                {shareLevel === 'plc' && (
                  <select
                    value={selectedPLC}
                    onChange={(e) => setSelectedPLC(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">เลือก PLC...</option>
                    {plcGroups.map((plc) => (
                      <option key={plc.id} value={plc.id}>
                        {plc.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>

            {/* Option 3: School Proposal */}
            <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                borderColor: shareLevel === 'proposal' ? '#2563eb' : '#e5e7eb',
                backgroundColor: shareLevel === 'proposal' ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="shareLevel"
                value="proposal"
                checked={shareLevel === 'proposal'}
                onChange={(e) => setShareLevel(e.target.value as ShareLevel)}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="text-gray-900">ส่งเป็นข้อเสนอของโรงเรียน</div>
                <p className="text-sm text-gray-600 mt-1">
                  เข้ากล่องขาเข้า ผอ./ครูอาวุโสพิจารณา
                </p>
                <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  💡 ผู้บริหารจะเห็นข้อเสนอและสามารถให้ feedback ได้
                </div>
              </div>
            </label>
          </div>

          {/* Warning Text */}
          <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              ⚠️ ข้อเสนอของโรงเรียนเป็น 'ข้อเสนอ' ไม่ใช่นโยบาย
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
