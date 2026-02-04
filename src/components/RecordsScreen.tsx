import { Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { RecordItem } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RecordCard } from './RecordCard';

export interface RecordsScreenProps {
  onViewRecord?: (id: string) => void;
}

function formatDate(timestamp: string) {
  if (!timestamp) return '–';
  const date = new Date(timestamp);
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${(date.getFullYear() + 543).toString().slice(-2)}`;
}

export function RecordsScreen({ onViewRecord }: RecordsScreenProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { notes, loading } = useNotes();

  const records: RecordItem[] = useMemo(
    () =>
      notes.map((note) => ({
        id: note.id,
        title: note.title,
        type: (note.type || 'ประชุม') as RecordItem['type'],
        visibility: (note.visibility || 'ส่วนตัว') as RecordItem['visibility'],
        date: formatDate(note.timestamp || note.date || ''),
        tags: note.tags || [],
        source: (note.source || 'voice') as 'typed' | 'voice'
      })),
    [notes]
  );

  const filteredRecords = records.filter((record) =>
    record.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-600 text-white px-4 pt-4 pb-4 shrink-0">
        <h1 className="text-lg font-semibold mb-4">บันทึกทั้งหมด</h1>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200 pointer-events-none" />
            <Input
              type="text"
              placeholder="ค้นหาบันทึก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white/15 border border-white/30 rounded-lg text-white placeholder:text-blue-200 focus-visible:ring-2 focus-visible:ring-white/50 focus:border-white/50"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-white/20 rounded-lg gap-1.5">
              <Filter className="w-4 h-4" />
              <span>กรอง</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="text-sm">กำลังโหลดรายการ...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="mb-2">ยังไม่มีบันทึก</p>
            <p className="text-sm">เริ่มบันทึกความรู้ของคุณได้เลย</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onClick={() => onViewRecord?.(record.id)}
              />
            ))}
          </div>
        )}
        {filteredRecords.length === 0 && records.length > 0 && (
          <div className="text-center text-muted-foreground mt-8">ไม่พบบันทึกที่ค้นหา</div>
        )}
      </div>
    </div>
  );
}
