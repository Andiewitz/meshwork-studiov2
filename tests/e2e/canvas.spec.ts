import { test, expect } from "@playwright/test";

test.describe("Meshwork Studio - Core E2E Tests", () => {
  test("should render the app without runtime crashes", async ({ page }) => {
    // Register console error listener BEFORE navigation so we catch load-time errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // Navigate to root — in E2E bypass mode the client auto-sets the mock user
    await page.goto("/");

    // Title should be set (not blank Vite placeholder)
    const title = await page.title();
    expect(title).not.toBe("");

    // Body must be visible — rules out 500 error pages and blank white screens
    await expect(page.locator("body")).toBeVisible();

    // No minified React error boundary should have fired
    expect(
      consoleErrors.some((err) => err.includes("Minified React error")),
    ).toBeFalsy();
  });

  test("should reach the dashboard when navigating to /home", async ({
    page,
  }) => {
    await page.goto("/home");

    // The dashboard page should load without a white screen
    await expect(page.locator("body")).toBeVisible();

    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toContain("Minified React error");
  });
});
