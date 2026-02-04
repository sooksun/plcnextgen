import React from 'react';

interface TimerProps {
  seconds: number;
  isRecording: boolean;
  isPaused: boolean;
  isStopped: boolean;
  errorMessage: string | null;
}

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// React.memo prevents re-render when props haven't changed
export const Timer = React.memo(function Timer({
  seconds,
  isRecording,
  isPaused,
  isStopped,
  errorMessage
}: TimerProps) {
  return (
    <div className="mb-6 text-center">
      <div className="text-4xl text-gray-900 tabular-nums tracking-wider mb-2">
        {formatTime(seconds)}
      </div>
      {isRecording && (
        <div className="text-sm text-red-500 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          กำลังบันทึกเสียง...
        </div>
      )}
      {isPaused && (
        <div className="text-sm text-yellow-600">⏸ หยุดชั่วคราว</div>
      )}
      {isStopped && !errorMessage && (
        <div className="text-sm text-gray-600">■ บันทึกเสร็จสิ้น</div>
      )}
    </div>
  );
});
