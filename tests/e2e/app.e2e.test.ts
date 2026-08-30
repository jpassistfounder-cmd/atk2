import { test, expect } from '@playwright/test';

test.describe('ATK E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should load dashboard', async ({ page }) => {
    await expect(page.locator('text=ATK Dashboard')).toBeVisible();
  });

  test('should navigate to watchlist', async ({ page }) => {
    await page.click('text=Watchlist');
    await expect(page.locator('text=Watchlist Scanner')).toBeVisible();
  });

  test('should navigate to positions', async ({ page }) => {
    await page.click('text=Positions');
    await expect(page.locator('text=Position Manager')).toBeVisible();
  });

  test('should navigate to analytics', async ({ page }) => {
    await page.click('text=Analytics');
    await expect(page.locator('text=Portfolio Analytics')).toBeVisible();
  });

  test('should display account stats', async ({ page }) => {
    await expect(page.locator('text=Balance')).toBeVisible();
    await expect(page.locator('text=Used Margin')).toBeVisible();
    await expect(page.locator('text=Available Margin')).toBeVisible();
  });

  test('should scan markets', async ({ page }) => {
    await page.click('text=Watchlist');
    await page.click('text=Scan Markets');
    await page.waitForTimeout(2000);
    await expect(page.locator('table')).toBeVisible();
  });
});
