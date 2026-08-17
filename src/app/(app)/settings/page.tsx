'use client';

import { useProfile } from '@/lib/hooks';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { SkeletonList } from '@/components/ui/skeleton';
import { TelegramSection } from '@/components/settings/telegram-section';
import { PushSection } from '@/components/settings/push-section';
import { QuietHoursSection } from '@/components/settings/quiet-hours-section';
import { DangerZoneSection } from '@/components/settings/danger-zone-section';
import { useT } from '@/i18n';

export default function SettingsPage() {
  const t = useT();
  const profile = useProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">
          {t('settings.title')}
        </h1>
        <p className="mt-0.5 text-sm text-ink-dim">{t('settings.subtitle')}</p>
      </div>

      <AsyncBoundary
        query={profile}
        skeleton={
          <SkeletonList count={3} className="h-40" label="Loading settings" />
        }
      >
        {(me) => (
          <div className="space-y-6">
            <TelegramSection profile={me} />
            <PushSection />
            <QuietHoursSection profile={me} />
            <DangerZoneSection />
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
