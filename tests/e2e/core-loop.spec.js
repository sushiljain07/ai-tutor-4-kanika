import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/home');
  await page.evaluate(() => localStorage.clear());
});

test('home shows the greeting and all three subjects', async ({ page }) => {
  await page.reload();
  await expect(page.locator('.tutor-line')).toContainText('Kanika');
  await expect(page.locator('.subject-tile')).toHaveCount(3);
});

test('answering correctly awards a star and persists across reload', async ({ page }) => {
  await page.goto('/#/topic/math/addition-subtraction');
  await page.click('text=Start practicing');

  // The number-line widget defaults to the question's start value, which is
  // wired to always be the correct answer's minuend — clicking the +1 button
  // the right number of times isn't needed since "Check my answer" on the
  // default value is enough only if start === answer, which it isn't here.
  // Instead, drive it via the widget's exposed step buttons deterministically:
  const numberLineValue = await page.locator('.number-line-marker').textContent();
  const prompt = await page.locator('.tutor-line').first().textContent();
  const match = prompt.match(/What is (\d+) \+ (\d+)\?/) || prompt.match(/What is (\d+) - (\d+)\?/);
  expect(match).not.toBeNull();
  const isAddition = prompt.includes('+');
  const [a, b] = [Number(match[1]), Number(match[2])];
  const correctAnswer = isAddition ? a + b : a - b;
  const current = Number(numberLineValue);
  const steps = correctAnswer - current;
  const button = steps >= 0 ? '+1' : '−1';
  for (let i = 0; i < Math.abs(steps); i++) {
    await page.click(`button[aria-label="${steps >= 0 ? 'Step forward one' : 'Step back one'}"]`);
  }
  await page.click('text=Check my answer');

  await expect(page.locator('.feedback-success')).toBeVisible();

  await page.goto('/#/home');
  await expect(page.locator('.stat-pill').first()).toContainText('1');
});
