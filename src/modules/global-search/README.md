# Global Search Module

This module contains UI automation tests for the Global Search functionality, specifically focusing on site search capabilities.

## Test Case: SEN-12408

**Scenario Outline:** To verify Search results list view for Site

### Test Coverage

The test covers the following functionality:

- Global search input and button interactions
- Search result verification (site, category, thumbnail, labels, icons)
- Copy link functionality
- Lock icon display based on site type (public/private)
- Navigation to search results and categories
- Mouse hover interactions

### Test Data

The test uses data-driven approach with the following test cases:

| SiteType | Term    | Category    |
| -------- | ------- | ----------- |
| public   | Sales   | Departments |
| private  | Finance | Departments |

### Test Steps

1. Login as "WorkplaceAdmin"
2. User search in global "Search" as data "<Term>"
3. Click on "Search" btn
4. Verifies site "<Term>" is displayed
5. Verify category "<Term>" of "<Category>" is displayed in Workplace search result page
6. Verify "<Term>" thumbnail is displayed
7. Verify "site" label of "<Term>" is displayed
8. Verify site icon of "<Term>" is displayed
9. User mouse over on "<Term>"
10. Verify copy link button of "<Term>" is displayed
11. Click on copy link button of "<Term>"
12. Verify "Copied" text is displayed for "<Term>" once user clicks on it
13. Verify lock icon is displayed for "<Term>" if site type is not public "<SiteType>"
14. User click on search results "<Term>"
15. Verify navigating to "<Term>" page
16. User navigates back to previous page
17. Click on thumbnail of "<Term>"
18. Verify navigating to "<Term>" page
19. User navigates back to previous page
20. Click on category "<Category>" of "<Term>"
21. Verify navigating to "<Category>" page

## Environment Configuration

The module supports multiple environments dynamically based on the `TEST_ENV` variable. The framework automatically loads the appropriate environment file from the `env/` directory.

### Available Environments

The following environment files are available in your project:

#### Test Environment (`env/test.env`)

```bash
FRONTEND_BASE_URL=https://zeus-delta-test-sen.test.simpplr.xyz/
API_BASE_URL=https://zeus-delta-test-sen.test.simpplr.xyz/
APP_MANAGER_USERNAME=Search_Workplace AppManager
APP_MANAGER_PASSWORD=pass@12345
ORG_ID="test-org-id"
```

#### QA Environment (`env/qa.env`)

```bash
FRONTEND_BASE_URL=https://chat1.qa.simpplr.xyz
API_BASE_URL=https://chat1-api.qa.simpplr.xyz
APP_MANAGER_USERNAME=prateek.parashar@simpplr.com
APP_MANAGER_PASSWORD=Pp@123456
ORG_ID="94dcb0ff-6443-400e-934c-40d46418c9b6"
```

#### UAT Environment (`env/uat.env`)

```bash
FRONTEND_BASE_URL=https://chat1.uat.simpplr.xyz/
API_BASE_URL=https://chat1-api.uat.simpplr.xyz
APP_MANAGER_USERNAME=prateek.parashar@simpplr.com
APP_MANAGER_PASSWORD=Pp@9791035986
ORG_ID="ca85330b-3435-4569-bba5-e5e7a7c00f57"
```

### Running Tests in Different Environments

The tests automatically detect and load the appropriate environment based on the `TEST_ENV` variable:

```bash
# Run tests in TEST environment (Zeus Delta)
TEST_ENV=test npm run test:global-search

# Run tests in QA environment
TEST_ENV=qa npm run test:global-search

# Run tests in UAT environment
TEST_ENV=uat npm run test:global-search

# Run tests with default environment (QA if TEST_ENV not set)
npm run test:global-search
```

### Environment Detection

The test automatically:

1. **Detects the current environment** from `TEST_ENV` variable
2. **Loads the appropriate env file** (e.g., `env/test.env`, `env/qa.env`, `env/uat.env`)
3. **Uses environment-specific variables** for authentication and navigation
4. **Shows debug information** about which environment is being used

## Module Structure

```
src/modules/global-search/
├── components/
│   └── globalSearchComponent.ts      # Global search UI component
├── constants/
│   └── testSuite.ts                  # Test suite constants
├── helpers/
│   └── globalSearchTestHelper.ts     # Test setup and helper methods
├── pages/
│   └── globalSearchPage.ts           # Global search page object
├── tests/
│   ├── test-data/
│   │   └── global-search.test-data.ts # Test data configuration
│   └── ui-tests/
│       └── site-search/
│           └── global-search-site.spec.ts # Main test file
├── types/
│   └── global-search.type.ts         # TypeScript interfaces
└── README.md                         # This file
```

## Usage

### Running Tests

To run the global search tests in different environments:

```bash
# Run all global search tests (defaults to QA environment if TEST_ENV not set)
npm run test:global-search

# Run tests in TEST environment (Zeus Delta)
TEST_ENV=test npm run test:global-search

# Run tests in QA environment
TEST_ENV=qa npm run test:global-search

# Run tests in UAT environment
TEST_ENV=uat npm run test:global-search

# Run specific test with tags in TEST environment
TEST_ENV=test npm run test:global-search -- --grep "@P0"

# Run with specific test suite in QA environment
TEST_ENV=qa npm run test:global-search -- --grep "@global-search"
```

### Test Tags

- `@global-search` - Global search module tests
- `@enterprise-search` - Enterprise search functionality
- `@site-search` - Site search specific tests
- `@P0` - High priority tests
- `@Zeus` - Zeus test suite
- `@EnterpriseSearch` - Enterprise search feature

## Dependencies

This module depends on:

- Core framework utilities (`@core/*`)
- Base page and component classes
- Test decorators and utilities
- Environment variables from existing env files

## Configuration

Test configuration is defined in `tests/test-data/global-search.test-data.ts`:

- Default timeout: 180 seconds
- Search terms and categories
- Site types (public/private)

Authentication is handled through environment variables from the appropriate env file:

- `FRONTEND_BASE_URL` - Base URL for the current environment
- `APP_MANAGER_USERNAME` - Admin user email for the current environment
- `APP_MANAGER_PASSWORD` - Admin user password for the current environment

## Environment-Specific Features

### Debug Information

When running tests, you'll see output like:

```
=== Environment: TEST ===
Environment variables loaded:
FRONTEND_BASE_URL: https://zeus-delta-test-sen.test.simpplr.xyz/
APP_MANAGER_USERNAME: Search_Workplace AppManager
APP_MANAGER_PASSWORD: ***
=====================================
Navigating to login page: https://zeus-delta-test-sen.test.simpplr.xyz/login
```

### Test Names

Test names include the current environment:

- `Test Global Search application for Site Search functionality - Environment: TEST`
- `Verify Search results list view for Site - public site "Sales" in category "Departments" - Environment: QA`

## Contributing

When adding new tests to this module:

1. Follow the existing structure and naming conventions
2. Use the provided helper classes and components
3. Add proper test metadata using `tagTest`
4. Include appropriate test tags for filtering
5. Update this README with any new functionality
6. Use environment variables from existing env files for authentication
7. Ensure tests work across all supported environments (test, qa, uat)
