import { Mic, FileEdit, Lightbulb } from 'lucide-react';
import type { RecentItem } from '@/types';
import { useNotes } from '@/hooks/useNotes';

const typeColors = {
  'ประชุม': 'bg-blue-100 text-blue-700',
  'PLC': 'bg-purple-100 text-purple-700',
  'ไอเดีย': 'bg-yellow-100 text-yellow-700',
  'การสอน': 'bg-green-100 text-green-700'
};

const visibilityColors = {
  'ส่วนตัว': 'bg-gray-100 text-gray-700',
  'PLC': 'bg-indigo-100 text-indigo-700',
  'ข้อเสนอ': 'bg-orange-100 text-orange-700'
};

function getRelativeTime(timestamp: string): string {
  if (!timestamp) return '–';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาที ที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
  if (diffDays === 1) return '1 วัน ที่แล้ว';
  return `${diffDays} วัน ที่แล้ว`;
}

interface HomeScreenProps {
  onRecordVoice?: () => void;
  onTypeNote?: () => void;
  onQuickIdea?: () => void;
  onViewRecord?: (id: string) => void;
}

export function HomeScreen({ onRecordVoice, onTypeNote, onQuickIdea, onViewRecord }: HomeScreenProps) {
  const { notes } = useNotes();

  // แปลง notes (จาก Supabase + localStorage) เป็น RecentItem แสดง 5 รายการล่าสุด
  const recentItems: RecentItem[] = notes.slice(0, 5).map((note) => ({
    id: note.id,
    title: note.title || 'บันทึกเสียง',
    type: note.type || 'ประชุม',
    visibility: note.visibility || 'ส่วนตัว',
    time: getRelativeTime(note.timestamp || note.date || '')
  }));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* App Bar */}
      <div className="bg-blue-600 text-white px-4 pt-4 pb-4 shrink-0">
        <h1 className="text-lg font-semibold">บันทึกความรู้โรงเรียน</h1>
        <p className="text-sm text-blue-100 mt-1">
          โรงเรียน: วัดหนองแขม • ปีการศึกษา 2569
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Quick Actions */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Primary Action */}
            <button
              onClick={onRecordVoice}
              className="bg-blue-600 text-white rounded-xl p-4 shadow-md hover:bg-blue-700 transition-colors flex flex-col items-center justify-center min-h-[100px]"
            >
              <Mic className="w-8 h-8 mb-2" />
              <span className="text-sm">บันทึกเสียง</span>
            </button>

            {/* Secondary Actions */}
            <button
              onClick={onTypeNote}
              className="bg-white text-gray-700 rounded-xl p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center min-h-[100px]"
            >
              <FileEdit className="w-8 h-8 mb-2" />
              <span className="text-sm">พิมพ์บันทึก</span>
            </button>

            <button
              onClick={onQuickIdea}
              className="bg-white text-gray-700 rounded-xl p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center min-h-[100px]"
            >
              <Lightbulb className="w-8 h-8 mb-2" />
              <span className="text-sm">ไอเดียสั้น</span>
            </button>
          </div>
        </div>

        {/* Recent Items */}
        <div className="px-4 pb-4">
          <h2 className="text-gray-900 mb-3">ล่าสุดของฉัน</h2>
          {recentItems.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
              <p className="mb-1">ยังไม่มีบันทึก</p>
              <p className="text-sm">เริ่มบันทึกความรู้ของคุณได้เลย</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewRecord?.(item.id)}
                  className="w-full text-left bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-shadow"
                >
                  <h3 className="text-gray-900 text-sm mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-1 rounded ${visibilityColors[item.visibility]}`}>
                        {item.visibility}
                      </span>
                    </div>
                    <span className="text-gray-500">{item.time}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}