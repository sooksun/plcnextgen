import { ArrowLeft, Mic, Pause, Square, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { RecordState, RecordType } from '@/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface RecordCaptureScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export function RecordCaptureScreen({ onBack, onComplete }: RecordCaptureScreenProps) {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [time, setTime] = useState(0);

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

  useEffect(() => {
    if (errorMessage) setRecordState('stopped');
  }, [errorMessage]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (recordState === 'recording') {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordState]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleRecordToggle = async () => {
    if (permissionState === 'denied') {
        toast.info('กรุณาอนุญาตการใช้ไมโครโฟนในการตั้งค่าเบราว์เซอร์');
        return;
    }

    if (recordState === 'idle' || recordState === 'stopped') {
      if (permissionState === 'unknown' || permissionState === 'prompt') {
        const granted = await requestMicrophonePermission();
        if (!granted) return;
      }
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
  };

  const handleStop = () => {
    setRecordState('stopped');
    const finalText = stopRecognition();
    if (typeof window !== 'undefined' && finalText) {
      localStorage.setItem('temp_transcript', finalText);
    }
  };

  const handleSave = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const getRecordButtonContent = () => {
    if (permissionState === 'denied') {
        return {
          icon: <AlertCircle className="w-12 h-12" />,
          label: 'ACCESS DENIED',
          bgColor: 'bg-gray-400',
          animation: ''
        };
    }

    switch (recordState) {
      case 'recording':
        return {
          icon: <Pause className="w-12 h-12" />,
          label: 'PAUSE',
          bgColor: 'bg-yellow-500 hover:bg-yellow-600',
          animation: 'animate-pulse'
        };
      case 'paused':
        return {
          icon: <Mic className="w-12 h-12" />,
          label: 'RESUME',
          bgColor: 'bg-blue-600 hover:bg-blue-700',
          animation: ''
        };
      case 'stopped':
        return {
          icon: <Mic className="w-12 h-12" />,
          label: 'RECORD',
          bgColor: 'bg-red-500 hover:bg-red-600',
          animation: ''
        };
      default:
        return {
          icon: <Mic className="w-12 h-12" />,
          label: 'RECORD',
          bgColor: 'bg-red-500 hover:bg-red-600',
          animation: ''
        };
    }
  };

  const buttonContent = getRecordButtonContent();

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
          {/* Timer */}
          <div className="mb-6 text-center">
            <div className="text-4xl text-gray-900 tabular-nums tracking-wider mb-2">
              {formatTime(time)}
            </div>
            {recordState === 'recording' && (
              <div className="text-sm text-red-500 flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                กำลังบันทึกเสียง...
              </div>
            )}
            {recordState === 'paused' && (
              <div className="text-sm text-yellow-600">⏸ หยุดชั่วคราว</div>
            )}
            {recordState === 'stopped' && !errorMessage && (
              <div className="text-sm text-gray-600">■ บันทึกเสร็จสิ้น</div>
            )}
            
            {/* Error Message Display */}
            {errorMessage && (
               <div className="flex flex-col items-center gap-1 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg max-w-xs mx-auto">
                 <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                    <AlertCircle className="w-3 h-3" />
                    เกิดข้อขัดข้อง
                 </div>
                 <div className="text-xs text-red-500 text-center">
                   {errorMessage}
                 </div>
                 {permissionState === 'denied' && (
                    <div className="text-[10px] text-gray-500 mt-1">
                        ไปที่การตั้งค่าเบราว์เซอร์ → อนุญาตไมโครโฟน → แล้วลองใหม่อีกครั้ง
                    </div>
                 )}
               </div>
            )}
          </div>

          {/* Record Button */}
          <button
            onClick={handleRecordToggle}
            disabled={permissionState === 'denied'}
            className={`w-28 h-28 rounded-full ${buttonContent.bgColor} ${buttonContent.animation} text-white shadow-xl transition-all flex flex-col items-center justify-center mb-4 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {buttonContent.icon}
            <span className="text-xs mt-1 font-medium">{buttonContent.label}</span>
          </button>

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

            {/* Save Button */}
            {recordState === 'stopped' && time > 0 && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-lg animate-in fade-in zoom-in duration-300"
              >
                <span className="text-sm font-medium">บันทึกและดูสรุป</span>
              </button>
            )}
          </div>

          {/* Live Transcript Box */}
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-48 mb-4">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                ถอดเสียงอัตโนมัติ (TH)
              </span>
              {recordState === 'recording' && (
                <span className="text-[10px] text-blue-600 animate-pulse">Live</span>
              )}
            </div>
            <div className="flex-1 p-3 overflow-y-auto bg-white text-sm text-gray-700 leading-relaxed text-left">
              {displayText ? (
                displayText
              ) : (
                <span className="text-gray-400 italic">
                  {recordState === 'idle' 
                    ? 'กดปุ่มเพื่อเริ่มบันทึกและถอดเสียง...' 
                    : errorMessage 
                        ? 'ไม่สามารถรับเสียงได้' 
                        : 'กำลังฟัง...'}
                </span>
              )}
            </div>
          </div>
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