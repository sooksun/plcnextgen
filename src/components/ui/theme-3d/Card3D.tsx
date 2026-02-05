import * as React from 'react';
import { cn } from '../utils';

export interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card3D({ className, children, ...props }: Card3DProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-black/5 dark:border-white/10',
        'bg-card text-card-foreground gradient-card-3d shadow-card-3d',
        'p-5 sm:p-6',
        'transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Card3DHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-3', className)} {...props} />;
}

export function Card3DTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold text-text-primary', className)}
      {...props}
    />
  );
}

export function Card3DDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-text-secondary mt-1', className)} {...props} />
  );
}
