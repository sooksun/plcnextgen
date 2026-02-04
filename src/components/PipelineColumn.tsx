import type { ProposalStatus, PipelineItem } from '@/types';
import { Card, CardContent } from './ui/card';
import { cn } from './ui/utils';

export interface PipelineColumnProps {
  status: ProposalStatus;
  label: string;
  colorClass: string;
  items: PipelineItem[];
  onViewProposal?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function PipelineColumn({
  status,
  label,
  colorClass,
  items,
  onViewProposal,
  className,
  style
}: PipelineColumnProps) {
  const columnItems = items.filter((item) => item.status === status);
  return (
    <div className={cn('flex-1 min-w-[200px]', className)} style={style}>
      <div className={cn('text-sm mb-2 px-3 py-2 rounded-lg bg-white border', colorClass)}>
        {label} ({columnItems.length})
      </div>
      <div className="space-y-2">
        {columnItems.map((item) => (
          <Card
            key={item.id}
            className="gap-0 p-3 cursor-pointer hover:shadow-md transition-shadow border-gray-200"
            onClick={() => onViewProposal?.(item.id)}
          >
            <CardContent className="p-0">
              <h4 className="text-gray-900 mb-1 line-clamp-2 text-sm">{item.title}</h4>
              <p className="text-xs text-gray-600">โดย {item.submittedBy}</p>
              <p className="text-xs text-gray-500 mt-1">{item.daysAgo} วันที่แล้ว</p>
            </CardContent>
          </Card>
        ))}
        {columnItems.length === 0 && (
          <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500">
            ไม่มีรายการ
          </div>
        )}
      </div>
    </div>
  );
}
