'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_MS = 5_000;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

/**
 * Transient feedback for actions whose result has nowhere to live on screen —
 * a test send, a copied link, a failed delete. Replaces the ad-hoc inline
 * messages that each page kept in its own piece of state.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      DISMISS_MS,
    );
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/*
        Rendered in the tree rather than a portal: the live regions must already
        exist in the DOM when a message lands in them, or a screen reader has
        nothing to observe and stays silent. The provider sits at the root, so
        `position: fixed` has no transformed ancestor to fight.
      */}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

const TONE_CLASS: Record<ToastTone, string> = {
  success: 'border-emerald-500/30 bg-success-bg text-emerald-300',
  error: 'border-red-500/30 bg-danger-bg text-red-300',
  info: 'border-rim-bright bg-elevated text-ink',
};

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-60 flex flex-col items-center gap-2 px-4">
      {/*
        Two regions, because the politeness level is not a per-message choice:
        a screen reader picks it up from the live region a message appears in.
        Failures interrupt, confirmations wait their turn.
      */}
      <Region toasts={toasts.filter((t) => t.tone === 'error')} assertive />
      <Region toasts={toasts.filter((t) => t.tone !== 'error')} />
    </div>
  );
}

function Region({
  toasts,
  assertive = false,
}: {
  toasts: Toast[];
  assertive?: boolean;
}) {
  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      className="flex w-full flex-col items-center gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-up pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg shadow-black/40 ${TONE_CLASS[t.tone]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
