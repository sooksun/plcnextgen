import { ArrowLeft, Edit2, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ShareDecisionModal } from './ShareDecisionModal';
import { AudioPlayer } from './AudioPlayer';
import type { TranscriptLine } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { generateReflection, type AIReflection } from '@/lib/ai';

interface RecordReviewScreenProps {
  onBack?: () => void;
  onShareDecision?: (level: string, plcId?: string) => void;
}

export function RecordReviewScreen({ onBack, onShareDecision }: RecordReviewScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [realTranscript, setRealTranscript] = useState<string | null>(null);
  
  // New state for editing title
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // AI Reflection state
  const [aiReflection, setAiReflection] = useState<AIReflection | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Use Supabase-enabled hook
  const { addNote, isSupabaseAvailable } = useNotes();

  const duration = '3:45';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('temp_transcript');
      if (saved) setRealTranscript(saved);
      const typeNoteTitle = localStorage.getItem('temp_type_note_title');
      const date = new Date();
      const thaiDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
      setTitle(typeNoteTitle?.trim() || `บันทึกเสียง ${thaiDate}`);
    }
  }, []);

  // Generate AI reflection when REAL transcript is available
  useEffect(() => {
    // Only analyze real transcript, not mock data
    if (realTranscript && realTranscript.trim() && !aiReflection && !isLoadingAI) {
      console.log('Sending to AI:', realTranscript.substring(0, 100) + '...');
      setIsLoadingAI(true);
      generateReflection(realTranscript)
        .then(result => {
          console.log('AI Response:', result);
          setAiReflection(result);
        })
        .catch(err => console.error('AI Error:', err))
        .finally(() => setIsLoadingAI(false));
    }
  }, [realTranscript, aiReflection, isLoadingAI]);

  const transcriptLines: TranscriptLine[] = [
    {
      id: '1',
      speaker: 'ครู A',
      text: 'วันนี้เราจะมาพูดคุยเรื่องการจัดการเรียนรู้แบบ Active Learning ครับ ผมสังเกตว่านักเรียนของเรามีส่วนร่วมมากขึ้นเมื่อใช้วิธีนี้',
      timestamp: '00:05'
    },
    {
      id: '2',
      speaker: 'ครู B',
      text: 'ใช่ค่ะ ฉันก็เห็นด้วย โดยเฉพาะเด็กที่เงียบ ๆ เริ่มกล้าแสดงความคิดเห็นมากขึ้น การทำงานกลุ่มช่วยได้มากจริง ๆ',
      timestamp: '00:18'
    },
    {
      id: '3',
      speaker: 'ครู A',
      text: 'แต่ที่เป็นความท้าทายคือเรื่องเวลา เพราะต้องเตรียมกิจกรรมล่วงหน้า และบางครั้งก็ไม่สามารถครอบคลุมเนื้อหาได้ทั้งหมดในชั่วโมงที่กำหนด',
      timestamp: '00:32'
    },
    {
      id: '4',
      speaker: 'ครู B',
      text: 'จริงค่ะ บางทีก็ต้องแบ่งเป็น 2 คาบ หรือไม่ก็ส่งงานให้เด็กทำที่บ้านเป็นการบ้านเพิ่มเติม ถ้าเรามี template กิจกรรมสำเร็จรูปก็จะช่วยประหยัดเวลาได้เยอะ',
      timestamp: '00:47'
    },
    {
      id: '5',
      speaker: 'ครู A',
      text: 'ถูกต้อง เราน่าจะรวบรวม best practice ของแต่ละคนมาแชร์กันใน PLC จะได้ไม่ต้องคิดใหม่ทั้งหมดทุกครั้ง',
      timestamp: '01:05'
    }
  ];

  const saveRecord = async (visibility: string, plcId?: string) => {
    const content = realTranscript || transcriptLines.map(l => l.text).join(' ');
    let type = 'ประชุม';
    let tags: string[] = ['Voice Note'];
    try {
      const meta = localStorage.getItem('temp_type_note_meta');
      if (meta) {
        const parsed = JSON.parse(meta);
        if (parsed.type) type = parsed.type;
        if (Array.isArray(parsed.tags)) tags = parsed.tags.length ? parsed.tags : tags;
      }
    } catch {
      // ignore
    }
    const visibilityLabel = visibility === 'private' ? 'ส่วนตัว' : (visibility === 'plc' ? 'PLC' : 'ข้อเสนอ');
    const newRecord = {
      title: title,
      content: content,
      type,
      visibility: visibilityLabel,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      tags,
      source: (localStorage.getItem('temp_type_note_title') ? 'typed' : 'voice') as 'typed' | 'voice',
      ...(aiReflection && { ai_reflection: aiReflection }),
      ...(visibility === 'plc' && plcId && { shared_to_plc_id: plcId })
    };

    await addNote(newRecord);
    localStorage.removeItem('temp_transcript');
    localStorage.removeItem('temp_type_note_title');
    localStorage.removeItem('temp_type_note_meta');
    console.log('Note saved:', newRecord, isSupabaseAvailable ? '(Supabase)' : '(localStorage)');
  };

  const handleShareDecision = async (level: string, plcId?: string) => {
    setShowShareModal(false);

    // บันทึกพร้อมกลุ่ม PLC ที่แชร์ (shared_to_plc_id)
    await saveRecord(level, plcId);

    if (onShareDecision) {
      onShareDecision(level, plcId);
    }
  };

  const handleKeepPrivate = async () => {
    // Save first
    await saveRecord('private');

    if (onShareDecision) {
      onShareDecision('private');
    }
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
          <div className="flex-1">
             {isEditingTitle ? (
               <div className="flex items-center gap-2">
                 <input 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="flex-1 bg-blue-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-white"
                   autoFocus
                   onBlur={() => setIsEditingTitle(false)}
                 />
                 <button onClick={() => setIsEditingTitle(false)}>
                   <Check className="w-4 h-4" />
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-2" onClick={() => setIsEditingTitle(true)}>
                 <h1 className="text-lg truncate max-w-[200px]">{title}</h1>
                 <Edit2 className="w-3 h-3 opacity-70" />
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Audio Player Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <AudioPlayer
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            duration={duration}
          />
        </div>

        {/* Transcript Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="text-gray-900 mb-3">บันทึกคำพูด</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {realTranscript ? (
              <div className="flex gap-3">
                <span className="text-xs text-gray-500 min-w-[45px] mt-0.5">
                  00:00
                </span>
                <div className="flex-1">
                  <div className="text-sm text-blue-600 mb-1">คุณ</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{realTranscript}</p>
                </div>
              </div>
            ) : (
              transcriptLines.map((line) => (
                <div key={line.id} className="flex gap-3">
                  <span className="text-xs text-gray-500 min-w-[45px] mt-0.5">
                    {line.timestamp}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-blue-600 mb-1">{line.speaker}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{line.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Reflection Section */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <h2 className="text-gray-900">AI Reflection (แนะนำ)</h2>
              {isLoadingAI && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
            </div>

            {isLoadingAI ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-sm">กำลังวิเคราะห์ด้วย AI...</p>
              </div>
            ) : aiReflection ? (
              <>
                {/* ประเด็นสำคัญ */}
                <div className="mb-4">
                  <h3 className="text-sm text-purple-700 mb-2">💡 ประเด็นสำคัญ</h3>
                  <ul className="space-y-2">
                    {aiReflection.keyPoints.map((point, index) => (
                      <li key={`key-${index}`} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        <span className="flex-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* คำถามชวนคิด */}
                <div className="mb-4">
                  <h3 className="text-sm text-blue-700 mb-2">🤔 คำถามชวนคิด</h3>
                  <ul className="space-y-2">
                    {aiReflection.questions.map((question, index) => (
                      <li key={`q-${index}`} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span className="flex-1">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ข้อเสนอเบื้องต้น */}
                <div className="mb-3">
                  <h3 className="text-sm text-green-700 mb-2">🎯 ข้อเสนอเบื้องต้น</h3>
                  <ul className="space-y-2">
                    {aiReflection.suggestions.map((suggestion, index) => (
                      <li key={`s-${index}`} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span className="flex-1">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                ไม่สามารถวิเคราะห์ได้ในขณะนี้
              </div>
            )}

            {/* Note */}
            <div className="text-xs text-gray-600 text-center pt-3 border-t border-purple-200">
              💭 คุณเป็นผู้ตัดสินใจเสมอ
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="flex gap-3 w-full">
          <button
            onClick={handleKeepPrivate}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            เก็บไว้ส่วนตัว
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            พิจารณาแชร์
          </button>
        </div>
      </div>

      {/* Share Decision Modal */}
      <ShareDecisionModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onConfirm={handleShareDecision}
      />
    </div>
  );
}