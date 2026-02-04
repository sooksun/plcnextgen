import type { RecordItem } from '@/types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

const typeColors: Record<RecordItem['type'], string> = {
  'ประชุม': 'bg-blue-100 text-blue-700 border-transparent',
  'PLC': 'bg-purple-100 text-purple-700 border-transparent',
  'ไอเดีย': 'bg-yellow-100 text-yellow-700 border-transparent',
  'การสอน': 'bg-green-100 text-green-700 border-transparent'
};

const visibilityColors: Record<RecordItem['visibility'], string> = {
  'ส่วนตัว': 'bg-gray-100 text-gray-700 border-transparent',
  'PLC': 'bg-indigo-100 text-indigo-700 border-transparent',
  'ข้อเสนอ': 'bg-orange-100 text-orange-700 border-transparent'
};

export interface RecordCardProps {
  record: RecordItem;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function RecordCard({ record, className, style, onClick }: RecordCardProps) {
  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'gap-2 p-4 shadow-sm border-gray-200 hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer hover:border-blue-200',
        className
      )}
      style={style}
    >
      <CardContent className="p-0 gap-2 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-gray-900 flex-1 font-medium">{record.title}</h3>
          {record.source === 'typed' && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-transparent shrink-0">
              พิมพ์
            </Badge>
          )}
        </div>
        {record.tags && record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.tags.slice(0, 3).map((tag, idx) => (
              <span key={`tag-${record.id}-${idx}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {record.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{record.tags.length - 3}</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn('px-2 py-0.5', typeColors[record.type])}>
              {record.type}
            </Badge>
            <Badge variant="outline" className={cn('px-2 py-0.5', visibilityColors[record.visibility])}>
              {record.visibility}
            </Badge>
          </div>
          <span className="text-gray-500">{record.date}</span>
        </div>
      </CardContent>
    </Card>
  );
}
