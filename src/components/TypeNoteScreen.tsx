import { ArrowLeft, Tag, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

type NoteType = 'ประชุม' | 'PLC' | 'ไอเดีย' | 'การสอน';

interface TypeNoteScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
  presetType?: NoteType;
}

export function TypeNoteScreen({ onBack, onComplete, presetType }: TypeNoteScreenProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<NoteType>(presetType || 'ประชุม');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const types = [
    { value: 'ประชุม' as const, label: 'ประชุม', color: 'bg-blue-100 text-blue-700' },
    { value: 'PLC' as const, label: 'PLC', color: 'bg-purple-100 text-purple-700' },
    { value: 'ไอเดีย' as const, label: 'ไอเดีย', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'การสอน' as const, label: 'การสอน', color: 'bg-green-100 text-green-700' }
  ];

  const suggestedTags = [
    'Active Learning',
    'การจัดการชั้นเรียน',
    'การประเมินผล',
    'เทคโนโลยี',
    'ทักษะชีวิต',
    'STEM',
    'ภาษา',
    'คณิตศาสตร์'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.info('กรุณากรอกหัวข้อและเนื้อหา');
      return;
    }
    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();
    // ส่งเนื้อหาและหัวข้อไปหน้า Review เพื่อแสดงและส่งให้ AI วิเคราะห์ (บันทึกจริงจะทำที่ RecordReviewScreen)
    localStorage.setItem('temp_transcript', trimmedContent);
    localStorage.setItem('temp_type_note_title', trimmedTitle);
    localStorage.setItem('temp_type_note_meta', JSON.stringify({ type: selectedType, tags: selectedTags }));
    if (onComplete) onComplete();
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
          <h1 className="text-lg">พิมพ์บันทึก</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">หัวข้อ</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปการประชุม PLC ครั้งที่ 3/2569"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">ประเภท</label>
            <div className="grid grid-cols-4 gap-2">
              {types.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedType === type.value
                      ? `${type.color} ring-2 ring-offset-1 ring-blue-400`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">เนื้อหา</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนบันทึกของคุณที่นี่...&#10;&#10;คุณสามารถเขียน:&#10;• สิ่งที่เกิดขึ้น&#10;• สิ่งที่เรียนรู้&#10;• คำถามที่ยังสงสัย&#10;• สิ่งที่จะลองทำต่อไป"
              rows={12}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {content.length} ตัวอักษร
              </span>
              <span className="text-xs text-gray-500">
                ประมาณ {Math.ceil(content.split(/\s+/).filter(w => w).length / 100)} นาทีในการอ่าน
              </span>
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              แท็ก (เลือกได้หลายตัว)
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Tips Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <h3 className="text-sm text-blue-900 mb-1">เคล็ดลับ</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• เขียนด้วยภาษาที่เป็นธรรมชาติ ไม่ต้องเป็นทางการมาก</li>
                  <li>• เน้นสิ่งที่เรียนรู้และสิ่งที่จะนำไปใช้</li>
                  <li>• บันทึกทันทีหลังเหตุการณ์จะได้ข้อมูลละเอียดที่สุด</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Enhancement Preview (Optional) */}
          {content.length > 50 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span>
                <h3 className="text-sm text-purple-900">AI จะช่วย</h3>
              </div>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• สรุปประเด็นสำคัญ</li>
                <li>• เสนอคำถามชวนคิด</li>
                <li>• แนะนำแนวทางการพัฒนาต่อ</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="flex gap-3 w-full">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            บันทึกและดูตัวอย่าง
          </button>
        </div>
      </div>
    </div>
  );
}