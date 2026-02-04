import { Calendar, Clock, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { InboxItem } from '@/types';
import { statCards, pipelineItems, initialInboxItems, followUpItems, topicsData } from '@/data/mocks';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { PipelineColumn } from './PipelineColumn';
import { cn } from './ui/utils';
import { useNotes } from '@/hooks/useNotes';
import { useMemo } from 'react';

interface CuratorDashboardScreenProps {
  onViewProposal?: (id: string) => void;
}

export function CuratorDashboardScreen({ onViewProposal }: CuratorDashboardScreenProps) {
  const [selectedYear, setSelectedYear] = useState('2569');
  const { notes } = useNotes();

  const inboxList: InboxItem[] = useMemo(() => {
    const proposals = notes.filter((n) => n.visibility === 'ข้อเสนอ' || n.visibility === 'PLC');
    const fromNotes: InboxItem[] = proposals.map((note) => ({
      id: note.id,
      title: note.title,
      submittedBy: 'คุณ (เจ้าของ)',
      submittedDate: (note.date || note.timestamp || '').toString().split('T')[0] || '–',
      topic: note.type || 'ทั่วไป'
    }));
    return [...fromNotes, ...initialInboxItems];
  }, [notes]);

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
      {/* App Bar */}
      <div className="bg-blue-600 text-white px-4 py-3 safe-area-top sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg">Dashboard ความรู้โรงเรียน</h1>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-blue-700 text-white pl-3 pr-8 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
            >
              <option value="2569">ปีการศึกษา 2569</option>
              <option value="2568">ปีการศึกษา 2568</option>
              <option value="2567">ปีการศึกษา 2567</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <Card key={card.status} className={cn('p-4 gap-0 border', card.bgColor)}>
              <CardContent className="p-0">
                <div className="text-3xl mb-1">{card.count}</div>
                <div className={cn('text-sm', card.color)}>{card.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline Board */}
        <Card className="p-4 shadow-sm">
          <h2 className="text-gray-900 mb-3">📊 Pipeline ความรู้</h2>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-3 min-w-max pb-2">
              <PipelineColumn status="PROPOSED" label="รอพิจารณา" colorClass="text-blue-700" items={pipelineItems} onViewProposal={onViewProposal} />
              <PipelineColumn status="IN_TRIAL" label="กำลังทดลอง" colorClass="text-yellow-700" items={pipelineItems} onViewProposal={onViewProposal} />
              <PipelineColumn status="TESTED" label="ทดลองแล้ว" colorClass="text-purple-700" items={pipelineItems} onViewProposal={onViewProposal} />
              <PipelineColumn status="RECOMMENDED" label="แนะนำให้ใช้" colorClass="text-green-700" items={pipelineItems} onViewProposal={onViewProposal} />
              <PipelineColumn status="PAUSED" label="พักไว้ก่อน" colorClass="text-gray-700" items={pipelineItems} onViewProposal={onViewProposal} />
            </div>
          </div>
        </Card>

        {/* Two-Column Section: Inbox & Follow Up */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-gray-900">📥 Inbox (Top 5)</h3>
            </div>
            <div className="space-y-2">
              {inboxList.map((item) => (
                <Card
                  key={item.id}
                  className="p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors bg-gray-50 border-gray-200"
                  onClick={() => onViewProposal?.(item.id)}
                >
                  <CardContent className="p-0">
                    <h4 className="text-sm text-gray-900 mb-1">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>โดย {item.submittedBy}</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-transparent">
                        {item.topic}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.submittedDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-gray-900">🔔 สิ่งที่ต้องติดตาม</h3>
            </div>
            <div className="space-y-2">
              {followUpItems.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    'p-3 cursor-pointer transition-colors',
                    item.urgency === 'high' ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                  )}
                  onClick={() => onViewProposal?.(item.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-2">
                      {item.urgency === 'high' ? (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className="text-sm text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-600">{item.detail}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'mt-1 text-xs border-transparent',
                            item.type === 'trial_ending' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'
                          )}
                        >
                          {item.type === 'trial_ending' ? 'ใกล้สิ้นสุดการทดลอง' : 'รอสรุปผล'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Focus Topics Bar Chart */}
        <Card className="p-4 shadow-sm">
          <h3 className="text-gray-900 mb-3">📈 หัวข้อที่ได้รับความสนใจ (Top 5)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topicsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="topic"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 text-center mt-2">
            จำนวนข้อเสนอและบันทึกที่เกี่ยวข้องแต่ละหัวข้อ
          </p>
        </Card>

        {/* AI Insight Callout */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-gray-900">💡 AI Insight</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-indigo-600 flex-shrink-0">•</span>
              <p>
                <strong>การสอน</strong> เป็นหัวข้อที่ครูให้ความสนใจมากที่สุดในเดือนนี้ 
                มีข้อเสนอที่เกี่ยวข้องกับวิธีการสอนหลากหลายรูปแบบ
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-600 flex-shrink-0">•</span>
              <p>
                มีข้อเสนอ <strong>5 รายการ</strong> อยู่ในระหว่างทดลองใช้ 
                แนะนำติดตามผลและรวบรวม feedback จากครูผู้ทดลอง
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-200">
            <p className="text-xs text-indigo-700">
              💡 Insight นี้สร้างจากข้อมูลในระบบ เพื่อช่วยให้เห็นภาพรวมและแนวโน้ม 
              ไม่ใช่การตัดสินหรือเปรียบเทียบ
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}