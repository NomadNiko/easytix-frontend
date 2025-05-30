import { test, expect } from "@playwright/test";
import {
  generateUserData,
  generateTicketData,
} from "../helpers/test-data.helper";

test.describe("Complete User Journey", () => {
  let userData: ReturnType<typeof generateUserData>;

  test("should complete full user journey from signup to ticket creation", async ({
    page,
  }) => {
    userData = generateUserData();

    // 1. Sign up new user
    await page.goto("/sign-up");
    await page.getByTestId("first-name").fill(userData.firstName);
    await page.getByTestId("last-name").fill(userData.lastName);
    await page.getByTestId("email").fill(userData.email);
    await page.getByTestId("password").fill(userData.password);
    await page.getByTestId("sign-up-submit").click();

    // Should be logged in
    await expect(page.getByTestId("profile-menu-item")).toBeVisible({
      timeout: 10000,
    });

    // 2. Navigate to profile
    await page.getByTestId("profile-menu-item").click();
    await page.getByTestId("user-profile").click();

    // Verify profile data
    await expect(page.getByTestId("user-name")).toContainText(
      `${userData.firstName} ${userData.lastName}`
    );
    await expect(page.getByTestId("user-email")).toContainText(userData.email);

    // 3. Edit profile
    await page.getByTestId("edit-profile").click();
    const updatedFirstName = userData.firstName + " Updated";
    await page.getByTestId("first-name").clear();
    await page.getByTestId("first-name").fill(updatedFirstName);
    await page.getByTestId("save-profile").click();

    // Should show success
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible();

    // 4. Navigate to tickets
    await page.getByTestId("nav-tickets").click();

    // 5. Create a new ticket
    const ticketData = generateTicketData();
    await page.getByTestId("create-ticket-button").click();

    // Select queue (first available)
    await page.getByTestId("ticket-queue").click();
    await page.getByRole("option").first().click();

    // Wait for categories
    await page.waitForTimeout(500);

    // Select category (first available)
    await page.getByTestId("ticket-category").click();
    await page.getByRole("option").first().click();

    // Fill ticket details
    await page.getByTestId("ticket-title").fill(ticketData.title);
    await page.getByTestId("ticket-priority").click();
    await page.getByRole("option", { name: "Medium" }).click();
    await page.getByTestId("ticket-details").fill(ticketData.details);

    // Submit ticket
    await page.getByTestId("ticket-submit").click();

    // Should redirect to ticket details
    await expect(page).toHaveURL(/\/tickets\/[a-zA-Z0-9-]+/);

    // 6. Verify ticket details
    await expect(page.getByText(ticketData.title)).toBeVisible();
    await expect(page.getByText(ticketData.details)).toBeVisible();

    // 7. Go back to tickets list
    await page.getByTestId("nav-tickets").click();

    // 8. Find created ticket in "Created by me" tab
    await page.getByRole("tab", { name: "Created by me" }).click();
    await page.waitForTimeout(500);

    // Should see the ticket
    await expect(page.getByText(ticketData.title)).toBeVisible();

    // 9. Logout
    await page.getByTestId("profile-menu-item").click();
    await page.getByTestId("logout-menu-item").click();

    // Should be logged out
    await expect(page.getByTestId("nav-sign-in")).toBeVisible();

    // 10. Sign in again
    await page.getByTestId("nav-sign-in").click();
    await page.getByTestId("email").fill(userData.email);
    await page.getByTestId("password").fill(userData.password);
    await page.getByTestId("sign-in-submit").click();

    // Should be logged in again
    await expect(page.getByTestId("profile-menu-item")).toBeVisible();
  });

  test("should handle password reset flow", async ({ page }) => {
    // Use the user created in previous test
    await page.goto("/sign-in");

    // Go to forgot password
    await page.getByTestId("forgot-password").click();

    // Submit forgot password
    await page.getByTestId("email").fill(userData.email);
    await page.getByTestId("send-email").click();

    // Should show success
    await expect(
      page.getByText(/Password reset instructions have been sent/i)
    ).toBeVisible();

    // Note: Actual password reset would require email verification
    // which we can't test in e2e without mocking email service
  });
});
