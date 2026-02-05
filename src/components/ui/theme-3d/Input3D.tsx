import * as React from 'react';
import { cn } from '../utils';

export interface Input3DProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Input3D({
  label,
  error,
  hint,
  containerClassName,
  className,
  id: idProp,
  ...props
}: Input3DProps) {
  const id = idProp ?? React.useId();

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-xl border-2 bg-surface px-4 py-3 text-base text-text-primary',
          'placeholder:text-text-muted',
          'transition-colors duration-200',
          'min-h-[48px]',
          'border-black/10 dark:border-white/15',
          'hover:border-primary/30 focus:border-primary',
          'focus-ring-3d focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'aria-invalid:border-error aria-invalid:focus:ring-error/30',
          error && 'border-error',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
