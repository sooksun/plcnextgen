import React, { useRef, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface TranscriptDisplayProps {
  text: string;
  isRecording: boolean;
  isIdle: boolean;
  errorMessage: string | null;
}

// React.memo prevents re-render when props haven't changed
export const TranscriptDisplay = React.memo(function TranscriptDisplay({
  text,
  isRecording,
  isIdle,
  errorMessage
}: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new text arrives
  useEffect(() => {
    if (scrollRef.current && text) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text]);

  const getPlaceholderText = () => {
    if (isIdle) return 'กดปุ่มเพื่อเริ่มบันทึกและถอดเสียง...';
    if (errorMessage) return 'ไม่สามารถรับเสียงได้';
    return 'กำลังฟัง...';
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-48 mb-4">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          ถอดเสียงอัตโนมัติ (TH)
        </span>
        {isRecording && (
          <span className="text-[10px] text-blue-600 animate-pulse">Live</span>
        )}
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto bg-white text-sm text-gray-700 leading-relaxed text-left"
      >
        {text ? (
          text
        ) : (
          <span className="text-gray-400 italic">
            {getPlaceholderText()}
          </span>
        )}
      </div>
    </div>
  );
});
