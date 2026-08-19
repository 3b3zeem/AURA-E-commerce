import { test, expect } from '@playwright/test';

test.describe('AURA E-Commerce E2E Flow', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/localhost:3000/);
  });

  test('should navigate to products page successfully', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);
  });
});
