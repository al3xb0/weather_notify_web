import { test, expect, type Page, type Route } from '@playwright/test';

/**
 * Captures the README images against a stubbed API, so the screenshots are
 * deterministic — same cities, same timestamps, same delivery outcomes on
 * every run — instead of depending on whatever a live database happens to
 * hold. Run with `npm run screenshots`.
 */

const API = 'http://localhost:3000';

/**
 * Both repositories embed these, and GitHub does not resolve an image across
 * repositories with a relative path — so each keeps its own copy rather than
 * one linking at the other's raw URL, which would break for anyone who forks
 * only one of them.
 */
const OUT = ['docs/screenshots', '../weather_notify/docs/screenshots'];

async function shoot(page: Page, name: string, fullPage = false) {
  for (const dir of OUT) {
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage });
  }
}

const CORS = {
  'access-control-allow-origin': 'http://127.0.0.1:3001',
  'access-control-allow-credentials': 'true',
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    headers: CORS,
    body: JSON.stringify(body),
  });

// Fixed so the "2 hours ago" style labels do not drift between runs.
const NOW = new Date('2026-08-17T14:00:00Z');
const hoursAgo = (h: number) =>
  new Date(NOW.getTime() - h * 3_600_000).toISOString();

const TRIGGERS = [
  {
    id: 't1',
    name: 'Berlin heat wave',
    city: 'Berlin',
    latitude: 52.52,
    longitude: 13.405,
    conditionLogic: 'AND',
    conditions: [
      { id: 'c1', metric: 'TEMPERATURE', operator: 'GT', threshold: 30 },
      { id: 'c2', metric: 'HUMIDITY', operator: 'GT', threshold: 60 },
    ],
    channels: ['TELEGRAM', 'EMAIL'],
    cooldownMin: 120,
    isActive: true,
    state: 'FIRED',
    lastFiredAt: hoursAgo(3),
    lastEvaluatedAt: hoursAgo(0.1),
    createdAt: hoursAgo(720),
  },
  {
    id: 't2',
    name: 'Storm warning — Hamburg',
    city: 'Hamburg',
    latitude: 53.551,
    longitude: 9.994,
    conditionLogic: 'OR',
    conditions: [
      { id: 'c3', metric: 'WIND_SPEED', operator: 'GTE', threshold: 60 },
      { id: 'c4', metric: 'SEVERE', operator: 'EQ', threshold: 0 },
    ],
    channels: ['TELEGRAM', 'EMAIL', 'WEB_PUSH'],
    cooldownMin: 60,
    isActive: true,
    state: 'ARMED',
    lastFiredAt: null,
    lastEvaluatedAt: hoursAgo(0.1),
    createdAt: hoursAgo(400),
  },
  {
    id: 't3',
    name: 'Frost — vineyard',
    city: 'Bordeaux',
    latitude: 44.838,
    longitude: -0.579,
    conditionLogic: 'AND',
    conditions: [
      { id: 'c5', metric: 'TEMPERATURE', operator: 'LT', threshold: 2 },
    ],
    channels: ['WEB_PUSH'],
    cooldownMin: 360,
    isActive: false,
    state: 'ARMED',
    lastFiredAt: hoursAgo(200),
    lastEvaluatedAt: hoursAgo(0.1),
    createdAt: hoursAgo(1200),
  },
  {
    id: 't4',
    name: 'Rain before the commute',
    city: 'Amsterdam',
    latitude: 52.374,
    longitude: 4.89,
    conditionLogic: 'AND',
    conditions: [
      { id: 'c6', metric: 'PRECIPITATION', operator: 'GTE', threshold: 1 },
    ],
    channels: ['TELEGRAM'],
    cooldownMin: 180,
    isActive: true,
    state: 'ARMED',
    lastFiredAt: hoursAgo(50),
    lastEvaluatedAt: hoursAgo(0.1),
    createdAt: hoursAgo(90),
  },
];

const NOTIFICATIONS = [
  {
    id: 'n1',
    channel: 'TELEGRAM',
    status: 'SENT',
    error: null,
    createdAt: hoursAgo(3),
    triggerId: 't1',
    payload: {
      triggerName: 'Berlin heat wave',
      city: 'Berlin',
      metric: 'TEMPERATURE',
      operator: 'GT',
      threshold: 30,
      observedValue: 33.4,
    },
  },
  {
    id: 'n2',
    channel: 'EMAIL',
    status: 'SENT',
    error: null,
    createdAt: hoursAgo(3),
    triggerId: 't1',
    payload: {
      triggerName: 'Berlin heat wave',
      city: 'Berlin',
      metric: 'TEMPERATURE',
      operator: 'GT',
      threshold: 30,
      observedValue: 33.4,
    },
  },
  {
    id: 'n3',
    channel: 'WEB_PUSH',
    status: 'FAILED',
    error: 'Subscription expired (410)',
    createdAt: hoursAgo(26),
    triggerId: 't2',
    payload: {
      triggerName: 'Storm warning — Hamburg',
      city: 'Hamburg',
      metric: 'WIND_SPEED',
      operator: 'GTE',
      threshold: 60,
      observedValue: 71.2,
    },
  },
  {
    id: 'n4',
    channel: 'TELEGRAM',
    status: 'SENT',
    error: null,
    createdAt: hoursAgo(26),
    triggerId: 't2',
    payload: {
      triggerName: 'Storm warning — Hamburg',
      city: 'Hamburg',
      metric: 'WIND_SPEED',
      operator: 'GTE',
      threshold: 60,
      observedValue: 71.2,
    },
  },
];

const FORECAST = {
  current: {
    time: '2026-08-17T14:00',
    temperature: 27.8,
    apparentTemp: 29.1,
    humidity: 54,
    windSpeed: 14.2,
    precipitation: 0,
    weatherCode: 2,
  },
  daily: [
    ['2026-08-17', 2, 29, 18, 5],
    ['2026-08-18', 61, 24, 16, 70],
    ['2026-08-19', 3, 22, 15, 35],
    ['2026-08-20', 1, 26, 17, 10],
    ['2026-08-21', 0, 31, 19, 0],
  ].map(([date, code, max, min, pop]) => ({
    date: date as string,
    weatherCode: code as number,
    tempMax: max as number,
    tempMin: min as number,
    precipitationProbability: pop as number,
  })),
};

async function stub(page: Page): Promise<void> {
  await page.clock.setFixedTime(NOW);
  await page.route(`${API}/**`, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const key = `${req.method()} ${path}`;

    if (req.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS });
      return;
    }

    switch (key) {
      case 'POST /auth/refresh':
        return json(route, { accessToken: 'demo-token' });
      case 'GET /users/me':
        return json(route, {
          id: 'u1',
          email: 'demo@weather-notify.app',
          role: 'USER',
          emailVerified: true,
          telegramLinked: true,
          telegramChatId: '123456789',
          quietHoursStart: '23:00',
          quietHoursEnd: '07:00',
          timezone: 'Europe/Berlin',
          pushSubscriptions: 2,
        });
      case 'GET /meta':
        return json(route, {
          limits: {
            maxTriggersPerUser: 10,
            maxConditionsPerTrigger: 5,
            maxPinnedCities: 12,
            testCooldownSec: 600,
            minCooldownMin: 10,
            maxCooldownMin: 1440,
            maxChannelsPerTrigger: 3,
          },
        });
      case 'GET /triggers':
        return json(route, {
          items: TRIGGERS,
          total: TRIGGERS.length,
          page: 1,
          limit: 100,
        });
      case 'GET /notifications':
        return json(route, {
          items: NOTIFICATIONS,
          total: NOTIFICATIONS.length,
          page: 1,
          limit: 20,
        });
      case 'GET /pinned-cities':
        return json(route, [
          {
            id: 'p1',
            name: 'Berlin',
            country: 'Germany',
            admin1: 'Berlin',
            latitude: 52.52,
            longitude: 13.405,
            order: 0,
          },
          {
            id: 'p2',
            name: 'Bordeaux',
            country: 'France',
            admin1: 'Nouvelle-Aquitaine',
            latitude: 44.838,
            longitude: -0.579,
            order: 1,
          },
        ]);
      case 'GET /weather':
        return json(route, FORECAST);
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

/**
 * Wait for fonts and any entrance animation before capturing. The panels use a
 * fade-up on mount, so a shorter wait catches a half-transparent heading.
 */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

test('dashboard', async ({ page }) => {
  await stub(page);
  await page.goto('/dashboard');
  await expect(page.getByText('Berlin heat wave')).toBeVisible();
  await settle(page);
  await shoot(page, 'dashboard');
});

test('trigger form', async ({ page }) => {
  await stub(page);
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /new trigger/i }).click();

  const form = page.getByRole('form', { name: 'New trigger' });
  await form.getByLabel('Name').fill('Frost warning — vineyard');
  await form.getByRole('combobox', { name: 'City' }).fill('Berl');
  await page
    .getByRole('option', { name: /Berlin/ })
    .first()
    .click();
  // Frost is a floor, not a ceiling — the default operator would read as
  // nonsense in a screenshot people take at face value.
  await form.getByLabel('Condition 1 operator').selectOption('LT');
  await form.getByLabel('Threshold').fill('2');
  // Drop focus so no control is left with a focus ring in the image.
  await form.getByRole('heading', { name: 'New trigger' }).click();
  await settle(page);
  await shoot(page, 'trigger-form');
});

test('notifications', async ({ page }) => {
  await stub(page);
  await page.goto('/notifications');
  await expect(page.getByText('Berlin heat wave').first()).toBeVisible();
  await settle(page);
  await shoot(page, 'notifications');
});

test('weather', async ({ page }) => {
  await stub(page);
  await page.goto('/weather');
  // The pinned cards alone are the least interesting state of this page —
  // selecting one expands the current conditions and the five-day forecast,
  // which is what it is actually for.
  await page.getByText('Berlin', { exact: true }).first().click();
  await expect(page.getByText(/Feels like/i).first()).toBeVisible();
  await settle(page);
  await shoot(page, 'weather');
});

test('settings', async ({ page }) => {
  await stub(page);
  await page.goto('/settings');
  await expect(page.getByText('Telegram').first()).toBeVisible();
  await settle(page);
  await shoot(page, 'settings', true);
});
