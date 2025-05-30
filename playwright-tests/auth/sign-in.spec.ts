import { test, expect } from "@playwright/test";

test.describe("Sign In", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
  });

  test("should display sign-in form elements", async ({ page }) => {
    // Check that all form elements are present
    await expect(page.getByTestId("email")).toBeVisible();
    await expect(page.getByTestId("password")).toBeVisible();
    await expect(page.getByTestId("sign-in-submit")).toBeVisible();
    await expect(page.getByTestId("forgot-password")).toBeVisible();
    await expect(page.getByTestId("create-account")).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Click submit without filling fields
    await page.getByTestId("sign-in-submit").click();

    // Check for validation errors - wait a bit for form validation
    await page.waitForTimeout(500);

    // Check both error messages are present on the page
    const emailError = page.getByText("Email is required");
    const passwordError = page.getByText("Password is required");

    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    // Enter invalid email format that passes HTML5 validation but fails yup
    await page.getByTestId("email").fill("test@");
    await page.getByTestId("password").fill("password123");
    await page.getByTestId("sign-in-submit").click();

    // Check for email validation error
    await expect(page.getByText("Email is not valid")).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.getByTestId("forgot-password").click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("should navigate to sign up page", async ({ page }) => {
    await page.getByTestId("create-account").click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("should successfully sign in with valid credentials", async ({
    page,
  }) => {
    // Using seeded test user credentials
    const testEmail = "john.doe@example.com";
    const testPassword = "secret";

    await page.getByTestId("email").fill(testEmail);
    await page.getByTestId("password").fill(testPassword);
    await page.getByTestId("sign-in-submit").click();

    // After successful login, user should see profile menu
    await expect(page.getByTestId("profile-menu-item")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show error for incorrect credentials", async ({ page }) => {
    await page.getByTestId("email").fill("wrong@example.com");
    await page.getByTestId("password").fill("wrongpassword");
    await page.getByTestId("sign-in-submit").click();

    // Should show error message - email does not exist
    await expect(page.getByText("Email does not exist")).toBeVisible();
  });

  test("should clear validation errors when typing", async ({ page }) => {
    // Trigger validation errors
    await page.getByTestId("sign-in-submit").click();
    await expect(page.getByText("Email is required")).toBeVisible();

    // Start typing in email field
    await page.getByTestId("email").fill("test@example.com");

    // Email error should disappear
    await expect(page.getByText("Email is required")).not.toBeVisible();
  });
});
