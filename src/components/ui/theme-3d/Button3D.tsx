import * as React from 'react';
import { cn } from '../utils';

export interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  primary:
    'bg-blue-600 text-white shadow-button-3d hover:bg-blue-700 active:shadow-button-pressed active:translate-y-0.5 dark:bg-blue-500 dark:hover:bg-blue-600',
  secondary:
    'bg-gray-600 text-white shadow-elevated hover:bg-gray-700 active:shadow-button-pressed active:translate-y-0.5',
  outline:
    'border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 active:shadow-button-pressed active:translate-y-0.5 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
  ghost: 'text-text-primary hover:bg-accent active:bg-accent',
  success:
    'bg-green-600 text-white shadow-button-3d hover:bg-green-700 active:shadow-button-pressed active:translate-y-0.5',
  destructive:
    'bg-red-600 text-white shadow-elevated hover:bg-red-700 active:shadow-button-pressed active:translate-y-0.5',
};

const sizes = {
  sm: 'h-9 px-4 rounded-xl text-sm',
  md: 'h-11 px-5 rounded-xl text-base min-h-[44px]',
  lg: 'h-12 px-6 rounded-2xl text-lg min-h-[48px]',
};

export function Button3D({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  disabled,
  children,
  ...props
}: Button3DProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus-ring-3d focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
