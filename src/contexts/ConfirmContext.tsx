import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type ConfirmOptions = {
  title?: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => void;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const onConfirmRef = useRef<(() => void | Promise<void>) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    onConfirmRef.current = opts.onConfirm;
    setOptions(opts);
    setOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    const callback = onConfirmRef.current;
    onConfirmRef.current = null;
    setOpen(false);
    setOptions(null);
    if (callback) await callback();
  }, []);

  const handleCancel = useCallback(() => {
    onConfirmRef.current = null;
    setOpen(false);
    setOptions(null);
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleCancel();
  }, [handleCancel]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && options && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
              {options.title ?? 'ยืนยัน'}
            </h2>
            <p id="confirm-desc" className="mt-2 text-sm text-gray-600">
              {options.message}
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {options.cancelLabel ?? 'ยกเลิก'}
              </Button>
              <Button type="button" onClick={handleConfirm}>
                {options.confirmLabel ?? 'ตกลง'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
