'use client';

import { useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CityAutocomplete } from '@/components/city-autocomplete';
import {
  TriggerInput,
  useApiLimits,
  useCreateTrigger,
  useUpdateTrigger,
} from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { Field, FieldGroup, inputClass } from '@/components/ui/field';
import { ChannelPicker } from '@/components/triggers/channel-picker';
import { ConditionRow } from '@/components/triggers/condition-row';
import {
  buildTriggerSchema,
  DEFAULT_CONDITION,
  type TriggerFormData,
} from '@/components/triggers/trigger-schema';
import type { Trigger } from '@/lib/types';

export function TriggerForm({
  initial,
  onDone,
}: {
  initial?: Trigger;
  onDone: () => void;
}) {
  const create = useCreateTrigger();
  const update = useUpdateTrigger();
  const limits = useApiLimits();
  const [error, setError] = useState<string | null>(null);
  const schema = useMemo(() => buildTriggerSchema(limits), [limits]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TriggerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      city: initial?.city ?? '',
      latitude: initial?.latitude,
      longitude: initial?.longitude,
      conditions: initial?.conditions?.map((c) => ({
        metric: c.metric,
        operator: c.operator,
        threshold: c.threshold,
      })) ?? [{ ...DEFAULT_CONDITION }],
      conditionLogic: initial?.conditionLogic ?? 'AND',
      channels: initial?.channels ?? ['TELEGRAM'],
      cooldownMin: initial?.cooldownMin ?? 60,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conditions',
  });
  const city = useWatch({ control, name: 'city' });
  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const channels = useWatch({ control, name: 'channels' }) ?? [];
  const watchedConditions = useWatch({ control, name: 'conditions' });
  const logic = useWatch({ control, name: 'conditionLogic' });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const input: TriggerInput = {
      name: data.name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      conditions: data.conditions.map((c) =>
        c.metric === 'SEVERE'
          ? { metric: 'SEVERE' as const, operator: 'EQ' as const, threshold: 0 }
          : c,
      ),
      conditionLogic: data.conditions.length > 1 ? data.conditionLogic : 'AND',
      channels: data.channels,
      cooldownMin: data.cooldownMin,
    };
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, input });
      } else {
        await create.mutateAsync(input);
      }
      onDone();
    } catch (err) {
      setError(apiError(err));
    }
  });

  const located = latitude !== undefined && longitude !== undefined;

  return (
    <form
      onSubmit={onSubmit}
      aria-label={initial ? 'Edit trigger' : 'New trigger'}
      className="rounded-2xl border border-rim-bright bg-card p-6 shadow-xl shadow-black/30"
    >
      <div className="mb-5 flex items-center justify-between">
        {/* Explicit colour like every other panel heading. */}
        <h2 className="font-heading text-base font-semibold text-ink">
          {initial ? 'Edit trigger' : 'New trigger'}
        </h2>
        <button
          type="button"
          onClick={onDone}
          className="focus-ring text-ink-dim transition-colors hover:text-ink"
          aria-label="Close"
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
      </div>

      <div className="space-y-5">
        <Field label="Name" error={errors.name?.message}>
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              {...register('name')}
              placeholder="e.g. Berlin heat wave"
              className={inputClass}
            />
          )}
        </Field>

        <Field
          label="City"
          error={errors.city?.message ?? errors.latitude?.message}
          hint={
            located ? (
              <>
                <span className="text-sky-400">{city}</span>{' '}
                <span className="text-ink-dim/70">
                  ({latitude.toFixed(2)}, {longitude.toFixed(2)})
                </span>
              </>
            ) : undefined
          }
        >
          {({ id, invalid, describedBy }) => (
            <CityAutocomplete
              inputId={id}
              invalid={invalid}
              describedBy={describedBy}
              initial={city}
              onSelect={(g) => {
                setValue('city', g.name, { shouldValidate: true });
                setValue('latitude', g.latitude, { shouldValidate: true });
                setValue('longitude', g.longitude, { shouldValidate: true });
              }}
            />
          )}
        </Field>

        <FieldGroup
          label="Conditions"
          error={errors.conditions?.message}
          action={
            fields.length > 1 && (
              <div
                role="radiogroup"
                aria-label="Combine conditions with"
                className="flex items-center gap-1 rounded-lg border border-rim p-0.5 text-xs font-semibold"
              >
                {(['AND', 'OR'] as const).map((l) => (
                  <label
                    key={l}
                    className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sky-400 ${
                      logic === l
                        ? 'bg-sky-500/15 text-sky-300'
                        : 'text-ink-dim hover:text-ink'
                    }`}
                  >
                    <input
                      type="radio"
                      value={l}
                      {...register('conditionLogic')}
                      className="sr-only"
                    />
                    {l}
                  </label>
                ))}
              </div>
            )
          }
        >
          <div className="space-y-2">
            {fields.map((field, i) => (
              <ConditionRow
                key={field.id}
                index={i}
                severe={watchedConditions?.[i]?.metric === 'SEVERE'}
                removable={fields.length > 1}
                register={register}
                onRemove={() => remove(i)}
              />
            ))}
          </div>

          {fields.length < limits.maxConditionsPerTrigger && (
            <button
              type="button"
              onClick={() => append({ ...DEFAULT_CONDITION })}
              className="focus-ring mt-2 text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300"
            >
              + Add condition
            </button>
          )}
        </FieldGroup>

        <FieldGroup label="Channels" error={errors.channels?.message}>
          <ChannelPicker selected={channels} register={register} />
        </FieldGroup>

        <Field
          label="Cooldown (minutes)"
          error={errors.cooldownMin?.message}
          hint="Minutes to wait between repeated alerts"
        >
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="number"
              min={10}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              {...register('cooldownMin', { valueAsNumber: true })}
              className="w-28 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10 aria-invalid:border-red-500/60"
            />
          )}
        </Field>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-danger-bg px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {initial ? 'Save changes' : 'Create trigger'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="focus-ring rounded-xl border border-rim px-5 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
