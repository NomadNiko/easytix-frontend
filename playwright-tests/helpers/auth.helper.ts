import { Page } from "@playwright/test";

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.getByTestId("email").fill(email);
  await page.getByTestId("password").fill(password);
  await page.getByTestId("sign-in-submit").click();

  // Wait for successful login
  await page
    .getByTestId("profile-menu-item")
    .waitFor({ state: "visible", timeout: 10000 });
}

export async function logoutUser(page: Page) {
  await page.getByTestId("profile-menu-item").click();
  await page.getByTestId("logout-menu-item").click();

  // Wait for logout to complete
  await page.getByTestId("nav-sign-in").waitFor({ state: "visible" });
}

export async function createTestUser(
  page: Page,
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }
) {
  const defaultData = {
    firstName: "Test",
    lastName: "User",
    email: `test${Date.now()}@example.com`,
    password: "password123",
  };

  const user = { ...defaultData, ...userData };

  await page.goto("/sign-up");
  await page.getByTestId("first-name").fill(user.firstName);
  await page.getByTestId("last-name").fill(user.lastName);
  await page.getByTestId("email").fill(user.email);
  await page.getByTestId("password").fill(user.password);
  await page.getByTestId("sign-up-submit").click();

  // Wait for successful registration
  await page
    .getByTestId("profile-menu-item")
    .waitFor({ state: "visible", timeout: 10000 });

  return user;
}
