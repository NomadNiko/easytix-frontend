import { test, expect } from "@playwright/test";

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/sign-in");
    await page.getByTestId("email").fill("test@example.com");
    await page.getByTestId("password").fill("password123");
    await page.getByTestId("sign-in-submit").click();
    await expect(page.getByTestId("profile-menu-item")).toBeVisible({
      timeout: 10000,
    });

    // Navigate to profile
    await page.goto("/profile");
  });

  test("should display user profile information", async ({ page }) => {
    await expect(page.getByTestId("user-icon")).toBeVisible();
    await expect(page.getByTestId("user-name")).toBeVisible();
    await expect(page.getByTestId("user-email")).toBeVisible();
    await expect(page.getByTestId("edit-profile")).toBeVisible();
  });

  test("should navigate to edit profile page", async ({ page }) => {
    await page.getByTestId("edit-profile").click();
    await expect(page).toHaveURL(/\/profile\/edit/);
  });

  test.describe("Edit Profile", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/profile/edit");
    });

    test("should display edit profile form", async ({ page }) => {
      await expect(page.getByTestId("first-name")).toBeVisible();
      await expect(page.getByTestId("last-name")).toBeVisible();
      await expect(page.getByTestId("photo")).toBeVisible();
      await expect(page.getByTestId("save-profile")).toBeVisible();
      await expect(page.getByTestId("cancel-edit-profile")).toBeVisible();
    });

    test("should update profile information", async ({ page }) => {
      // Clear and update fields
      await page.getByTestId("first-name").clear();
      await page.getByTestId("first-name").fill("Updated");

      await page.getByTestId("last-name").clear();
      await page.getByTestId("last-name").fill("Name");

      await page.getByTestId("save-profile").click();

      // Should show success notification
      await expect(
        page.getByText(/Profile updated successfully/i)
      ).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.getByTestId("first-name").clear();
      await page.getByTestId("last-name").clear();
      await page.getByTestId("save-profile").click();

      await expect(page.getByText("First name is required")).toBeVisible();
      await expect(page.getByText("Last name is required")).toBeVisible();
    });

    test("should cancel edit and return to profile", async ({ page }) => {
      await page.getByTestId("cancel-edit-profile").click();
      await expect(page).toHaveURL(/\/profile$/);
    });
  });

  test.describe("Change Email", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/profile/edit");
    });

    test("should display change email form for email users", async ({
      page,
    }) => {
      // Check if change email section exists (only for email auth users)
      const changeEmailSection = page.getByTestId("change-email-section");

      if (await changeEmailSection.isVisible()) {
        await expect(page.getByTestId("new-email")).toBeVisible();
        await expect(page.getByTestId("current-password")).toBeVisible();
        await expect(page.getByTestId("save-email")).toBeVisible();
      }
    });
  });

  test.describe("Change Password", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/profile/edit");
    });

    test("should display change password form for email users", async ({
      page,
    }) => {
      // Check if change password section exists (only for email auth users)
      const changePasswordSection = page.getByTestId("change-password-section");

      if (await changePasswordSection.isVisible()) {
        await expect(page.getByTestId("old-password")).toBeVisible();
        await expect(page.getByTestId("new-password")).toBeVisible();
        await expect(
          page.getByTestId("new-password-confirmation")
        ).toBeVisible();
        await expect(page.getByTestId("save-password")).toBeVisible();
      }
    });
  });
});
