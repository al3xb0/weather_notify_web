'use client';

import { useId, type ReactNode } from 'react';

export const inputClass =
  'w-full rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-sm text-ink placeholder-ink-dim/50 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10 aria-invalid:border-red-500/60';

export const selectClass =
  'w-full appearance-none rounded-xl border border-rim bg-surface py-2.5 pl-3.5 pr-8 text-sm text-ink outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10 aria-invalid:border-red-500/60';

export interface FieldSlots {
  id: string;
  invalid: boolean;
  /** Pass to the control so its hint and error are read out with it. */
  describedBy: string | undefined;
}

/**
 * Label, hint and error around one control, with the aria wiring done once.
 *
 * A red paragraph under an input is invisible to a screen reader unless the
 * control points at it, so every field previously rendered its error as
 * decoration only. The render prop hands back the ids rather than cloning
 * children, which keeps the control's own props explicit.
 */
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (slots: FieldSlots) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim"
      >
        {label}
      </label>
      {children({ id, invalid: !!error, describedBy })}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-dim">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

/**
 * Standalone error text for groups (checkbox sets, field arrays) that have no
 * single control to label. role=alert so it is announced when it appears.
 */
export function FieldError({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-400">
      {children}
    </p>
  );
}

/** Groups a set of controls that share one label — channels, condition rows. */
export function FieldGroup({
  label,
  error,
  action,
  children,
}: {
  label: string;
  error?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  // No aria-invalid here: `group` does not support it. The error below carries
  // role=alert, which is what actually gets the failure announced.
  return (
    <div role="group" aria-labelledby={id}>
      <div className="mb-2 flex items-center justify-between">
        <span
          id={id}
          className="block text-xs font-medium uppercase tracking-wider text-ink-dim"
        >
          {label}
        </span>
        {action}
      </div>
      {children}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
