import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Sign Up", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-up");
  });

  test("should display sign-up form elements", async ({ page }) => {
    // Check that all form elements are present
    await expect(page.getByTestId("first-name")).toBeVisible();
    await expect(page.getByTestId("last-name")).toBeVisible();
    await expect(page.getByTestId("email")).toBeVisible();
    await expect(page.getByTestId("password")).toBeVisible();
    await expect(page.getByTestId("sign-up-submit")).toBeVisible();
    await expect(page.getByTestId("login")).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Click submit without filling fields
    await page.getByTestId("sign-up-submit").click();

    // Check for validation errors - wait a bit for form validation
    await page.waitForTimeout(500);

    await expect(page.getByText("First Name is required")).toBeVisible();
    await expect(page.getByText("Last Name is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.getByTestId("first-name").fill("John");
    await page.getByTestId("last-name").fill("Doe");
    await page.getByTestId("email").fill("test@");
    await page.getByTestId("password").fill("password123");
    await page.getByTestId("sign-up-submit").click();

    // Check for email validation error
    await expect(page.getByText("Email is not valid")).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.getByTestId("first-name").fill("John");
    await page.getByTestId("last-name").fill("Doe");
    await page.getByTestId("email").fill("test@example.com");
    await page.getByTestId("password").fill("123");
    await page.getByTestId("sign-up-submit").click();

    // Check for password validation error
    await expect(
      page.getByText("Password must be at least 6 characters long")
    ).toBeVisible();
  });

  test("should navigate to sign in page", async ({ page }) => {
    await page.getByTestId("login").click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should successfully create new account", async ({ page }) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 8 });

    await page.getByTestId("first-name").fill(firstName);
    await page.getByTestId("last-name").fill(lastName);
    await page.getByTestId("email").fill(email);
    await page.getByTestId("password").fill(password);
    await page.getByTestId("sign-up-submit").click();

    // After successful registration, user should be logged in
    await expect(page.getByTestId("profile-menu-item")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show error for existing email", async ({ page }) => {
    // Use a known existing email
    await page.getByTestId("first-name").fill("John");
    await page.getByTestId("last-name").fill("Doe");
    await page.getByTestId("email").fill("admin@example.com"); // Assuming this exists
    await page.getByTestId("password").fill("password123");
    await page.getByTestId("sign-up-submit").click();

    // Should show error message
    await expect(page.getByText("Email already exists")).toBeVisible();
  });
});
