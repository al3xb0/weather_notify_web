import { expect, test } from '@playwright/test';
import { API, stubApi } from './support/api-stub';

test.describe('session', () => {
  test('signs in and lands on the dashboard', async ({ page }) => {
    await stubApi(page, { signedIn: false });
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('supersecret123');

    const login = page.waitForRequest(
      (r) => r.url() === `${API}/auth/login` && r.method() === 'POST',
    );
    await page.getByRole('button', { name: 'Sign in' }).click();
    await login;

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Triggers' })).toBeVisible();
  });

  test('a guarded route sends an anonymous visitor to sign in', async ({
    page,
  }) => {
    await stubApi(page, { signedIn: false });
    await page.goto('/dashboard');

    // The bootstrap has to finish first: `unknown` must not be mistaken for
    // signed out, so the redirect is only correct once /auth/refresh answered.
    await expect(page).toHaveURL(/\/login$/);
  });

  test('a reload keeps the session, since the token lives only in memory', async ({
    page,
  }) => {
    await stubApi(page, { signedIn: true });
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Triggers' })).toBeVisible();

    await page.reload();

    // Nothing was persisted; this only works because the refresh cookie is
    // exchanged again on load.
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Triggers' })).toBeVisible();
  });

  test('never writes the access token to storage', async ({ page }) => {
    await stubApi(page, { signedIn: true });
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Triggers' })).toBeVisible();

    // The whole point of the httpOnly refresh cookie is undone if a script can
    // read a working session out of storage.
    const leaked = await page.evaluate(() => {
      const all = [
        ...Object.entries(localStorage),
        ...Object.entries(sessionStorage),
      ];
      return all.filter(([, v]) => v.includes('stub-access-token'));
    });
    expect(leaked).toEqual([]);
  });

  test('forgot-password confirms without revealing whether the account exists', async ({
    page,
  }) => {
    await stubApi(page, {
      signedIn: false,
      routes: {
        'POST /auth/forgot-password': (route) =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: {
              'access-control-allow-origin': 'http://127.0.0.1:3001',
              'access-control-allow-credentials': 'true',
            },
            body: JSON.stringify({ accepted: true }),
          }),
      },
    });

    await page.goto('/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);

    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(
      page.getByText(/if that address has an account/i),
    ).toBeVisible();
  });
});
