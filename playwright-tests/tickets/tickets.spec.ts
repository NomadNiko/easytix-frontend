import { test, expect } from "@playwright/test";

test.describe("Tickets", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/sign-in");
    await page.getByTestId("email").fill("test@example.com");
    await page.getByTestId("password").fill("password123");
    await page.getByTestId("sign-in-submit").click();
    await expect(page.getByTestId("profile-menu-item")).toBeVisible({
      timeout: 10000,
    });

    // Navigate to tickets
    await page.goto("/tickets");
  });

  test("should display tickets page", async ({ page }) => {
    await expect(page.getByText("Tickets")).toBeVisible();
    await expect(page.getByTestId("create-ticket-button")).toBeVisible();

    // Should display tabs
    await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Assigned to me" })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Unassigned" })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Created by me" })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Open" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Closed" })).toBeVisible();
  });

  test("should display ticket filters", async ({ page }) => {
    await expect(page.getByTestId("ticket-filter-status")).toBeVisible();
    await expect(page.getByTestId("ticket-filter-priority")).toBeVisible();
    await expect(page.getByTestId("ticket-filter-search")).toBeVisible();
    await expect(page.getByTestId("ticket-filter-clear-all")).toBeVisible();
  });

  test("should filter tickets by status", async ({ page }) => {
    await page.getByTestId("ticket-filter-status").click();
    await page.getByRole("option", { name: "Open" }).click();

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // All visible tickets should be open
    const statusBadges = page.locator('[data-testid^="ticket-status-"]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toContainText("OPENED");
    }
  });

  test("should filter tickets by priority", async ({ page }) => {
    await page.getByTestId("ticket-filter-priority").click();
    await page.getByRole("option", { name: "High" }).click();

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // All visible tickets should be high priority
    const priorityBadges = page.locator('[data-testid^="ticket-priority-"]');
    const count = await priorityBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(priorityBadges.nth(i)).toContainText("HIGH");
    }
  });

  test("should search tickets", async ({ page }) => {
    const searchTerm = "test";
    await page.getByTestId("ticket-filter-search").fill(searchTerm);

    // Wait for debounced search
    await page.waitForTimeout(1000);

    // Check that results contain search term
    const ticketTitles = page.locator('[data-testid^="ticket-title-"]');
    const count = await ticketTitles.count();

    if (count > 0) {
      // At least one ticket title should contain the search term
      let found = false;
      for (let i = 0; i < count; i++) {
        const text = await ticketTitles.nth(i).textContent();
        if (text?.toLowerCase().includes(searchTerm.toLowerCase())) {
          found = true;
          break;
        }
      }
      expect(found).toBeTruthy();
    }
  });

  test("should clear all filters", async ({ page }) => {
    // Apply some filters
    await page.getByTestId("ticket-filter-status").click();
    await page.getByRole("option", { name: "Open" }).click();

    await page.getByTestId("ticket-filter-priority").click();
    await page.getByRole("option", { name: "High" }).click();

    await page.getByTestId("ticket-filter-search").fill("test");

    // Clear all filters
    await page.getByTestId("ticket-filter-clear-all").click();

    // All filter inputs should be cleared
    await expect(page.getByTestId("ticket-filter-status")).toHaveText("");
    await expect(page.getByTestId("ticket-filter-priority")).toHaveText("");
    await expect(page.getByTestId("ticket-filter-search")).toHaveValue("");
  });

  test("should open create ticket modal", async ({ page }) => {
    await page.getByTestId("create-ticket-button").click();

    // Modal should be visible
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Create Ticket")).toBeVisible();

    // Form fields should be visible
    await expect(page.getByTestId("ticket-queue")).toBeVisible();
    await expect(page.getByTestId("ticket-category")).toBeVisible();
    await expect(page.getByTestId("ticket-title")).toBeVisible();
    await expect(page.getByTestId("ticket-priority")).toBeVisible();
    await expect(page.getByTestId("ticket-details")).toBeVisible();
    await expect(page.getByTestId("ticket-submit")).toBeVisible();
    await expect(page.getByTestId("ticket-cancel")).toBeVisible();
  });

  test("should validate create ticket form", async ({ page }) => {
    await page.getByTestId("create-ticket-button").click();

    // Try to submit empty form
    await page.getByTestId("ticket-submit").click();

    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test("should create a new ticket", async ({ page }) => {
    await page.getByTestId("create-ticket-button").click();

    // Fill in the form
    await page.getByTestId("ticket-queue").click();
    await page.getByRole("option").first().click();

    // Wait for categories to load
    await page.waitForTimeout(500);

    await page.getByTestId("ticket-category").click();
    await page.getByRole("option").first().click();

    await page.getByTestId("ticket-title").fill("Test Ticket Title");

    await page.getByTestId("ticket-priority").click();
    await page.getByRole("option", { name: "Medium" }).click();

    await page
      .getByTestId("ticket-details")
      .fill("This is a test ticket description with some details.");

    // Submit the form
    await page.getByTestId("ticket-submit").click();

    // Should navigate to the new ticket page
    await expect(page).toHaveURL(/\/tickets\/[a-zA-Z0-9-]+/);
  });

  test("should cancel ticket creation", async ({ page }) => {
    await page.getByTestId("create-ticket-button").click();

    // Fill some fields
    await page.getByTestId("ticket-title").fill("Test Ticket");

    // Cancel
    await page.getByTestId("ticket-cancel").click();

    // Modal should close
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should view ticket details", async ({ page }) => {
    // Find first ticket in the list
    const firstTicketView = page
      .locator('[data-testid^="ticket-view-"]')
      .first();

    if (await firstTicketView.isVisible()) {
      await firstTicketView.click();

      // Should navigate to ticket details page
      await expect(page).toHaveURL(/\/tickets\/[a-zA-Z0-9-]+/);
    }
  });

  test("should switch between ticket tabs", async ({ page }) => {
    // Test each tab
    const tabs = [
      { name: "Assigned to me", testId: "assigned" },
      { name: "Unassigned", testId: "unassigned" },
      { name: "Created by me", testId: "created" },
      { name: "Open", testId: "open" },
      { name: "Closed", testId: "closed" },
    ];

    for (const tab of tabs) {
      await page.getByRole("tab", { name: tab.name }).click();

      // Tab should be selected
      await expect(page.getByRole("tab", { name: tab.name })).toHaveAttribute(
        "aria-selected",
        "true"
      );

      // Wait for content to load
      await page.waitForTimeout(500);
    }
  });
});
