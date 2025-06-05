# EasyTix Playwright Tests

This directory contains comprehensive end-to-end tests for the EasyTix application using Playwright.

## Test Structure

```
playwright-tests/
├── auth/                 # Authentication related tests
│   ├── sign-in.spec.ts
│   ├── sign-up.spec.ts
│   └── forgot-password.spec.ts
├── navigation/          # Navigation and routing tests
│   └── app-navigation.spec.ts
├── profile/            # User profile tests
│   └── profile.spec.ts
├── tickets/            # Ticket management tests
│   └── tickets.spec.ts
├── e2e/               # End-to-end user journey tests
│   └── user-journey.spec.ts
├── helpers/           # Helper functions and utilities
│   ├── auth.helper.ts
│   └── test-data.helper.ts
└── README.md
```

## Running Tests

### Prerequisites

- Ensure the application is running locally or update the base URL in playwright.config.ts
- Install dependencies: `npm install` or `yarn install`

### Run all tests

```bash
npx playwright test
```

### Run specific test file

```bash
npx playwright test auth/sign-in.spec.ts
```

### Run tests in UI mode

```bash
npx playwright test --ui
```

### Run tests with specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug tests

```bash
npx playwright test --debug
```

## Test Coverage

### Authentication Tests

- Sign In
  - Form validation
  - Successful login
  - Failed login attempts
  - Navigation to other auth pages
- Sign Up

  - Form validation
  - Successful registration
  - Duplicate email handling
  - Navigation

- Forgot Password
  - Form validation
  - Password reset request

### Navigation Tests

- Public navigation
- Authenticated navigation
- Mobile menu functionality
- Profile menu
- Logout functionality

### Profile Tests

- View profile
- Edit profile information
- Change email (email auth users)
- Change password (email auth users)
- Form validation

### Ticket Tests

- View tickets list
- Filter tickets (status, priority, search)
- Create new ticket
- View ticket details
- Tab navigation (All, Assigned, Unassigned, Created, Open, Closed)

### End-to-End Tests

- Complete user journey from signup to ticket creation
- Password reset flow

## Test Data

Tests use faker.js to generate random test data. Helper functions are available in `helpers/test-data.helper.ts`.

## Best Practices

1. **Test IDs**: All interactive elements have `data-testid` attributes for reliable element selection
2. **Isolation**: Each test is independent and doesn't rely on other tests
3. **Cleanup**: Tests should clean up after themselves when possible
4. **Waiting**: Use Playwright's built-in waiting mechanisms instead of hard-coded timeouts
5. **Assertions**: Use meaningful assertions that test actual functionality

## Troubleshooting

### Tests failing due to authentication

- Ensure test user exists in the database
- Check that authentication endpoints are working
- Verify cookies/tokens are being set correctly

### Timeout errors

- Increase timeout in specific tests: `test.setTimeout(60000)`
- Check if the application is running and accessible
- Verify network conditions

### Element not found

- Check that test IDs are present in the code
- Use Playwright's debugging tools to inspect the page
- Ensure the page has loaded completely before interacting

## Adding New Tests

1. Create test file in appropriate directory
2. Import necessary helpers
3. Use descriptive test names
4. Add appropriate test IDs to components if missing
5. Follow existing patterns for consistency

## CI/CD Integration

These tests can be integrated into CI/CD pipelines. Example GitHub Actions configuration:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test

- uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```
