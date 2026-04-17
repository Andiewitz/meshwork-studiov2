import { test, expect } from '@playwright/test';

test.describe('Dashboard Feature Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - local dev bypass should kick in for the mock user
    await page.goto('/home');
  });

  test('should open the Create Workspace dialog and render all expected fields', async ({ page }) => {
    // Click the central NEW WORKSPACE button
    await page.click('button:has-text("NEW WORKSPACE")');

    // Dialog should appear
    await expect(page.locator('h3:has-text("Initialize Workspace")')).toBeVisible();
    
    // Check for the name input
    const input = page.locator('input[placeholder="Workspace name"]');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    // Check for character count
    await expect(page.locator('p:has-text("characters")')).toBeVisible();

    // Check for iconic selections
    await expect(page.locator('button:has-text("Layered")')).toBeVisible();
  });

  test('should allow creating a new workspace and seeing it in the list', async ({ page }) => {
    await page.click('button:has-text("NEW WORKSPACE")');
    
    const wsName = `Test Workspace ${Date.now()}`;
    await page.fill('input[placeholder="Workspace name"]', wsName);
    
    // Click 'CREATE' button
    await page.click('button:has-text("CREATE")');

    // Dialog should close and new workspace should appear in 'Recent Projects'
    await expect(page.locator(`text=${wsName}`)).toBeVisible();
  });

  test('should toggle the favorite star and update its visual state', async ({ page }) => {
    // Target the first workspace card's favorite button
    const firstCard = page.locator('section:has-text("Recent Projects") >> div.group').first();
    const starButton = firstCard.locator('button').first();

    // The star should initially not be yellow (checking for the yellow class)
    // Actually, in mock mode, it might vary, but we test the interaction
    await starButton.hover();
    await starButton.click();

    // Assert that it now has the yellow text class
    await expect(starButton).toHaveClass(/text-yellow-400/);
    
    // Clicking again should toggle off
    await starButton.click();
    await expect(starButton).not.toHaveClass(/text-yellow-400/);
  });
});
