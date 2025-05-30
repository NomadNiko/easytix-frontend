import { test, expect } from "@playwright/test";

test.describe("App Navigation", () => {
  test("should display navigation for logged out users", async ({ page }) => {
    await page.goto("/");

    // Should see sign in and sign up buttons
    await expect(page.getByTestId("nav-sign-in")).toBeVisible();
    await expect(page.getByTestId("nav-sign-up")).toBeVisible();

    // Should not see profile menu
    await expect(page.getByTestId("profile-menu-item")).not.toBeVisible();
  });

  test("should navigate through public pages", async ({ page }) => {
    await page.goto("/");

    // Navigate to sign in
    await page.getByTestId("nav-sign-in").click();
    await expect(page).toHaveURL(/\/sign-in/);

    // Navigate to sign up
    await page.getByTestId("nav-sign-up").click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("should show mobile menu on small screens", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile menu burger should be visible
    await expect(page.getByTestId("mobile-menu-burger")).toBeVisible();

    // Desktop navigation should not be visible
    await expect(page.getByTestId("nav-sign-in")).not.toBeVisible();

    // Open mobile menu
    await page.getByTestId("mobile-menu-burger").click();

    // Mobile navigation should be visible
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test.describe("Logged In User Navigation", () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication by setting auth cookies/tokens
      // This would need to be implemented based on your auth setup
      await page.goto("/sign-in");
      await page.getByTestId("email").fill("test@example.com");
      await page.getByTestId("password").fill("password123");
      await page.getByTestId("sign-in-submit").click();
      await expect(page.getByTestId("profile-menu-item")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should display user profile menu", async ({ page }) => {
      await expect(page.getByTestId("profile-menu-item")).toBeVisible();

      // Click profile menu
      await page.getByTestId("profile-menu-item").click();

      // Should see menu items
      await expect(page.getByTestId("user-profile")).toBeVisible();
      await expect(page.getByTestId("user-notifications")).toBeVisible();
      await expect(page.getByTestId("logout-menu-item")).toBeVisible();
    });

    test("should navigate to profile page", async ({ page }) => {
      await page.getByTestId("profile-menu-item").click();
      await page.getByTestId("user-profile").click();
      await expect(page).toHaveURL(/\/profile/);
    });

    test("should navigate to notifications page", async ({ page }) => {
      await page.getByTestId("profile-menu-item").click();
      await page.getByTestId("user-notifications").click();
      await expect(page).toHaveURL(/\/profile\/notifications/);
    });

    test("should logout successfully", async ({ page }) => {
      await page.getByTestId("profile-menu-item").click();
      await page.getByTestId("logout-menu-item").click();

      // Should be redirected to home or sign in
      await expect(page.getByTestId("nav-sign-in")).toBeVisible();
      await expect(page.getByTestId("profile-menu-item")).not.toBeVisible();
    });

    test("should navigate to tickets page", async ({ page }) => {
      await page.getByTestId("nav-tickets").click();
      await expect(page).toHaveURL(/\/tickets/);
    });
  });
});
