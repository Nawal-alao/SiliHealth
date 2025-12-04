const { test, expect } = require('@playwright/test');

test('open scanner modal (visibility)', async ({ page }) => {
  await page.goto('/dashboard');
  // clicking the start button should at least reveal the modal UI before camera access
  await page.click('#modal-start');
  const modal = page.locator('#scanner-modal');
  await expect(modal).toBeVisible();
});
