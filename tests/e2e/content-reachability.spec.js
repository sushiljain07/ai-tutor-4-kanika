import { test, expect } from '@playwright/test';

// Regression test for a real bug found this session: "Try a similar one" used
// to only ping-pong between two paired questions, so half of every topic's
// authored content was structurally unreachable. This confirms every question
// in a topic can actually be reached in one session.
test('every question in a topic is reachable over a full session', async ({ page }) => {
  await page.goto('/#/home');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/#/topic/math/division');
  await page.click('text=Start practicing');

  const seenLabels = new Set();
  for (let i = 0; i < 40; i++) {
    const label = await page.locator('.progress-label').textContent().catch(() => null);
    if (label) seenLabels.add(label.trim());

    const practiceAgain = await page.locator('button:has-text("Practice again")').count();
    if (practiceAgain > 0) break;

    // Answer with whatever the first option is; being right or wrong doesn't
    // matter for this test, only that every question gets displayed eventually.
    const options = await page.locator('.button.secondary').all();
    if (options.length > 0) {
      await options[0].click();
    } else {
      await page.fill('input[type="text"]', '0').catch(() => {});
      await page.click('text=Check my answer').catch(() => {});
    }
    await page.waitForTimeout(150);

    const nextButton = page.locator('button:has-text("Next question")');
    const againButton = page.locator('button:has-text("Try a similar one")');
    if (await nextButton.count()) await nextButton.click();
    else if (await againButton.count()) await againButton.click();
    await page.waitForTimeout(150);
  }

  await expect(page.locator('button:has-text("Practice again")')).toBeVisible();

  const questionNumbers = [...seenLabels].map((l) => l.match(/Question (\d+) of (\d+)/)).filter(Boolean);
  const total = Number(questionNumbers[0][2]);
  const seenNumbers = new Set(questionNumbers.map((m) => Number(m[1])));
  for (let n = 1; n <= total; n++) {
    expect(seenNumbers.has(n), `Question ${n} of ${total} was never shown`).toBe(true);
  }
});
