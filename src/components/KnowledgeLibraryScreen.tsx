import { ArrowLeft, Search, Filter, Eye, Copy, Info } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useNotes } from '@/hooks/useNotes';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ArchivedItem } from '@/types';

interface KnowledgeLibraryScreenProps {
  onBack?: () => void;
  onViewItem?: (id: string) => void;
  onCopyAsNew?: (id: string, title: string) => void;
}


export function KnowledgeLibraryScreen({
  onBack,
  onViewItem,
  onCopyAsNew
}: KnowledgeLibraryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { confirm: confirmDialog } = useConfirm();
  const { notes } = useNotes();
  const { user } = useAuthContext();

  // แปลง notes ที่มี visibility = 'ข้อเสนอ' เป็น ArchivedItem
  const archivedItems: ArchivedItem[] = useMemo(() => {
    return notes
      .filter(n => n.visibility?.toUpperCase() === 'ข้อเสนอ' || n.visibility === 'ข้อเสนอ')
      .map(n => {
        const dateStr = n.date || n.timestamp || '';
        const year = dateStr ? new Date(dateStr).getFullYear() + 543 : 2568; // แปลงเป็น พ.ศ.
        return {
          id: n.id,
          title: n.title || 'ไม่มีชื่อ',
          summary: n.content?.slice(0, 150) || '',
          tags: n.tags || [],
          academicYear: String(year),
          archivedDate: dateStr,
          originalStatus: 'ข้อเสนอ',
          submittedBy: user?.full_name || 'ไม่ระบุ'
        };
      });
  }, [notes, user?.full_name]);

  // รวบรวมปีและ tags จากข้อมูลจริง
  const availableYears = useMemo(() => {
    const years = new Set(archivedItems.map(item => item.academicYear));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [archivedItems]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    archivedItems.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).slice(0, 10);
  }, [archivedItems]);

  const handleCopyAsNew = (id: string, title: string) => {
    confirmDialog({
      title: 'คัดลอกเป็นข้อเสนอใหม่',
      message: `คัดลอก "${title}" เป็นข้อเสนอใหม่สำหรับปีการศึกษาปัจจุบัน?`,
      confirmLabel: 'ตกลง',
      cancelLabel: 'ยกเลิก',
      onConfirm: () => {
        onCopyAsNew?.(id, title);
        toast.success('คัดลอกข้อเสนอเรียบร้อยแล้ว สามารถแก้ไขและส่งเข้าระบบได้');
      },
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = selectedYear === 'all' || item.academicYear === selectedYear;
    
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some(tag => item.tags.includes(tag));

    return matchesSearch && matchesYear && matchesTags;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* App Bar */}
      <div className="bg-blue-600 text-white px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg">คลังความรู้ย้อนหลัง</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาความรู้..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-start gap-2 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            <strong>จัดเก็บเพื่อประโยชน์ในการอ้างอิง ไม่ลบทิ้ง</strong> 
            <span className="text-blue-700"> — ความรู้ที่เคยใช้ในอดีตอาจมีประโยชน์ในอนาคต</span>
          </p>
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>ตัวกรอง</span>
          {(selectedYear !== 'all' || selectedTags.length > 0) && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
              {(selectedYear !== 'all' ? 1 : 0) + selectedTags.length}
            </span>
          )}
        </button>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
            {/* Year Filter */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">ปีการศึกษา</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedYear('all')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedYear === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedYear === year
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">หัวข้อ</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedYear !== 'all' || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedTags([]);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-gray-50">
        <p className="text-sm text-gray-600">
          พบ {filteredItems.length} รายการ
        </p>
      </div>

      {/* Archived Items List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-gray-900 flex-1 pr-4">{item.title}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ปี {item.academicYear}
                </span>
              </div>

              {/* Summary */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
                <span>โดย {item.submittedBy}</span>
                <span>สถานะสุดท้าย: {item.originalStatus}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onViewItem && onViewItem(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>เปิดดู</span>
                </button>
                <button
                  onClick={() => handleCopyAsNew(item.id, item.title)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกเป็นข้อเสนอปีใหม่</span>
                </button>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              {archivedItems.length === 0 ? (
                <>
                  <p className="text-gray-600">ยังไม่มีข้อเสนอในคลังความรู้</p>
                  <p className="text-sm text-gray-500 mt-1">
                    บันทึกที่แชร์เป็น "ข้อเสนอ" จะแสดงที่นี่
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600">ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
