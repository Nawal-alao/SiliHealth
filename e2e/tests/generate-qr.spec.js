const { test, expect } = require('@playwright/test');

test('generate QR flow — generates canvas', async ({ page }) => {
  await page.goto('/generate-qr');
  await expect(page).toHaveURL('/generate-qr');

  await page.fill('#patient-id', '1');
  await page.click('button:has-text("Générer QR Code")');

  const output = page.locator('#qr-output');
  await expect(output).toHaveClass(/active/);
  await expect(output.locator('canvas')).toBeVisible();
});
