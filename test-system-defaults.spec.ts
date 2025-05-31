import { test, expect } from '@playwright/test';

test.describe('System Defaults Configuration', () => {
  test('should fix login endpoint typo and allow access to system defaults', async ({ page }) => {
    // Test 1: Login should work with fixed URL
    await page.goto('http://localhost:3000/en/sign-in');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });
    
    // Login as admin
    await page.fill('input[name="email"]', 'aloha@ixplor.app');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect after login
    await page.waitForURL('**/en/tickets', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/02-after-login.png', fullPage: true });
    
    // Test 2: Navigate to admin panel
    await page.goto('http://localhost:3000/en/admin-panel');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/03-admin-panel.png', fullPage: true });
    
    // Test 3: Navigate to system defaults
    await page.goto('http://localhost:3000/en/admin-panel/system-defaults');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/04-system-defaults-page.png', fullPage: true });
    
    // Verify the page loaded correctly
    await expect(page.locator('h2:has-text("System Defaults Configuration")')).toBeVisible();
    
    // Test 4: Try to submit a public ticket (should fail with proper error)
    const publicTicketResponse = await page.request.post('http://localhost:3001/api/v1/tickets/public', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Ticket',
        description: 'This is a test ticket'
      }
    });
    
    const responseData = await publicTicketResponse.json();
    console.log('Public ticket response:', responseData);
    
    // Should return 404 with proper error message
    expect(publicTicketResponse.status()).toBe(404);
    expect(responseData.message).toContain('Default queue not configured');
    
    await page.screenshot({ path: 'screenshots/05-final-state.png', fullPage: true });
  });
});