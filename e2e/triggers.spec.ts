import { expect, test, type Locator } from '@playwright/test';
import { API, stubApi } from './support/api-stub';

/**
 * The channel inputs are `sr-only` — visually hidden so they stay focusable and
 * in the tab order, with the label carrying the visuals. A user clicks the
 * label, so the test does too, and then asserts the input actually toggled
 * rather than forcing a click through onto the hidden element.
 */
async function toggleChannel(
  form: Locator,
  label: string,
  on: boolean,
): Promise<void> {
  await form.locator('label').filter({ hasText: label }).click();
  const input = form.getByRole('checkbox', { name: label });
  await (on ? expect(input).toBeChecked() : expect(input).not.toBeChecked());
}

const TRIGGER = {
  id: 't1',
  name: 'Berlin heat wave',
  city: 'Berlin',
  latitude: 52.52,
  longitude: 13.405,
  conditionLogic: 'AND',
  conditions: [{ metric: 'TEMPERATURE', operator: 'GT', threshold: 30 }],
  channels: ['EMAIL'],
  cooldownMin: 60,
  isActive: true,
  state: 'ARMED',
  lastFiredAt: null,
  createdAt: new Date().toISOString(),
};

test.describe('triggers', () => {
  test('creates one through the form and sends the API what it typed', async ({
    page,
  }) => {
    let posted: unknown = null;
    await stubApi(page, {
      triggers: [],
      routes: {
        'POST /triggers': async (route) => {
          posted = route.request().postDataJSON();
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            headers: {
              'access-control-allow-origin': 'http://127.0.0.1:3001',
              'access-control-allow-credentials': 'true',
            },
            body: JSON.stringify(TRIGGER),
          });
        },
      },
    });

    await page.goto('/dashboard');
    await page.getByRole('button', { name: /new trigger/i }).click();

    const form = page.getByRole('form', { name: 'New trigger' });
    await form.getByLabel('Name').fill('Berlin heat wave');

    // The city field is a combobox backed by Open-Meteo's geocoder, so the
    // coordinates only reach the form by picking a suggestion — typing a name
    // is not enough, which is exactly the wiring jsdom cannot exercise.
    await form.getByRole('combobox', { name: 'City' }).fill('Berl');
    await page
      .getByRole('option', { name: /Berlin/ })
      .first()
      .click();

    await form.getByLabel('Threshold').fill('30');
    // Telegram is preselected by the form; turning it off exercises the other
    // direction and makes the assertion below about what the user chose.
    await toggleChannel(form, 'Email', true);
    await toggleChannel(form, 'Telegram', false);

    const request = page.waitForRequest(
      (r) => r.url() === `${API}/triggers` && r.method() === 'POST',
    );
    await form.getByRole('button', { name: /create trigger/i }).click();
    await request;

    expect(posted).toMatchObject({
      name: 'Berlin heat wave',
      city: 'Berlin',
      latitude: 52.52,
      longitude: 13.405,
      channels: ['EMAIL'],
      conditions: [{ metric: 'TEMPERATURE', operator: 'GT', threshold: 30 }],
    });
  });

  test('lists what the API returns', async ({ page }) => {
    await stubApi(page, { triggers: [TRIGGER] });
    await page.goto('/dashboard');

    await expect(page.getByText('Berlin heat wave')).toBeVisible();
    // Exact, because the trigger's name contains the city name too.
    await expect(page.getByText('Berlin', { exact: true })).toBeVisible();
    await expect(page.getByText(/30/)).toBeVisible();
  });

  test('shows the empty state when there are none', async ({ page }) => {
    await stubApi(page, { triggers: [] });
    await page.goto('/dashboard');

    await expect(page.getByText(/no triggers/i)).toBeVisible();
  });

  test('surfaces a rejected create instead of closing the form', async ({
    page,
  }) => {
    await stubApi(page, {
      triggers: [],
      routes: {
        'POST /triggers': (route) =>
          route.fulfill({
            status: 403,
            contentType: 'application/json',
            headers: {
              'access-control-allow-origin': 'http://127.0.0.1:3001',
              'access-control-allow-credentials': 'true',
            },
            body: JSON.stringify({ message: 'Verify your email first' }),
          }),
      },
    });

    await page.goto('/dashboard');
    await page.getByRole('button', { name: /new trigger/i }).click();

    const form = page.getByRole('form', { name: 'New trigger' });
    await form.getByLabel('Name').fill('Berlin heat wave');
    await form.getByRole('combobox', { name: 'City' }).fill('Berl');
    await page
      .getByRole('option', { name: /Berlin/ })
      .first()
      .click();
    await form.getByLabel('Threshold').fill('30');
    // Telegram is preselected by the form; turning it off exercises the other
    // direction and makes the assertion below about what the user chose.
    await toggleChannel(form, 'Email', true);
    await toggleChannel(form, 'Telegram', false);
    await form.getByRole('button', { name: /create trigger/i }).click();

    // The soft gate is server-side policy; losing the user's input on a 403
    // would make it look like the app forgot what they typed.
    await expect(page.getByText('Verify your email first')).toBeVisible();
    await expect(form.getByLabel('Name')).toHaveValue('Berlin heat wave');
  });
});
