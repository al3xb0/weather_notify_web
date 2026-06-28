'use client';

import { useEffect } from 'react';

// Catches errors thrown in the root layout itself, so it must render its own
// <html>/<body>. Tailwind classes are unavailable here (globals.css lives
// inside the broken layout), hence the inline styling.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#0b1120',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Something went wrong
        </h1>
        <p style={{ maxWidth: '28rem', color: '#94a3b8' }}>
          The app hit an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            cursor: 'pointer',
            borderRadius: '0.75rem',
            border: 'none',
            background: '#0ea5e9',
            color: '#fff',
            padding: '0.75rem 1.75rem',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
