import type { Page, Route } from '@playwright/test';

export const API = 'http://localhost:3000';

export const PROFILE = {
  id: 'u1',
  email: 'user@example.com',
  role: 'USER',
  emailVerified: true,
  telegramLinked: false,
  telegramChatId: null,
  quietHoursStart: null,
  quietHoursEnd: null,
  timezone: null,
  pushSubscriptions: 0,
};

/** Shape of GET /meta — the limits live under `limits`, not at the root. */
export const META = {
  limits: {
    maxTriggersPerUser: 10,
    maxConditionsPerTrigger: 5,
    maxPinnedCities: 12,
    testCooldownSec: 600,
    minCooldownMin: 10,
    maxCooldownMin: 1440,
    maxChannelsPerTrigger: 3,
  },
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    // The app runs on a different origin than the API, so a stub that omits
    // these is blocked by CORS exactly as a misconfigured server would be.
    headers: {
      'access-control-allow-origin': 'http://127.0.0.1:3001',
      'access-control-allow-credentials': 'true',
    },
    body: JSON.stringify(body),
  });

export interface StubOptions {
  /** Whether the refresh cookie resolves to a session on load. */
  signedIn?: boolean;
  triggers?: unknown[];
  /** Extra handlers, keyed by `METHOD /path`, applied before the defaults. */
  routes?: Record<string, (route: Route) => void | Promise<void>>;
}

/**
 * Stand in for the API for one test. Registered before navigation so the
 * session bootstrap — which fires before the first paint — is answered rather
 * than left hanging on a connection refused.
 */
export async function stubApi(
  page: Page,
  { signedIn = true, triggers = [], routes = {} }: StubOptions = {},
): Promise<void> {
  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const key = `${request.method()} ${path}`;

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': 'http://127.0.0.1:3001',
          'access-control-allow-credentials': 'true',
          'access-control-allow-headers': 'authorization,content-type',
          'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        },
      });
      return;
    }

    const custom = routes[key];
    if (custom) {
      await custom(route);
      return;
    }

    switch (key) {
      case 'POST /auth/refresh':
        // 401 is how "no usable cookie" reaches the client, and the app has to
        // read it as anonymous rather than as an error.
        return signedIn
          ? json(route, { accessToken: 'stub-access-token' })
          : json(route, { message: 'Invalid refresh token' }, 401);
      case 'POST /auth/login':
        return json(route, { accessToken: 'stub-access-token' });
      case 'POST /auth/logout':
        return json(route, { success: true });
      case 'GET /users/me':
        return json(route, PROFILE);
      case 'GET /auth/me':
        return json(route, {
          userId: 'u1',
          email: PROFILE.email,
          role: 'USER',
        });
      case 'GET /meta':
        return json(route, META);
      case 'GET /triggers':
        // Paginated, not a bare array — the dashboard reads `.items`.
        return json(route, {
          items: triggers,
          total: triggers.length,
          page: 1,
          pageSize: 100,
        });
      case 'GET /notifications':
        return json(route, { items: [], total: 0, page: 1, pageSize: 20 });
      case 'GET /pinned-cities':
        return json(route, []);
      // City search is proxied by the API rather than called from the browser,
      // so it is stubbed here with everything else — and the CSP no longer
      // allows a third-party origin the app could fall back to.
      case 'GET /geocode':
        return json(route, [
          {
            name: 'Berlin',
            country: 'Germany',
            admin1: 'Berlin',
            latitude: 52.52,
            longitude: 13.405,
          },
        ]);
      default:
        return json(route, {}, 404);
    }
  });
}
