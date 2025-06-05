import { test, expect } from "@playwright/test";

test.describe("All Reports Tabs", () => {
  test.beforeEach(async ({ page }) => {
    // Login process
    await page.goto("https://etdev.nomadsoft.us/en/sign-in");
    await page.fill('input[name="email"]', "aloha@ixplor.app");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Navigate to reports
    await page.goto("https://etdev.nomadsoft.us/en/reports");
    await page.waitForLoadState("networkidle");
  });

  test("should load all report tabs without errors", async ({ page }) => {
    console.log("Testing Dashboard tab...");

    // Dashboard tab should be active by default
    await expect(page.locator("text=Total Tickets")).toBeVisible();
    await page.screenshot({
      path: "all-reports-dashboard.png",
      fullPage: true,
    });

    console.log("Testing Trends tab...");

    // Click Trends tab
    await page.click('[role="tab"]:has-text("Trends")');
    await page.waitForTimeout(3000);
    await expect(page.locator("text=Volume Trends")).toBeVisible();
    await page.screenshot({ path: "all-reports-trends.png", fullPage: true });

    console.log("Testing Performance tab...");

    // Click Performance tab
    await page.click('[role="tab"]:has-text("Performance")');
    await page.waitForTimeout(3000);
    await expect(page.locator("text=Top Performers")).toBeVisible();
    await page.screenshot({
      path: "all-reports-performance.png",
      fullPage: true,
    });

    console.log("Testing Queues tab...");

    // Click Queues tab
    await page.click('[role="tab"]:has-text("Queues")');
    await page.waitForTimeout(3000);
    // Should show queue performance cards - just check that queues tab loaded
    await expect(page.locator("text=Development").first()).toBeVisible();
    await page.screenshot({ path: "all-reports-queues.png", fullPage: true });

    console.log("Testing Flow tab...");

    // Click Flow tab
    await page.click('[role="tab"]:has-text("Flow")');
    await page.waitForTimeout(5000); // Flow takes longer to load
    await expect(page.locator("text=Average Time in Status")).toBeVisible();
    await page.screenshot({ path: "all-reports-flow.png", fullPage: true });

    console.log("All tabs tested successfully!");
  });
});
