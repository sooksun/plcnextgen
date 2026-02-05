import * as React from 'react';
import { cn } from '../utils';

export interface AppHeader3DProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export function AppHeader3D({
  title,
  leftAction,
  rightAction,
  className,
}: AppHeader3DProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between gap-3',
        'h-14 min-h-[56px] px-4 safe-area-top',
        'gradient-surface shadow-elevated',
        'border-b border-black/5 dark:border-white/10',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {leftAction && (
          <div className="flex shrink-0 items-center">{leftAction}</div>
        )}
        <h1
          className={cn(
            'truncate text-lg font-semibold text-text-primary',
            !leftAction && 'flex-1'
          )}
        >
          {title}
        </h1>
      </div>
      {rightAction && (
        <div className="flex shrink-0 items-center gap-2">{rightAction}</div>
      )}
    </header>
  );
}
