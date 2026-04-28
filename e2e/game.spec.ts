import { test, expect } from '@playwright/test';

// Pin the date to 2025-01-01 (epoch day 0) → always loads the ALCOVES puzzle:
//   center: C  |  outer: A L O V E S  |  pangram: ALCOVES
const GAME_URL = '/spelling-bee/';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime('2025-01-01T00:00:00Z');
  await page.goto(GAME_URL);
});

test('page loads with 7 hex tiles', async ({ page }) => {
  await expect(page.locator('.hex-tile')).toHaveCount(7);
});

test('center tile has the center class and shows C', async ({ page }) => {
  const center = page.locator('.hex-tile.center');
  await expect(center).toHaveCount(1);
  await expect(center).toHaveText('C');
});

test('clicking a hive tile appends its letter to the answer', async ({
  page,
}) => {
  await page.locator('.hex-tile.center').click(); // C
  await expect(page.locator('#spnCandidateAnswer')).toHaveText('C');
});

test('typing a hive letter appends it to the answer', async ({ page }) => {
  await page.keyboard.type('c');
  await expect(page.locator('#spnCandidateAnswer')).toHaveText('C');
});

test('entering a valid word adds it to the found-words list and updates score and count', async ({
  page,
}) => {
  await page.keyboard.type('cave');
  await page.keyboard.press('Enter');
  await expect(page.locator('#foundWordsList')).toContainText('CAVE');
  await expect(page.locator('#spnScore')).toContainText('1');
  await expect(page.locator('#spnWordCount')).toContainText('1 /');
});

test('entering a pangram shows Pangram! toast and flashes all tiles', async ({
  page,
}) => {
  await page.keyboard.type('alcoves');
  await page.keyboard.press('Enter');

  await expect(page.locator('#message')).toContainText('Pangram!');

  const tiles = page.locator('.hex-tile');
  const count = await tiles.count();
  for (let i = 0; i < count; i++) {
    await expect(tiles.nth(i)).toHaveClass(/pangram-flash/);
  }
});

test('entering a duplicate word shows Already found! toast and word count is unchanged', async ({
  page,
}) => {
  await page.keyboard.type('cave');
  await page.keyboard.press('Enter');
  await expect(page.locator('#spnWordCount')).toContainText('1 /');

  await page.keyboard.type('cave');
  await page.keyboard.press('Enter');

  await expect(page.locator('#message')).toContainText('Already found!');
  await expect(page.locator('#spnWordCount')).toContainText('1 /');
});

test('Backspace removes the last typed letter', async ({ page }) => {
  await page.keyboard.type('ca');
  await expect(page.locator('#spnCandidateAnswer')).toHaveText('CA');

  await page.keyboard.press('Backspace');
  await expect(page.locator('#spnCandidateAnswer')).toHaveText('C');
});

test('progress is restored after a page reload', async ({ page }) => {
  await page.keyboard.type('cave');
  await page.keyboard.press('Enter');
  await expect(page.locator('#foundWordsList')).toContainText('CAVE');
  await expect(page.locator('#spnScore')).toContainText('1');

  await page.reload();

  await expect(page.locator('#foundWordsList')).toContainText('CAVE');
  await expect(page.locator('#spnScore')).toContainText('1');
});
