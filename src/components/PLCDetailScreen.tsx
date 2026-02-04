import { ArrowLeft, MessageCircle, Send, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useConfirm } from '@/contexts/ConfirmContext';
import type { TabType, SharedRecord } from '@/types';

interface PLCDetailScreenProps {
  plcName: string;
  onBack?: () => void;
}

const mockRecords: SharedRecord[] = [
  {
    id: '1',
    title: 'แนวทางการจัดการเรียนรู้แบบ Active Learning',
    owner: 'ครูสมชาย',
    tags: ['การสอน', 'Active Learning'],
    commentCount: 8,
    isOwner: true
  },
  {
    id: '2',
    title: 'การใช้เทคโนโลยีในการสอนคณิตศาสตร์',
    owner: 'ครูสมหญิง',
    tags: ['การสอน', 'เทคโนโลยี'],
    commentCount: 5,
    isOwner: false
  },
  {
    id: '3',
    title: 'แนวทางแก้ปัญหานักเรียนอ่านไม่ออกเขียนไม่ได้',
    owner: 'ครูวิชัย',
    tags: ['PLC', 'การอ่าน'],
    commentCount: 12,
    isOwner: false
  },
  {
    id: '4',
    title: 'สรุปการประชุม PLC เดือน ธ.ค. 69',
    tags: ['ประชุม', 'สรุป'],
    commentCount: 3,
    isOwner: false
  }
];

export function PLCDetailScreen({ plcName, onBack }: PLCDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('shared');
  const isPLCLead = true; // Mock: current user is PLC lead
  const { confirm: confirmDialog } = useConfirm();

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
            {mockRecords.map((record) => (
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
          <div className="p-4">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-2">ห้องสนทนา PLC</h3>
              <p className="text-sm text-gray-600">
                พูดคุยและแลกเปลี่ยนความคิดเห็นกับสมาชิก PLC
              </p>
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
                      <p className="text-2xl text-blue-600">{mockRecords.length}</p>
                      <p className="text-xs text-gray-600">บันทึกที่แชร์</p>
                    </div>
                    <div>
                      <p className="text-2xl text-green-600">
                        {mockRecords.reduce((sum, r) => sum + r.commentCount, 0)}
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

      {/* Floating Action Button */}
      {activeTab === 'shared' && (
        <button className="absolute bottom-6 right-4 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all z-20">
          <Plus className="w-5 h-5" />
          <span className="text-sm">แชร์บันทึกของฉันเข้า PLC</span>
        </button>
      )}
    </div>
  );
}
