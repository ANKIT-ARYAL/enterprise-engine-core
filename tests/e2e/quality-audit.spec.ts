import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const email = process.env.SUPERADMIN_EMAIL;
const password = process.env.SUPERADMIN_PASSWORD;
const pages = ['/admin/dashboard', '/admin/dashboard/pages', '/admin/dashboard/assets', '/admin/settings?tab=theme-presets'];

test.describe('WCAG, responsive, and visual audit', () => {
  test.skip(!email || !password, 'Project admin credentials are required.');

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill(email!);
    await page.getByLabel('Password').fill(password!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });

  for (const route of pages) {
    test(`axe WCAG 2.2 AA: ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
      await testInfo.attach('axe-results.json', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }

  test('responsive admin shell has no horizontal overflow', async ({ page }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport);
      await page.goto('/admin/dashboard');
      await expect(page.locator('body')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test('stable admin visual baselines at desktop and mobile', async ({ page }) => {
    await page.goto('/admin/settings?tab=theme-presets');
    await page.getByRole('button', { name: /light bright surfaces/i }).click();
    await page.getByRole('button', { name: /save changes/i }).click();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin/dashboard');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page).toHaveScreenshot('admin-dashboard-desktop.png', { fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot('admin-dashboard-mobile.png', { fullPage: true });
  });
});
