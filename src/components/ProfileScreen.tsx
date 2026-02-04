import { useState, useEffect } from 'react';
import { User, Mail, Phone, Settings, LogOut, Wifi, RefreshCw, Loader2 } from 'lucide-react';
import { checkSupabaseConnection } from '@/lib/supabase';

export function ProfileScreen() {
  const [supabaseStatus, setSupabaseStatus] = useState<{
    ok: boolean | null;
    message: string;
    details?: string;
  }>({ ok: null, message: '' });

  const testConnection = async () => {
    setSupabaseStatus((s) => ({ ...s, ok: null, message: 'กำลังตรวจสอบ...' }));
    const result = await checkSupabaseConnection();
    setSupabaseStatus({
      ok: result.ok,
      message: result.message,
      details: result.details
    });
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* App Bar */}
      <div className="bg-blue-600 text-white px-4 py-4 safe-area-top">
        <h1 className="text-xl">โปรไฟล์</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-900">ครูสมชาย ใจดี</h2>
              <p className="text-gray-500 text-sm">ครูชำนาญการ</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3" />
              <span className="text-sm">somchai@school.ac.th</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3" />
              <span className="text-sm">089-123-4567</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <button className="w-full flex items-center px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-600 mr-3" />
            <span className="text-gray-900">ตั้งค่า</span>
          </button>
          <button className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors">
            <LogOut className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-600">ออกจากระบบ</span>
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-gray-900 mb-3">สถิติการใช้งาน</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl text-blue-600">6</p>
              <p className="text-gray-600 text-xs">กลุ่ม PLC</p>
            </div>
            <div>
              <p className="text-2xl text-green-600">42</p>
              <p className="text-gray-600 text-xs">เอกสาร</p>
            </div>
            <div>
              <p className="text-2xl text-purple-600">128</p>
              <p className="text-gray-600 text-xs">แสดงความคิดเห็น</p>
            </div>
          </div>
        </div>

        {/* สถานะการเชื่อมต่อ Supabase */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-900 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-gray-600" />
              สถานะระบบ
            </h3>
            <button
              type="button"
              onClick={testConnection}
              disabled={supabaseStatus.ok === null && supabaseStatus.message === 'กำลังตรวจสอบ...'}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
              title="ตรวจสอบอีกครั้ง"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {supabaseStatus.ok === null && supabaseStatus.message === 'กำลังตรวจสอบ...' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-gray-600">กำลังตรวจสอบการเชื่อมต่อ Supabase...</span>
              </>
            ) : supabaseStatus.ok ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-green-700">{supabaseStatus.message}</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-red-700">{supabaseStatus.message}</span>
              </>
            )}
          </div>
          {supabaseStatus.details && supabaseStatus.ok === false && (
            <p className="text-xs text-gray-500 mt-2">{supabaseStatus.details}</p>
          )}
        </div>
      </div>
    </div>
  );
}
