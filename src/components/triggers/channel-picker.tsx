'use client';

import type { UseFormRegister } from 'react-hook-form';
import { CHANNEL_LABELS } from '@/lib/types';
import { CHANNELS, type TriggerFormData } from './trigger-schema';

export function ChannelPicker({
  selected,
  register,
}: {
  selected: string[];
  register: UseFormRegister<TriggerFormData>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHANNELS.map((c) => {
        const active = selected.includes(c);
        return (
          <label
            key={c}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sky-400 ${
              active
                ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
                : 'border-rim text-ink-dim hover:border-rim-bright hover:text-ink'
            }`}
          >
            {/*
              Visually hidden rather than display:none — a hidden input is not
              focusable, which would drop every channel out of the tab order.
            */}
            <input
              type="checkbox"
              value={c}
              {...register('channels')}
              className="sr-only"
            />
            {active && (
              <svg
                viewBox="0 0 10 10"
                fill="none"
                className="h-2.5 w-2.5"
                aria-hidden="true"
              >
                <path
                  d="M2 5l2.5 2.5 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {CHANNEL_LABELS[c]}
          </label>
        );
      })}
    </div>
  );
}
