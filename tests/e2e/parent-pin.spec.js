import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/home');
  await page.evaluate(() => localStorage.clear());
});

test('setting a PIN then re-entering it correctly grants access, wrong PIN does not', async ({ page }) => {
  await page.goto('/#/parent');
  await page.fill('input[type="text"]', '4242');
  await page.click('text=Save PIN');

  await expect(page.locator('text=Per-subject summary')).toBeVisible();

  // Re-enter the parent view fresh to exercise the "already has a PIN" gate.
  await page.goto('/#/home');
  await page.goto('/#/parent');

  await page.fill('input[type="password"]', '0000');
  await page.click('text=Unlock');
  await expect(page.locator('text=That PIN is not correct')).toBeVisible();

  await page.fill('input[type="password"]', '4242');
  await page.click('text=Unlock');
  await expect(page.locator('text=Per-subject summary')).toBeVisible();
});
