import { Calendar, Clock, AlertCircle, Sparkles, ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { InboxItem, StatCard, PipelineItem } from '@/types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { PipelineColumn } from './PipelineColumn';
import { cn } from './ui/utils';
import { useNotes } from '@/hooks/useNotes';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface CuratorDashboardScreenProps {
  onViewProposal?: (id: string) => void;
}

export function CuratorDashboardScreen({ onViewProposal }: CuratorDashboardScreenProps) {
  const [selectedYear, setSelectedYear] = useState('2569');
  const { notes } = useNotes();
  const { user } = useAuthContext();

  // กรอง notes ที่เป็นข้อเสนอหรือ PLC
  const proposalNotes = useMemo(() => {
    return notes.filter((n) => n.visibility === 'ข้อเสนอ' || n.visibility === 'PLC');
  }, [notes]);

  // สร้าง stat cards จากข้อมูลจริง (ตอนนี้ยังไม่มี status field ใน notes)
  const statCards: StatCard[] = useMemo(() => {
    const proposalCount = proposalNotes.length;
    return [
      { status: 'PROPOSED', label: 'รอพิจารณา', count: proposalCount, color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
      { status: 'IN_TRIAL', label: 'กำลังทดลอง', count: 0, color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
      { status: 'TESTED', label: 'ทดลองแล้ว', count: 0, color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
      { status: 'RECOMMENDED', label: 'แนะนำให้ใช้', count: 0, color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' }
    ];
  }, [proposalNotes]);

  // สร้าง pipeline items จาก notes
  const pipelineItems: PipelineItem[] = useMemo(() => {
    return proposalNotes.map((note) => {
      const dateStr = note.date || note.timestamp || '';
      const daysAgo = dateStr ? Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        id: note.id,
        title: note.title,
        status: 'PROPOSED' as const, // ยังไม่มี status field จริง
        submittedBy: user?.full_name || 'ผู้ใช้',
        daysAgo
      };
    });
  }, [proposalNotes, user?.full_name]);

  // สร้าง inbox list จาก notes (ไม่ใช้ mock)
  const inboxList: InboxItem[] = useMemo(() => {
    return proposalNotes.slice(0, 5).map((note) => ({
      id: note.id,
      title: note.title,
      submittedBy: user?.full_name || 'ผู้ใช้',
      submittedDate: (note.date || note.timestamp || '').toString().split('T')[0] || '–',
      topic: note.type || 'ทั่วไป'
    }));
  }, [proposalNotes, user?.full_name]);

  // สร้าง topics data จาก tags ของ notes
  const topicsData = useMemo(() => {
    const tagCount: Record<string, number> = {};
    notes.forEach((note) => {
      (note.tags || []).forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
      // นับ type ด้วย
      if (note.type) {
        tagCount[note.type] = (tagCount[note.type] || 0) + 1;
      }
    });
    return Object.entries(tagCount)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
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
              {inboxList.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Info className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">ยังไม่มีข้อเสนอ</p>
                  <p className="text-xs mt-1">บันทึกที่แชร์เป็น "ข้อเสนอ" จะแสดงที่นี่</p>
                </div>
              ) : (
                inboxList.map((item) => (
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
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-gray-900">🔔 สิ่งที่ต้องติดตาม</h3>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">ยังไม่มีรายการติดตาม</p>
              <p className="text-xs mt-1">จะแสดงเมื่อมีข้อเสนอที่อยู่ระหว่างทดลองหรือรอสรุปผล</p>
            </div>
          </Card>
        </div>

        {/* Focus Topics Bar Chart */}
        <Card className="p-4 shadow-sm">
          <h3 className="text-gray-900 mb-3">📈 หัวข้อที่ได้รับความสนใจ (Top 5)</h3>
          {topicsData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">ยังไม่มีข้อมูลสำหรับแสดงกราฟ</p>
              <p className="text-xs mt-1">เมื่อมีบันทึกที่มีแท็กหรือหมวดหมู่ จะแสดงกราฟที่นี่</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </Card>

        {/* AI Insight Callout */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-gray-900">💡 AI Insight</h3>
          </div>
          {proposalNotes.length === 0 && notes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">ยังไม่มีข้อมูลเพียงพอสำหรับวิเคราะห์</p>
              <p className="text-xs mt-1">เมื่อมีบันทึกและข้อเสนอมากขึ้น AI จะสรุป insight ให้ที่นี่</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-sm text-gray-700">
                {topicsData.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 flex-shrink-0">•</span>
                    <p>
                      <strong>{topicsData[0].topic}</strong> เป็นหัวข้อที่ได้รับความสนใจมากที่สุด 
                      มี {topicsData[0].count} บันทึกที่เกี่ยวข้อง
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 flex-shrink-0">•</span>
                  <p>
                    มีข้อเสนอ <strong>{proposalNotes.length} รายการ</strong> ในระบบ
                    {proposalNotes.length > 0 && ' พร้อมสำหรับการพิจารณา'}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 flex-shrink-0">•</span>
                  <p>
                    มีบันทึกทั้งหมด <strong>{notes.length} รายการ</strong> จากทุก PLC
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <p className="text-xs text-indigo-700">
                  💡 Insight นี้สร้างจากข้อมูลในระบบ เพื่อช่วยให้เห็นภาพรวมและแนวโน้ม 
                  ไม่ใช่การตัดสินหรือเปรียบเทียบ
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}