import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';

/**
 * The signed-in area is behind a session and renders nothing useful to a
 * crawler, so it is excluded from indexing here — a server component, because
 * the shell it wraps is a client one and cannot export metadata itself.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
