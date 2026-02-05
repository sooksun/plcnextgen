import { ArrowLeft, Square, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import type { RecordState, RecordType } from '@/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Timer, TranscriptDisplay, RecordButton, ErrorDisplay } from './recording';

// Constants for chunking (แนวทาง 3)
const CHUNK_INTERVAL_MS = 5 * 60 * 1000; // บันทึก chunk ทุก 5 นาที
const CHUNK_STORAGE_KEY = 'transcript_chunks';

interface TranscriptChunk {
  id: number;
  text: string;
  timestamp: number;
}

interface RecordCaptureScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export function RecordCaptureScreen({ onBack, onComplete }: RecordCaptureScreenProps) {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [time, setTime] = useState(0);
  
  // Chunking state (แนวทาง 3)
  const chunksRef = useRef<TranscriptChunk[]>([]);
  const chunkIdRef = useRef(0);
  const lastChunkTimeRef = useRef(0);

  const {
    isSupported: isSpeechSupported,
    permissionState,
    errorMessage,
    fullTranscript,
    currentTranscript,
    requestPermission: requestMicrophonePermission,
    start: startRecognition,
    pause: pauseRecognition,
    stop: stopRecognition,
    reset: resetTranscript
  } = useSpeechRecognition({ lang: 'th-TH' });

  const recordTypes: RecordType[] = [
    'การสอน',
    'ประชุมผู้บริหาร',
    'ประชุมครู',
    'PLC',
    'ไอเดียส่วนตัว',
    'อื่น ๆ'
  ];

  // แนวทาง 3: Save chunk to localStorage
  const saveChunk = useCallback((text: string) => {
    if (!text.trim()) return;
    
    const chunk: TranscriptChunk = {
      id: chunkIdRef.current++,
      text: text.trim(),
      timestamp: Date.now()
    };
    
    chunksRef.current.push(chunk);
    
    // บันทึกลง localStorage เพื่อป้องกันข้อมูลหาย
    try {
      localStorage.setItem(CHUNK_STORAGE_KEY, JSON.stringify(chunksRef.current));
    } catch (e) {
      console.warn('Failed to save chunk to localStorage:', e);
    }
  }, []);

  // แนวทาง 3: Get all chunks combined
  const getAllChunksText = useCallback((): string => {
    return chunksRef.current.map(c => c.text).join(' ');
  }, []);

  // แนวทาง 3: Clear all chunks
  const clearChunks = useCallback(() => {
    chunksRef.current = [];
    chunkIdRef.current = 0;
    lastChunkTimeRef.current = 0;
    try {
      localStorage.removeItem(CHUNK_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (errorMessage) setRecordState('stopped');
  }, [errorMessage]);

  // Timer effect with chunking (แนวทาง 3)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (recordState === 'recording') {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          
          // แนวทาง 3: Auto-save chunk ทุก 5 นาที
          const currentMs = newTime * 1000;
          if (currentMs - lastChunkTimeRef.current >= CHUNK_INTERVAL_MS) {
            const textToSave = (fullTranscript + ' ' + currentTranscript).trim();
            if (textToSave) {
              saveChunk(textToSave);
              lastChunkTimeRef.current = currentMs;
            }
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordState, fullTranscript, currentTranscript, saveChunk]);

  const handleRecordToggle = useCallback(async () => {
    if (permissionState === 'denied') {
      toast.info('กรุณาอนุญาตการใช้ไมโครโฟนในการตั้งค่าเบราว์เซอร์');
      return;
    }

    if (recordState === 'idle' || recordState === 'stopped') {
      if (permissionState === 'unknown' || permissionState === 'prompt') {
        const granted = await requestMicrophonePermission();
        if (!granted) return;
      }
      // Clear chunks for new recording session
      clearChunks();
      resetTranscript();
      setRecordState('recording');
      setTime(0);
      startRecognition();
    } else if (recordState === 'recording') {
      setRecordState('paused');
      pauseRecognition();
    } else if (recordState === 'paused') {
      setRecordState('recording');
      startRecognition();
    }
  }, [permissionState, recordState, clearChunks, resetTranscript, startRecognition, pauseRecognition, requestMicrophonePermission]);

  const handleStop = useCallback(() => {
    setRecordState('stopped');
    const finalText = stopRecognition();
    
    // บันทึก chunk สุดท้าย
    if (finalText) {
      saveChunk(finalText);
    }
    
    // รวม chunks ทั้งหมดและบันทึกลง temp_transcript
    if (typeof window !== 'undefined') {
      const allText = getAllChunksText() || finalText;
      if (allText) {
        localStorage.setItem('temp_transcript', allText);
      }
    }
  }, [stopRecognition, saveChunk, getAllChunksText]);

  const handleSave = useCallback(() => {
    // Clear chunks หลังบันทึกสำเร็จ
    clearChunks();
    if (onComplete) {
      onComplete();
    }
  }, [clearChunks, onComplete]);

  /** ยกเลิกการบันทึก: ลบข้อมูลที่บันทึกไว้ ไม่ไปหน้าสรุป และกลับหน้าหลัก */
  const handleCancel = useCallback(() => {
    stopRecognition();
    clearChunks();
    resetTranscript();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('temp_transcript');
      localStorage.removeItem('temp_type_note_title');
      localStorage.removeItem('temp_type_note_meta');
    }
    setRecordState('idle');
    setTime(0);
    toast.info('ยกเลิกการบันทึกแล้ว');
    if (onBack) onBack();
  }, [stopRecognition, clearChunks, resetTranscript, onBack]);

  // Memoized display text to reduce re-computation
  const displayText = (fullTranscript + ' ' + currentTranscript).trim();

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
          <h1 className="text-lg">บันทึกเสียง</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Recording Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
          {/* แนวทาง 4: Timer component แยก (React.memo) */}
          <Timer
            seconds={time}
            isRecording={recordState === 'recording'}
            isPaused={recordState === 'paused'}
            isStopped={recordState === 'stopped'}
            errorMessage={errorMessage}
          />
          
          {/* แนวทาง 4: ErrorDisplay component แยก (React.memo) */}
          <ErrorDisplay
            errorMessage={errorMessage}
            permissionDenied={permissionState === 'denied'}
          />

          {/* แนวทาง 4: RecordButton component แยก (React.memo) */}
          <RecordButton
            recordState={recordState}
            permissionDenied={permissionState === 'denied'}
            onClick={handleRecordToggle}
          />

          {/* Action Buttons */}
          <div className="h-12 mb-4 flex items-center justify-center gap-4 w-full">
            {/* Stop Button */}
            {(recordState === 'recording' || recordState === 'paused') && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors shadow-sm"
              >
                <Square className="w-4 h-4" />
                <span className="text-sm">หยุดบันทึก</span>
              </button>
            )}

            {/* Save / Cancel เมื่อหยุดบันทึกแล้ว */}
            {recordState === 'stopped' && time > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors border border-gray-300 animate-in fade-in zoom-in duration-300"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">ยกเลิก</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-lg animate-in fade-in zoom-in duration-300"
                >
                  <span className="text-sm font-medium">บันทึกและดูสรุป</span>
                </button>
              </>
            )}
          </div>

          {/* แนวทาง 4: TranscriptDisplay component แยก (React.memo) */}
          <TranscriptDisplay
            text={displayText}
            isRecording={recordState === 'recording'}
            isIdle={recordState === 'idle'}
            errorMessage={errorMessage}
          />
        </div>

        {/* Record Type Selection */}
        <div className="px-4 py-4 bg-white border-t border-gray-200">
          <h3 className="text-gray-900 text-xs font-medium mb-3 uppercase tracking-wide">ประเภทบันทึก</h3>
          <div className="flex flex-wrap gap-2">
            {recordTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                  selectedType === type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 safe-area-bottom">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
            <span className="text-base">🤖</span>
            <div className="text-[10px] text-gray-600 leading-tight">
              <span className="text-blue-700 font-medium block mb-0.5">AI กำลังทำงาน</span>
              ระบบกำลังถอดเสียงและจับประเด็นสำคัญให้อัตโนมัติ ข้อมูลอาจมีความคลาดเคลื่อนโปรดตรวจสอบ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}