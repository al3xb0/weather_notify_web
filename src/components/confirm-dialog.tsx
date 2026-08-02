'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Reusable confirmation popup rendered in a portal — a styled, accessible
 * replacement for window.confirm. Esc and backdrop clicks cancel, the body
 * scroll is locked while open, Tab is trapped inside, and focus returns to
 * whatever opened it on close.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Callers pass inline closures, so these change identity on every parent
  // render. Reading them through refs keeps the effect below keyed on `open`
  // alone — otherwise it would tear down and re-run mid-dialog, stealing focus
  // back to Cancel and losing track of which element opened it.
  const latest = useRef({ pending, onCancel });
  useEffect(() => {
    latest.current = { pending, onCancel };
  });

  useEffect(() => {
    if (!open) return;

    // Remember the trigger so focus can go back where the user left it —
    // otherwise closing the dialog drops keyboard focus onto <body>.
    const opener = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !latest.current.pending) {
        latest.current.onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      // Wrap at both ends so Tab can never reach the page behind the overlay.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    cancelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        className="absolute inset-0 bg-base/70 backdrop-blur-sm"
        onClick={pending ? undefined : onCancel}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-sm rounded-2xl border border-rim bg-card p-6 shadow-2xl shadow-black/40 animate-fade-up"
      >
        <h2
          id="confirm-dialog-title"
          className="font-heading text-lg font-semibold text-ink"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="mt-2 text-sm leading-relaxed text-ink-dim"
        >
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-xl border border-rim px-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              danger
                ? 'rounded-xl border border-red-500/30 bg-danger-bg px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50'
                : 'rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50'
            }
          >
            {pending ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
