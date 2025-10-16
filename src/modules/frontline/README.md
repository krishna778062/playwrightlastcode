# Frontline Module - Configuration Guide

## Overview

The Frontline module has been restructured to follow the **Content module pattern** with a centralized configuration system. This provides better maintainability, multi-tenant support, and cleaner code organization.

---

## Architecture

### **Configuration Structure**

```
frontline/
├── config/
│   └── frontlineConfig.ts          # Centralized configuration
├── fixtures/
│   └── frontlineFixture.ts         # Test fixtures using config
├── playwright.frontline.config.ts  # Playwright config with initialization
└── tests/
    └── ui-tests/
        └── *.spec.ts               # Test files using config
```

---

## Configuration System

### **File: `config/frontlineConfig.ts`**

The configuration follows this hierarchy:

```
Tenant -> Environment -> Config
```

**Supported Tenants:**

- `primary` - Main frontline tenant
- `secondary` - Secondary tenant (if needed)

**Supported Environments:**

- `qa` - QA environment
- `qa2` - QA2 environment (for OTP tests)
- `test` - TEST environment
- `uat` - UAT environment

---

## Configuration Interface

```typescript
export interface FrontlineTenantConfig {
  tenantName: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  appManagerEmail: string;
  appManagerPassword: string;
  endUserEmail: string;
  endUserPassword: string;
  promotionManagerEmail: string;
  promotionManagerPassword: string;
  newUxEnabled: boolean;
  orgId: string;
}
```

---

## Usage

### **1. Automatic Initialization**

The config is automatically initialized in `playwright.frontline.config.ts`:

```typescript
import { initializeFrontlineConfig, getFrontlineTenantConfigFor } from './config/frontlineConfig';

// Initialize frontline config with default 'primary' tenant
initializeFrontlineConfig('primary');

// Get config from cache for baseURL
const config = getFrontlineTenantConfigFor('primary');
```

### **2. Using Config in Fixtures**

In `fixtures/frontlineFixture.ts`:

```typescript
import { getFrontlineTenantConfigFromCache } from '../config/frontlineConfig';

export const users = {
  appManager: {
    email: getFrontlineTenantConfigFromCache().appManagerEmail || '',
    password: getFrontlineTenantConfigFromCache().appManagerPassword || '',
  },
  // ... other users
} as const;
```

### **3. Using Config in Tests**

In test files:

```typescript
import { getFrontlineTenantConfigFromCache } from '@/src/modules/frontline/config/frontlineConfig';

test.beforeAll(async ({ appManagerApiContext }) => {
  const config = getFrontlineTenantConfigFromCache();
  const userBuilder = new UserTestDataBuilder(appManagerApiContext, config.apiBaseUrl);
  // ...
});
```

---

## Environment Management

### **Setting Environment**

The environment is controlled by the `TEST_ENV` variable:

```bash
# Use QA environment (default)
npm run test:module frontline

# Use QA2 environment
TEST_ENV=qa2 npm run test:module frontline

# Use TEST environment
TEST_ENV=test npm run test:module frontline

# Use UAT environment
TEST_ENV=uat npm run test:module frontline
```

### **Environment Auto-Switching for OTP Tests**

The `test-module.sh` script has special handling for frontline module:

**Automatic behavior:**

```bash
npm run test:module frontline P1 qa
```

**What happens:**

1. All P1 tests (except OTP) → Run on **QA**
2. OTP test → Automatically run on **QA2**

This is configured in `scripts/test-module.sh` (lines 117-177).

---

## Configuration Methods

### **Initialize Config**

```typescript
initializeFrontlineConfig('primary');
```

Call this once at startup (already done in playwright config).

### **Get Config from Cache**

```typescript
const config = getFrontlineTenantConfigFromCache();
console.log(config.frontendBaseUrl);
console.log(config.apiBaseUrl);
```

Use this in fixtures and tests.

### **Get Config for Specific Tenant**

```typescript
const config = getFrontlineTenantConfigFor('primary');
```

Auto-initializes if not already initialized.

### **Clear Config Cache**

```typescript
clearFrontlineConfigCache();
```

Useful for testing or switching tenants.

### **Check if Initialized**

```typescript
if (isFrontlineConfigInitialized()) {
  // Config is ready
}
```

---

## Multi-Tenant Support

To use a different tenant:

1. **Update `playwright.frontline.config.ts`:**

```typescript
initializeFrontlineConfig('secondary'); // Change from 'primary'
```

2. **Run tests:**

```bash
npm run test:module frontline
```

The config will automatically use the `secondary` tenant configuration.

---

## Adding New Environments

To add a new environment (e.g., `prod`):

1. **Update `config/frontlineConfig.ts`:**

```typescript
export type EnvironmentKey = 'qa' | 'qa2' | 'uat' | 'test' | 'prod'; // Add 'prod'

export const config = {
  primary: {
    // ... existing configs
    prod: {
      tenantName: 'Frontline Primary PROD',
      frontendBaseUrl: 'https://frontline.prod.simpplr.xyz',
      apiBaseUrl: 'https://frontline-api.prod.simpplr.xyz',
      // ... other config
    },
  },
};
```

2. **Create env file (optional):**

```bash
# src/modules/frontline/env/prod.env
FRONTEND_BASE_URL=https://frontline.prod.simpplr.xyz
API_BASE_URL=https://frontline-api.prod.simpplr.xyz
# ... other variables
```

3. **Run tests:**

```bash
TEST_ENV=prod npm run test:module frontline
```

---

## Migration from Old System

### **Before (Old System)**

```typescript
// In fixture
export const users = {
  appManager: {
    email: process.env.APP_MANAGER_USERNAME || '',
    password: process.env.APP_MANAGER_PASSWORD || '',
  },
};

// In test
const userBuilder = new UserTestDataBuilder(apiContext, getEnvConfig().apiBaseUrl);
```

### **After (New System)**

```typescript
// In fixture
import { getFrontlineTenantConfigFromCache } from '../config/frontlineConfig';

export const users = {
  appManager: {
    email: getFrontlineTenantConfigFromCache().appManagerEmail || '',
    password: getFrontlineTenantConfigFromCache().appManagerPassword || '',
  },
} as const;

// In test
import { getFrontlineTenantConfigFromCache } from '@/src/modules/frontline/config/frontlineConfig';

const config = getFrontlineTenantConfigFromCache();
const userBuilder = new UserTestDataBuilder(apiContext, config.apiBaseUrl);
```

---

## Benefits

### **1. Centralized Configuration**

- All config in one place (`frontlineConfig.ts`)
- Easy to see all environments and their settings
- Type-safe configuration

### **2. Multi-Tenant Support**

- Switch between tenants easily
- Each tenant can have different configs per environment
- No code changes needed to switch tenants

### **3. No More .env Files Needed**

- Configuration is in code (version controlled)
- No need to maintain separate .env files
- Environment-specific configs are clear and explicit

### **4. Better Testing**

- Config cache can be cleared between tests
- Can test with different tenants in same run
- Easier to mock configurations

### **5. Type Safety**

- TypeScript interfaces ensure correct usage
- IDE autocomplete works perfectly
- Compile-time checks for config properties

---

## Debugging

### **Check Current Config**

```typescript
import {
  getFrontlineTenantConfigFromCache,
  getCurrentEnvironmentKey,
  getCurrentTenantKey,
} from '@/src/modules/frontline/config/frontlineConfig';

console.log('Current environment:', getCurrentEnvironmentKey());
console.log('Current tenant:', getCurrentTenantKey());
console.log('Config:', getFrontlineTenantConfigFromCache());
```

### **Common Issues**

**Error: "Config not initialized"**

```
Solution: Ensure initializeFrontlineConfig() is called before using config
```

**Error: "Invalid TEST_ENV value"**

```
Solution: Use one of: qa, qa2, test, uat
```

**Config showing wrong values**

```
Solution: Clear cache with clearFrontlineConfigCache() and reinitialize
```

---

## Examples

### **Example 1: Basic Test**

```typescript
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { getFrontlineTenantConfigFromCache } from '@/src/modules/frontline/config/frontlineConfig';

test('Example test', async ({ appManagerApiContext }) => {
  const config = getFrontlineTenantConfigFromCache();
  console.log(`Testing on: ${config.frontendBaseUrl}`);

  // Your test code
});
```

### **Example 2: Multi-Environment Test**

```bash
# Run on QA
TEST_ENV=qa npm run test:module frontline

# Run on QA2
TEST_ENV=qa2 npm run test:module frontline

# Run on UAT
TEST_ENV=uat npm run test:module frontline
```

### **Example 3: Switching Tenants**

```typescript
// In playwright.frontline.config.ts
initializeFrontlineConfig('secondary'); // Switch to secondary tenant

// Tests will now use secondary tenant config
```

---

## Summary

The new configuration system provides:

- ✅ Centralized config management
- ✅ Multi-tenant support
- ✅ Type-safe configuration
- ✅ Environment-specific settings
- ✅ Automatic OTP test environment switching
- ✅ No more scattered .env files
- ✅ Better maintainability
- ✅ Easier debugging

All configuration is now managed through `config/frontlineConfig.ts`, making it easy to understand, maintain, and extend.
