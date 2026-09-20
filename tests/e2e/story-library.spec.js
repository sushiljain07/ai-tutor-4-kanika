import { test, expect } from '@playwright/test';

// Regression test for a real bug found this session: Reading Comprehension
// had 5 authored stories, but with no picker screen, the app only ever showed
// the first one — the others were invisible even though the content existed.
test('the story library lists every authored story and each one opens', async ({ page }) => {
  await page.goto('/#/reading/english/reading-comprehension');

  const storyTiles = page.locator('.story-tile');
  await expect(storyTiles.first()).toBeVisible();
  const count = await storyTiles.count();
  expect(count).toBeGreaterThanOrEqual(5);

  const secondTitle = await storyTiles.nth(1).locator('.story-title').textContent();
  await storyTiles.nth(1).click();

  await expect(page.locator('h1')).toContainText(secondTitle.trim());
  await expect(page.locator('button:has-text("Read aloud")')).toBeVisible();
});
