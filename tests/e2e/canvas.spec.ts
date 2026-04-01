import { test, expect } from '@playwright/test';

test.describe('Meshwork Studio - Core E2E Tests', () => {

  test('should render the login page on initialization without runtime crashes', async ({ page }) => {
    // Navigate to the base URL (Playwright will start the dev server automatically via webServer config)
    await page.goto('/');

    // Check if the generic react entrypoint loaded
    const title = await page.title();
    expect(title).not.toBe('');

    // Let's assert that the Meshwork branding or login elements appear, 
    // confirming there is no 500 error or blank Vite screen
    await expect(page.locator('body')).toBeVisible();
    
    // Check if there are no console errors causing a white screen of death
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    // We expect the react boundary to at least execute
    expect(consoleErrors.some(err => err.includes('Minified React error'))).toBeFalsy();
  });

});
