import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useConfirm } from '@/contexts/ConfirmContext';
import type { ProposalStatus, AuditLog } from '@/types';

interface KnowledgeDetailScreenProps {
  onBack?: () => void;
}

const statusConfig: Record<ProposalStatus, { label: string; color: string; bgColor: string }> = {
  PROPOSED: { label: 'รอพิจารณา', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_TRIAL: { label: 'กำลังทดลองใช้', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  TESTED: { label: 'ทดลองแล้ว', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  RECOMMENDED: { label: 'แนะนำให้ใช้', color: 'text-green-700', bgColor: 'bg-green-100' },
  PAUSED: { label: 'พักไว้ก่อน', color: 'text-gray-700', bgColor: 'bg-gray-100' }
};

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2569-12-10 14:30',
    action: 'ส่งข้อเสนอ',
    actor: 'ครูสมชาย (PLC คณิตศาสตร์)'
  },
  {
    id: '2',
    timestamp: '2569-12-11 09:15',
    action: 'ผอ.รับทราบและเปิดพิจารณา',
    actor: 'ผอ.วิชัย',
    note: 'น่าสนใจ ขอดูรายละเอียดเพิ่มเติม'
  }
];

export function KnowledgeDetailScreen({ onBack }: KnowledgeDetailScreenProps) {
  const [currentStatus, setCurrentStatus] = useState<ProposalStatus>('PROPOSED');
  const [newStatus, setNewStatus] = useState<ProposalStatus>('PROPOSED');
  const [trialScope, setTrialScope] = useState('');
  const [trialEndDate, setTrialEndDate] = useState('');
  const [curatorNote, setCuratorNote] = useState('');
  const { confirm: confirmDialog } = useConfirm();
  
  // Editable knowledge framework fields (for curator)
  const [principle, setPrinciple] = useState('การจัดการเรียนรู้ที่เน้นผู้เรียนเป็นศูนย์กลาง');
  const [practice, setPractice] = useState('ใช้กิจกรรมกลุ่มย่อยและการนำเสนอหน้าชั้นเรียน');
  const [contextNotes, setContextNotes] = useState('');

  const handleConfirmDecision = () => {
    if (newStatus === 'IN_TRIAL' && (!trialScope || !trialEndDate)) {
      toast.info('กรุณาระบุขอบเขตและวันสิ้นสุดการทดลอง');
      return;
    }

    confirmDialog({
      title: 'ยืนยันการเปลี่ยนสถานะ',
      message: `ยืนยันการเปลี่ยนสถานะเป็น "${statusConfig[newStatus].label}"?`,
      confirmLabel: 'ตกลง',
      cancelLabel: 'ยกเลิก',
      onConfirm: () => {
        setCurrentStatus(newStatus);
        toast.success('บันทึกการตัดสินใจเรียบร้อยแล้ว');
        setTrialScope('');
        setTrialEndDate('');
        setCuratorNote('');
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* App Bar */}
      <div className="bg-blue-600 text-white px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg">รายละเอียดข้อเสนอ</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-80">
        <div className="p-4 space-y-4">
          {/* Header Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-gray-900 flex-1 pr-4">
                แนวทางการจัดการเรียนรู้แบบ Active Learning
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${statusConfig[currentStatus].bgColor} ${statusConfig[currentStatus].color}`}>
                {statusConfig[currentStatus].label}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ปีการศึกษา:</span>
                <span className="text-gray-900">2569</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">แหล่งที่มา:</span>
                <button className="flex items-center gap-1 text-blue-600 hover:underline">
                  <span>บันทึกต้นฉบับ</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ส่งโดย:</span>
                <span className="text-gray-900">ครูสมชาย (PLC คณิตศาสตร์)</span>
              </div>
            </div>
          </div>

          {/* AI Snapshot Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🤖</span>
              <h3 className="text-gray-900">AI Snapshot</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <h4 className="text-gray-700 mb-1">📌 ประเด็นสำคัญ</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>เพิ่มการมีส่วนร่วมของนักเรียนในชั้นเรียน</li>
                  <li>พัฒนาทักษะการคิดวิเคราะห์และการแก้ปัญหา</li>
                  <li>นักเรียนสามารถนำความรู้ไปประยุกต์ใช้ได้จริง</li>
                </ul>
              </div>

              <div>
                <h4 className="text-gray-700 mb-1">💡 ข้อเสนอหลัก</h4>
                <p className="text-gray-600">
                  จัดการเรียนรู้แบบ Active Learning โดยใช้กิจกรรมกลุ่มย่อย การอ้างอิงจากสถานการณ์จริง 
                  และการนำเสนอหน้าชั้นเรียน เพื่อให้นักเรียนมีส่วนร่วมมากขึ้น
                </p>
              </div>

              <div>
                <h4 className="text-gray-700 mb-1">📚 บริบท</h4>
                <p className="text-gray-600">
                  ทดลองใช้ในห้อง ม.2/1 วิชาคณิตศาสตร์ เนื้อหาเรื่องสมการเชิงเส้น 
                  นักเรียนให้ความสนใจและมีผลการเรียนดีขึ้นเมื่อเทียบกับการสอนแบบบรรยาย
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-3 pt-3 border-t border-purple-200">
              <div className="flex items-start gap-2 text-xs text-purple-700">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <p>
                  AI Snapshot สร้างจากบันทึกต้นฉบับ ใช้เป็นข้อมูลประกอบการพิจารณาเท่านั้น 
                  ไม่ใช่คำแนะนำหรือคำสั่ง
                </p>
              </div>
            </div>
          </div>

          {/* Knowledge Framework Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-gray-900 mb-3">📖 กรอบองค์ความรู้</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  หลักการ (Principle)
                </label>
                <textarea
                  value={principle}
                  onChange={(e) => setPrinciple(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  rows={2}
                  placeholder="หลักการหรือทฤษฎีที่อ้างอิง"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  แนวปฏิบัติ (Practice)
                </label>
                <textarea
                  value={practice}
                  onChange={(e) => setPractice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  rows={3}
                  placeholder="ขั้นตอนหรือวิธีการปฏิบัติ"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  บันทึกเพิ่มเติมจากผู้พิจารณา (Context Notes)
                </label>
                <textarea
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-amber-50"
                  rows={3}
                  placeholder="เพิ่มบริบท ข้อควรระวัง หรือข้อเสนอแนะเพิ่มเติม (เฉพาะผู้พิจารณาเท่านั้น)"
                />
                <p className="text-xs text-amber-700 mt-1">
                  💡 ช่องนี้เฉพาะผู้พิจารณาเท่านั้นที่แก้ไขได้
                </p>
              </div>
            </div>
          </div>

          {/* Audit Timeline Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-gray-900 mb-3">📋 ประวัติการพิจารณา</h3>
            
            <div className="space-y-3">
              {mockAuditLogs.map((log, index) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    {index < mockAuditLogs.length - 1 && (
                      <div className="w-0.5 h-full bg-blue-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {log.actor} • {log.timestamp}
                    </p>
                    {log.note && (
                      <p className="text-xs text-gray-600 mt-1 italic bg-gray-50 px-2 py-1 rounded">
                        "{log.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Panel (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg safe-area-bottom">
        <div className="max-w-md mx-auto p-4 space-y-3">
          <h3 className="text-gray-900">การพิจารณาข้อเสนอ</h3>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              เปลี่ยนสถานะเป็น
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ProposalStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PROPOSED">รอพิจารณา</option>
              <option value="IN_TRIAL">กำลังทดลองใช้</option>
              <option value="TESTED">ทดลองแล้ว</option>
              <option value="RECOMMENDED">แนะนำให้ใช้</option>
              <option value="PAUSED">พักไว้ก่อน</option>
            </select>
          </div>

          {/* Conditional: Trial Inputs */}
          {newStatus === 'IN_TRIAL' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-3">
              <h4 className="text-sm text-gray-900">รายละเอียดการทดลอง</h4>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  ขอบเขตการทดลอง
                </label>
                <input
                  type="text"
                  value={trialScope}
                  onChange={(e) => setTrialScope(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="เช่น ชั้น ม.2 ทุกห้อง, กลุ่มสาระคณิตศาสตร์"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  วันสิ้นสุดการทดลอง
                </label>
                <input
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          )}

          {/* Curator Note */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              หมายเหตุการพิจารณา
            </label>
            <textarea
              value={curatorNote}
              onChange={(e) => setCuratorNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="ข้อคิดเห็นหรือข้อเสนอแนะเพิ่มเติม"
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmDecision}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ยืนยันการตัดสินใจ
          </button>

          {/* Emphasis Note */}
          <p className="text-xs text-gray-600 text-center">
            💡 นี่คือ "ข้อเสนอ" เพื่อแลกเปลี่ยนเรียนรู้ ไม่ใช่คำสั่งหรือนโยบายบังคับ
          </p>
        </div>
      </div>
    </div>
  );
}
