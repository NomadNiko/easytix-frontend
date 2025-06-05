import { test, expect } from "@playwright/test";

test.describe("Reports Page", () => {
  test("should load reports page and show dashboard", async ({ page }) => {
    // Navigate to login
    await page.goto("https://etdev.nomadsoft.us/en/sign-in");

    // Login as admin
    await page.fill('input[name="email"]', "aloha@ixplor.app");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Navigate to reports
    await page.goto("https://etdev.nomadsoft.us/en/reports");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for reports page elements
    await expect(page.locator("h1")).toContainText("Reports");

    // Check for tabs
    await expect(page.locator('[role="tab"]')).toHaveCount(5);

    // Check for dashboard content (first tab should be active)
    await expect(page.locator("text=Total Tickets")).toBeVisible();

    // Take screenshot for debugging
    await page.screenshot({ path: "reports-dashboard.png", fullPage: true });

    console.log("Dashboard tab loaded successfully");
  });

  test("should load trends tab", async ({ page }) => {
    // Navigate to login
    await page.goto("https://etdev.nomadsoft.us/en/sign-in");

    // Login as admin
    await page.fill('input[name="email"]', "aloha@ixplor.app");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Navigate to reports
    await page.goto("https://etdev.nomadsoft.us/en/reports");
    await page.waitForLoadState("networkidle");

    // Click trends tab
    await page.click('[role="tab"]:has-text("Trends")');

    // Wait for trends content
    await page.waitForTimeout(2000);

    // Check for trends content
    await expect(page.locator("text=Volume Trends")).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: "reports-trends.png", fullPage: true });

    console.log("Trends tab loaded successfully");
  });
});
