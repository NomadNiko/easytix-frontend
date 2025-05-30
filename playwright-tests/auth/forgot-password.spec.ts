import { test, expect } from "@playwright/test";

test.describe("Forgot Password", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("should display forgot password form", async ({ page }) => {
    await expect(page.getByTestId("email")).toBeVisible();
    await expect(page.getByTestId("send-email")).toBeVisible();
    await expect(page.getByText("Forgot password")).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.getByTestId("send-email").click();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    // Use an email format that passes HTML5 validation but fails yup validation
    await page.getByTestId("email").fill("test@");
    await page.getByTestId("send-email").click();
    await expect(page.getByText("Email is not valid")).toBeVisible();
  });

  test("should submit forgot password request successfully", async ({
    page,
  }) => {
    await page.getByTestId("email").fill("test@example.com");
    await page.getByTestId("send-email").click();

    // Should show success notification in Mantine notification container
    await expect(
      page
        .locator('[role="alert"]')
        .filter({ hasText: "Reset link has been sent to your email" })
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle non-existent email gracefully", async ({ page }) => {
    await page.getByTestId("email").fill("nonexistent@example.com");
    await page.getByTestId("send-email").click();

    // Should still show success to prevent email enumeration
    await expect(
      page
        .locator('[role="alert"]')
        .filter({ hasText: "Reset link has been sent to your email" })
    ).toBeVisible({ timeout: 5000 });
  });
});
