'use client';

import type { UseFormRegister } from 'react-hook-form';
import { METRIC_LABELS, OPERATOR_LABELS } from '@/lib/types';
import { inputClass, selectClass } from '@/components/ui/field';
import { METRICS, OPERATORS, type TriggerFormData } from './trigger-schema';

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className="h-3 w-3 text-ink-dim"
          aria-hidden="true"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function ConditionRow({
  index,
  severe,
  removable,
  register,
  onRemove,
}: {
  index: number;
  severe: boolean;
  removable: boolean;
  register: UseFormRegister<TriggerFormData>;
  onRemove: () => void;
}) {
  const position = index + 1;
  return (
    <div className="flex items-start gap-2">
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
        <SelectWrapper>
          <select
            {...register(`conditions.${index}.metric` as const)}
            aria-label={`Condition ${position} metric`}
            className={selectClass}
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
        </SelectWrapper>

        {severe ? (
          <div className="flex items-center text-xs text-ink-dim sm:col-span-2">
            Fires on any severe-weather alert
          </div>
        ) : (
          <>
            <SelectWrapper>
              <select
                {...register(`conditions.${index}.operator` as const)}
                aria-label={`Condition ${position} operator`}
                className={selectClass}
              >
                {OPERATORS.map((o) => (
                  <option key={o} value={o}>
                    {OPERATOR_LABELS[o]}
                  </option>
                ))}
              </select>
            </SelectWrapper>
            <input
              type="number"
              step="any"
              aria-label={`Condition ${position} threshold`}
              {...register(`conditions.${index}.threshold` as const, {
                valueAsNumber: true,
              })}
              className={inputClass}
            />
          </>
        )}
      </div>

      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="focus-ring mt-2.5 shrink-0 text-ink-dim transition-colors hover:text-red-400"
          aria-label={`Remove condition ${position}`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
