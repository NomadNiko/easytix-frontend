const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://etdev.nomadsoft.us';

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshots() {
  const browser = await chromium.launch();
  
  // Desktop context (1280x720)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  
  // Mobile context (375x667 - iPhone SE)
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
  });

  const desktopPage = await desktopContext.newPage();
  const mobilePage = await mobileContext.newPage();

  console.log('Starting screenshot walkthrough...');

  try {
    // 1. Landing Page
    console.log('📸 Taking landing page screenshots...');
    await desktopPage.goto(BASE_URL);
    await mobilePage.goto(BASE_URL);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/01-landing-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/01-landing-mobile.png`, fullPage: true });

    // 2. Sign Up Page
    console.log('📸 Taking sign up page screenshots...');
    await desktopPage.goto(`${BASE_URL}/sign-up`);
    await mobilePage.goto(`${BASE_URL}/sign-up`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/02-signup-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/02-signup-mobile.png`, fullPage: true });

    // 3. Sign In Page
    console.log('📸 Taking sign in page screenshots...');
    await desktopPage.goto(`${BASE_URL}/sign-in`);
    await mobilePage.goto(`${BASE_URL}/sign-in`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/03-signin-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/03-signin-mobile.png`, fullPage: true });

    // 4. Public Ticket Submission
    console.log('📸 Taking public ticket submission screenshots...');
    await desktopPage.goto(`${BASE_URL}/submit-ticket`);
    await mobilePage.goto(`${BASE_URL}/submit-ticket`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/04-public-ticket-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/04-public-ticket-mobile.png`, fullPage: true });

    // Now let's sign in as admin to show authenticated features
    console.log('📸 Signing in as admin...');
    await desktopPage.goto(`${BASE_URL}/sign-in`);
    await desktopPage.fill('input[name="email"]', 'admin@example.com');
    await desktopPage.fill('input[name="password"]', 'secret');
    await desktopPage.click('button[type="submit"]');
    await desktopPage.waitForLoadState('networkidle');
    
    await mobilePage.goto(`${BASE_URL}/sign-in`);
    await mobilePage.fill('input[name="email"]', 'admin@example.com');
    await mobilePage.fill('input[name="password"]', 'secret');
    await mobilePage.click('button[type="submit"]');
    await mobilePage.waitForLoadState('networkidle');

    // 5. Dashboard/Home (after login)
    console.log('📸 Taking dashboard screenshots...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for navigation
    await desktopPage.screenshot({ path: `${screenshotsDir}/05-dashboard-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/05-dashboard-mobile.png`, fullPage: true });

    // 6. Tickets List
    console.log('📸 Taking tickets list screenshots...');
    await desktopPage.goto(`${BASE_URL}/tickets`);
    await mobilePage.goto(`${BASE_URL}/tickets`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/06-tickets-list-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/06-tickets-list-mobile.png`, fullPage: true });

    // 7. Admin Panel - Users
    console.log('📸 Taking admin users page screenshots...');
    await desktopPage.goto(`${BASE_URL}/admin-panel/users`);
    await mobilePage.goto(`${BASE_URL}/admin-panel/users`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/07-admin-users-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/07-admin-users-mobile.png`, fullPage: true });

    // 8. Admin Panel - Queues
    console.log('📸 Taking admin queues page screenshots...');
    await desktopPage.goto(`${BASE_URL}/admin-panel/queues`);
    await mobilePage.goto(`${BASE_URL}/admin-panel/queues`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/08-admin-queues-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/08-admin-queues-mobile.png`, fullPage: true });

    // 9. Profile Page
    console.log('📸 Taking profile page screenshots...');
    await desktopPage.goto(`${BASE_URL}/profile`);
    await mobilePage.goto(`${BASE_URL}/profile`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/09-profile-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/09-profile-mobile.png`, fullPage: true });

    // 10. Notification Settings
    console.log('📸 Taking notification settings screenshots...');
    await desktopPage.goto(`${BASE_URL}/profile/notification-settings`);
    await mobilePage.goto(`${BASE_URL}/profile/notification-settings`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/10-notification-settings-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/10-notification-settings-mobile.png`, fullPage: true });

    // 11. Admin Panel - Notifications
    console.log('📸 Taking admin notifications screenshots...');
    await desktopPage.goto(`${BASE_URL}/admin-panel/notifications`);
    await mobilePage.goto(`${BASE_URL}/admin-panel/notifications`);
    await desktopPage.waitForLoadState('networkidle');
    await mobilePage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ path: `${screenshotsDir}/11-admin-notifications-desktop.png`, fullPage: true });
    await mobilePage.screenshot({ path: `${screenshotsDir}/11-admin-notifications-mobile.png`, fullPage: true });

    console.log('✅ All screenshots completed successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot function
takeScreenshots().catch(console.error);