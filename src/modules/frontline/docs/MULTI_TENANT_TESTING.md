# Multi-Tenant Testing Guide

This document explains different approaches for running tests across multiple tenants (primary and secondary QA environments).

## 🎯 Current Implementation: Playwright Projects (Recommended)

### How It Works

We use **Playwright Projects** to automatically route different tests to different tenants:

```typescript
// playwright.frontline.config.ts
projects: [
  {
    name: 'frontline-primary',
    testMatch: /^(?!.*login-with-otp).*\.spec\.ts$/, // All tests except OTP
    use: {
      baseURL: primaryConfig.frontendBaseUrl, // frontline-automation.qa.simpplr.xyz
    },
  },
  {
    name: 'frontline-secondary',
    testMatch: /login-with-otp\.spec\.ts$/, // Only OTP tests
    use: {
      baseURL: secondaryConfig.frontendBaseUrl, // frontline.qa.simpplr.xyz
    },
  },
];
```

### Benefits

✅ **Automatic routing** - Playwright handles tenant selection based on test file name  
✅ **Clean test code** - Tests use relative URLs (`page.goto('/login')`)  
✅ **No manual URL building** - `baseURL` is set correctly per project  
✅ **Type-safe** - Full TypeScript support  
✅ **Scalable** - Easy to add more tenants/projects

### Usage

```typescript
// login-with-otp.spec.ts
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { initializeFrontlineConfig } from '@/src/modules/frontline/config/frontlineConfig';

// Initialize secondary tenant for fixtures
initializeFrontlineConfig('secondary');

test.describe('feature: login with otp', () => {
  test.beforeAll(async ({ appManagerApiContext }) => {
    const config = getFrontlineTenantConfigFor('secondary');

    // UserManagementService automatically reads ORG_ID from frontline config
    const userBuilder = new UserTestDataBuilder(appManagerApiContext, config.apiBaseUrl);
    await userBuilder.addUsersWithEmpIdAndDepartmentToSystem(Roles.END_USER, 'Simpplr@2025');
  });

  test('[FL-434] login with otp', async ({ page }) => {
    // Just use relative URL - baseURL is set to secondary tenant by project config
    await page.goto('/login'); // ✅ Goes to https://frontline.qa.simpplr.xyz/login
  });
});
```

### Running Tests

```bash
# Run all frontline tests (both projects)
npm run test:module frontline

# Run only primary tenant tests
npx playwright test --project=frontline-primary

# Run only secondary tenant tests (OTP)
npx playwright test --project=frontline-secondary

# Run specific test
npm run test:module frontline -- --grep "login with otp"
```

---

## 🔧 Alternative Approach 1: Custom Navigation Helper

If you prefer more explicit control, use the `FrontlineNavigationHelper`:

```typescript
import { FrontlineNavigationHelper } from '@frontline/fixtures/frontlineNavigationHelper';

test('[FL-434] login with otp', async ({ page }) => {
  const nav = new FrontlineNavigationHelper(page);

  // Automatically uses current tenant config
  await nav.gotoLogin(); // ✅ Goes to correct tenant's login page

  // Or use custom path
  await nav.goto('/some/path');
});
```

**Benefits:**

- ✅ Explicit tenant-aware navigation
- ✅ Readable helper methods (`gotoLogin()`, `gotoHome()`)
- ✅ Console logging for debugging

---

## 🔧 Alternative Approach 2: Manual URL Building

For maximum control, build URLs manually in tests:

```typescript
test('[FL-434] login with otp', async ({ page }) => {
  const config = getFrontlineTenantConfigFor('secondary');
  await page.goto(`${config.frontendBaseUrl}/login`);
});
```

**Benefits:**

- ✅ Very explicit
- ✅ No magic/hidden behavior

**Drawbacks:**

- ❌ Repetitive code
- ❌ Easy to forget in some places

---

## 🔧 Alternative Approach 3: Separate Fixture Files

Create dedicated fixtures for each tenant:

```typescript
// frontlineOtpFixture.ts
import { initializeFrontlineConfig } from '../config/frontlineConfig';

// Initialize at module load time
initializeFrontlineConfig('secondary');

export const frontlineOtpTestFixture = test.extend({
  appManagerApiContext: [
    async ({}, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const context = await RequestContextFactory.createAuthenticatedContext(config.apiBaseUrl, {
        email: config.appManagerEmail,
        password: config.appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],
});
```

**Usage:**

```typescript
// login-with-otp.spec.ts
import { frontlineOtpTestFixture as test } from '@frontline/fixtures/frontlineOtpFixture';

// Fixture is already configured for secondary tenant
test('[FL-434] login with otp', async ({ page, appManagerApiContext }) => {
  // Everything uses secondary tenant automatically
});
```

**Benefits:**

- ✅ Complete isolation
- ✅ No tenant switching at runtime

**Drawbacks:**

- ❌ More fixture files to maintain
- ❌ Duplication of fixture code

---

## 📋 Comparison Matrix

| Approach                | Complexity | Flexibility | Maintainability | Recommended For           |
| ----------------------- | ---------- | ----------- | --------------- | ------------------------- |
| **Playwright Projects** | Low        | High        | ⭐⭐⭐⭐⭐      | Most tests                |
| **Navigation Helper**   | Medium     | High        | ⭐⭐⭐⭐        | Complex navigation        |
| **Manual URL Building** | Low        | High        | ⭐⭐            | Quick prototypes          |
| **Separate Fixtures**   | High       | Medium      | ⭐⭐⭐          | Completely isolated tests |

---

## 🎓 Best Practices

1. **Use Playwright Projects** for tenant routing (current implementation)
2. **Initialize tenant config** at the top of test files with `initializeFrontlineConfig()`
3. **Use relative URLs** in tests (let projects handle `baseURL`)
4. **No need to manually set `process.env.ORG_ID`** - `UserManagementService` reads it automatically from frontline config
5. **Add console logs** for debugging tenant switches

---

## 🐛 Troubleshooting

### Issue: User created on wrong tenant

**Cause:** `appManagerApiContext` fixture created before tenant switch  
**Fix:** Call `initializeFrontlineConfig('secondary')` at module load time (top of test file)

### Issue: Wrong ORG_ID in activation

**Cause:** Frontline config not initialized before user creation  
**Fix:** Call `initializeFrontlineConfig('tenant')` at the top of test file - `UserManagementService` will automatically read ORG_ID from config

### Issue: Page navigates to wrong URL

**Cause:** Using relative URL with wrong `baseURL`  
**Fix:** Use Playwright Projects to set correct `baseURL` per test pattern

### Issue: ORG_ID not found error

**Cause:** Neither frontline config nor `process.env.ORG_ID` is available  
**Fix:** Ensure `initializeFrontlineConfig()` is called for frontline tests, or `.env` file is loaded for other modules

---

## 📚 Related Files

- `playwright.frontline.config.ts` - Playwright configuration with projects
- `config/frontlineConfig.ts` - Tenant configuration definitions
- `fixtures/frontlineFixture.ts` - Main fixture definitions
- `fixtures/frontlineNavigationHelper.ts` - Navigation helper class
- `env/*.env` - Environment-specific credentials and URLs

---

## 🚀 Future Enhancements

- [ ] Add support for `uat` and `test` environments
- [ ] Create `frontlineFixture.extend()` for per-test tenant switching
- [ ] Add tenant context to Playwright test info
- [ ] Create CLI tool to run specific tests on specific tenants
