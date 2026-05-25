import { test, expect } from '@playwright/test';

test.describe('Guest Booking Flow', () => {
  test('Browse properties → view detail → book → confirm', async ({ page }) => {
    // Browse properties
    await page.goto('/properties');
    await expect(page.locator('[data-testid="property-card"]').first()).toBeVisible();

    // View property detail
    await page.locator('[data-testid="property-card"]').first().click();
    await expect(page).toHaveURL(/\/property\//);
    await expect(page.locator('[data-testid="book-now-button"]')).toBeVisible();

    // Book (mock checkout)
    await page.locator('[data-testid="book-now-button"]').click();
    await expect(page).toHaveURL(/\/checkout\//);

    // Confirm (mock confirmation)
    await page.locator('[data-testid="confirm-booking-button"]').click();
    await expect(page).toHaveURL('/confirmation');
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
  });
});
