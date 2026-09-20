import { test, expect } from '@playwright/test';

// Regression test for a real gap found this session: only one view handled a
// failed content fetch gracefully; the rest would go blank. This checks every
// content-dependent route in a network-failure scenario, with the service
// worker's cache disabled so the failure can't be masked by a stale cache.
test.use({ serviceWorkers: 'block' });

const routes = [
  '/#/home',
  '/#/subject/math',
  '/#/topic/math/addition-subtraction',
  '/#/reading/english/reading-comprehension',
  '/#/tables/math/multiplication-tables',
];

for (const route of routes) {
  test(`${route} shows a friendly message instead of a blank screen when content fails to load`, async ({ page }) => {
    await page.route('**/js/content/**', (r) => r.abort('failed'));
    await page.goto(route);
    await page.waitForTimeout(400);

    const content = (await page.locator('#app-content').textContent()) ?? '';
    expect(content.trim().length).toBeGreaterThan(0);
    await expect(page.locator('button:has-text("Back to home")')).toBeVisible();
  });
}
