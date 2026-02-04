import React from 'react';
import { Mic, Pause, AlertCircle } from 'lucide-react';
import type { RecordState } from '@/types';

interface RecordButtonProps {
  recordState: RecordState;
  permissionDenied: boolean;
  onClick: () => void;
}

// React.memo prevents re-render when props haven't changed
export const RecordButton = React.memo(function RecordButton({
  recordState,
  permissionDenied,
  onClick
}: RecordButtonProps) {
  const getButtonContent = () => {
    if (permissionDenied) {
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

  const content = getButtonContent();

  return (
    <button
      onClick={onClick}
      disabled={permissionDenied}
      className={`w-28 h-28 rounded-full ${content.bgColor} ${content.animation} text-white shadow-xl transition-all flex flex-col items-center justify-center mb-4 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {content.icon}
      <span className="text-xs mt-1 font-medium">{content.label}</span>
    </button>
  );
});
