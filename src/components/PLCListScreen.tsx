import { Search } from 'lucide-react';
import { useState } from 'react';
import type { PLCCard } from '@/types';

const plcData: PLCCard[] = [
  {
    id: '1',
    name: 'PLC คณิตศาสตร์',
    members: 12,
    status: 'new',
    statusText: '🔴 มีเอกสารใหม่'
  },
  {
    id: '2',
    name: 'PLC วิทยาศาสตร์',
    members: 15,
    status: 'updated',
    statusText: '✅ อัพเดทแล้ว'
  },
  {
    id: '3',
    name: 'PLC ภาษาไทย',
    members: 10,
    status: 'new',
    statusText: '🔴 มีเอกสารใหม่'
  },
  {
    id: '4',
    name: 'PLC ภาษาอังกฤษ',
    members: 18,
    status: 'updated',
    statusText: '✅ อัพเดทแล้ว'
  },
  {
    id: '5',
    name: 'PLC สังคมศึกษา',
    members: 8,
    status: 'new',
    statusText: '🔴 มีเอกสารใหม่'
  },
  {
    id: '6',
    name: 'PLC ศิลปะ',
    members: 14,
    status: 'updated',
    statusText: '✅ อัพเดทแล้ว'
  }
];

interface PLCListScreenProps {
  onSelectPLC?: (plcName: string) => void;
}

export function PLCListScreen({ onSelectPLC }: PLCListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPLCs = plcData.filter(plc =>
    plc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* App Bar with Search */}
      <div className="bg-blue-600 text-white px-4 py-3 safe-area-top">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา PLC"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* PLC Cards List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredPLCs.map((plc) => (
            <div
              key={plc.id}
              onClick={() => onSelectPLC && onSelectPLC(plc.name)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-gray-900 mb-2">{plc.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">
                  👥 {plc.members} สมาชิก
                </span>
                <span className={`text-sm ${
                  plc.status === 'new' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {plc.statusText}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredPLCs.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            ไม่พบ PLC ที่ค้นหา
          </div>
        )}
      </div>
    </div>
  );
}
