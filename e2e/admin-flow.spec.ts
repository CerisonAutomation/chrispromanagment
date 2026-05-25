import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('Login → manage listings → view reports', async ({ page }) => {
    // Go to auth page
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Redirect to admin
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Manage Listings')).toBeVisible();

    // View reports
    await page.click('[data-testid="reports-tab"]');
    await expect(page.locator('[data-testid="report-chart"]')).toBeVisible();
  });
});
