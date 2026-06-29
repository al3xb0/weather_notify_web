import type { NextConfig } from 'next';

// Allow the app to reach the Core API (a different origin in production).
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
const connectSrc = ["'self'", apiUrl].filter(Boolean).join(' ');

// Pragmatic CSP: 'unsafe-inline' is required for Next's framework bootstrap
// scripts/styles without a per-request nonce. It still blocks external script
// origins, framing, and object embedding — a meaningful XSS mitigation given
// the access token is held client-side.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  `connect-src ${connectSrc}`,
  "worker-src 'self'",
  "manifest-src 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // No includeSubDomains/preload: this app runs on a subdomain and must not
  // dictate HSTS policy for the apex domain or sibling subdomains.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
