import { expect, test } from '@playwright/test';

const email = process.env.SUPERADMIN_EMAIL;
const password = process.env.SUPERADMIN_PASSWORD;

test.describe('admin platform smoke tests', () => {
  test.skip(!email || !password, 'SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required for E2E tests.');

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill(email!);
    await page.getByLabel('Password').fill(password!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });

  test('superadmin can sign in and receives the themed dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin(\/dashboard)?/);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('link', { name: /settings/i }).first()).toBeVisible();
  });

  test('pages workspace renders real themed content', async ({ page }) => {
    await page.goto('/admin/dashboard/pages');
    await expect(page.getByRole('heading', { name: /page management/i })).toBeVisible();
    await expect(page.getByText(/content workspace/i)).toBeVisible();
  });

  test('assets workspace renders through the admin shell', async ({ page }) => {
    await page.goto('/admin/dashboard/assets');
    await expect(page.getByRole('heading', { name: /media vault/i })).toBeVisible();
    await expect(page.getByText(/system \/ assets/i)).toBeVisible();
  });

  test('theme preferences persist and remain usable on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin/settings/preferences');
    await expect(page.getByRole('heading', { name: /display mode/i })).toBeVisible();
    const darkMode = page.getByRole('button', { name: /dark dim surfaces/i });
    await darkMode.click();
    await expect(darkMode).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(/saved|success/i).first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: /dark dim surfaces/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin navigation is keyboard reachable', async ({ page }) => {
    await page.goto('/admin/dashboard');
    const firstFocusable = page.locator('a, button, input, select, textarea').first();
    await firstFocusable.focus();
    await expect(firstFocusable).toBeFocused();
  });
});
