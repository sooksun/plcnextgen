import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

export interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime?: string;
  duration: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AudioPlayer({
  isPlaying,
  onTogglePlay,
  currentTime = '0:00',
  duration,
  className,
  style
}: AudioPlayerProps) {
  return (
    <div className={cn('flex items-center gap-4', className)} style={style}>
      <Button
        type="button"
        size="icon"
        onClick={onTogglePlay}
        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0"
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-0.5 h-8 mb-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={`wave-${i}`}
              className="flex-1 bg-blue-200 rounded-full min-h-[20%]"
              style={{
                height: `${Math.random() * 80 + 20}%`
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}
