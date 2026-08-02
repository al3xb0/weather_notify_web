'use client';

import { useState } from 'react';
import { useUpdateProfile } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { SectionCard, StatusBadge } from '@/components/ui/section-card';
import { Field, inputClass } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import type { Profile } from '@/lib/types';
import { MoonIcon } from './icons';

export function QuietHoursSection({ profile }: { profile: Profile }) {
  const updateProfile = useUpdateProfile();
  const toast = useToast();
  // null drafts fall back to the saved profile value (no effect-based mirroring).
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [draftEnd, setDraftEnd] = useState<string | null>(null);

  const start = draftStart ?? profile.quietHoursStart ?? '';
  const end = draftEnd ?? profile.quietHoursEnd ?? '';
  const configured = !!(profile.quietHoursStart || profile.quietHoursEnd);

  const save = async () => {
    try {
      await updateProfile.mutateAsync({
        quietHoursStart: start || null,
        quietHoursEnd: end || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      toast.show('Quiet hours saved', 'success');
    } catch (e) {
      toast.show(apiError(e), 'error');
    }
  };

  const clear = async () => {
    setDraftStart('');
    setDraftEnd('');
    try {
      await updateProfile.mutateAsync({
        quietHoursStart: null,
        quietHoursEnd: null,
      });
      toast.show('Quiet hours disabled', 'success');
    } catch (e) {
      toast.show(apiError(e), 'error');
    }
  };

  return (
    <SectionCard
      icon={<MoonIcon />}
      title="Quiet hours"
      subtitle="Mute alerts during a daily window"
      badge={
        profile.quietHoursStart &&
        profile.quietHoursEnd && (
          <StatusBadge>
            {profile.quietHoursStart}–{profile.quietHoursEnd}
          </StatusBadge>
        )
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-dim">
          Alerts that would fire inside this window are held until it ends.
          Times use your current timezone
          {profile.timezone ? ` (${profile.timezone})` : ''}.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <Field label="From">
              {({ id }) => (
                <input
                  id={id}
                  type="time"
                  value={start}
                  onChange={(e) => setDraftStart(e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
          </div>
          <div className="w-32">
            <Field label="To">
              {({ id }) => (
                <input
                  id={id}
                  type="time"
                  value={end}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
          </div>
          <button
            onClick={save}
            disabled={updateProfile.isPending || !start || !end}
            className="focus-ring rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving…' : 'Save'}
          </button>
          {configured && (
            <button
              onClick={clear}
              disabled={updateProfile.isPending}
              className="focus-ring rounded-xl border border-rim px-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
            >
              Disable
            </button>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
