import type { Metadata } from 'next';
import { Geist, Geist_Mono, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { SiteFooter } from '@/components/site-footer';
import { THEME_INIT_SCRIPT } from '@/components/theme-toggle';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Weather Notify',
  description: 'Smart weather alerts for the places you care about',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <head>
        {/*
          Before first paint: stamps the stored theme on the root, so a user
          who chose light does not see the page render dark and snap to light
          on every navigation.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-surface text-ink">
        <Providers>
          <div className="flex min-h-screen flex-col">
            {/* A column, so a page can fill exactly the height the footer
                leaves it — the footer carries the theme switch, and one that
                sits a scroll below every screen is not much of an offer. */}
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
