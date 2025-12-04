const { test, expect } = require('@playwright/test');
const axeCore = require('axe-core');

test('signup -> login -> dashboard flow', async ({ page }) => {
  await page.goto('/signup');
  await expect(page).toHaveURL('/signup');

  const email = `pw-e2e-${Date.now()}@example.com`;
  await page.fill('input[name="fullname"]', 'Playwright E2E');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.fill('input[name="confirm_password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');

  // signup may redirect to /login or show success; ensure page navigates
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/login|dashboard/);

  // login
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');

  // expect redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 5000 });
  await expect(page).toHaveURL('/dashboard');

  // check that scanner button exists
  await expect(page.locator('#modal-start')).toBeVisible();

  // Accessibility check on dashboard — inject axe-core into the page and run
  await page.addScriptTag({ content: axeCore.source });
  const result = await page.evaluate(async () => await axe.run());
  if(result.violations && result.violations.length > 0){
    console.warn('A11Y Violations found:', result.violations);
  }
  expect(result.violations.length).toBe(0);
});
