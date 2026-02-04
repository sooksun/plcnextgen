import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  errorMessage: string | null;
  permissionDenied: boolean;
}

// React.memo prevents re-render when props haven't changed
export const ErrorDisplay = React.memo(function ErrorDisplay({
  errorMessage,
  permissionDenied
}: ErrorDisplayProps) {
  if (!errorMessage) return null;

  return (
    <div className="flex flex-col items-center gap-1 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg max-w-xs mx-auto">
      <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
        <AlertCircle className="w-3 h-3" />
        เกิดข้อขัดข้อง
      </div>
      <div className="text-xs text-red-500 text-center">
        {errorMessage}
      </div>
      {permissionDenied && (
        <div className="text-[10px] text-gray-500 mt-1">
          ไปที่การตั้งค่าเบราว์เซอร์ → อนุญาตไมโครโฟน → แล้วลองใหม่อีกครั้ง
        </div>
      )}
    </div>
  );
});
