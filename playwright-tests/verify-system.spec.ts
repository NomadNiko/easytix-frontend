import { test } from "@playwright/test";

test("verify system defaults implementation", async ({ page }) => {
  // 1. Login with admin credentials
  await page.goto("http://localhost:3000/en/sign-in");
  await page.screenshot({
    path: "screenshots/01-login-page.png",
    fullPage: true,
  });

  await page.fill('input[name="email"]', "aloha@ixplor.app");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForURL("**/tickets", { timeout: 10000 });
  await page.screenshot({
    path: "screenshots/02-logged-in.png",
    fullPage: true,
  });

  // 2. Navigate to System Defaults page
  await page.goto("http://localhost:3000/en/admin-panel/system-defaults");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "screenshots/03-system-defaults-page.png",
    fullPage: true,
  });

  // 3. Check public ticket submission endpoint
  const response = await page.request.post(
    "http://localhost:3001/api/v1/tickets/public",
    {
      data: {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Ticket",
        description: "Testing if defaults are configured",
      },
    }
  );

  console.log("Public ticket response status:", response.status());
  const responseData = await response.json();
  console.log("Public ticket response data:", responseData);

  // 4. Navigate to submit ticket page to check if it loads
  await page.goto("http://localhost:3000/en/submit-ticket");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "screenshots/04-submit-ticket-page.png",
    fullPage: true,
  });

  // 5. Check queues page
  await page.goto("http://localhost:3000/en/admin-panel/queues");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "screenshots/05-queues-page.png",
    fullPage: true,
  });
});
