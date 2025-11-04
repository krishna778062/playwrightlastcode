# Environment Decoupling & Multi-Tenant Configuration

## Overview

This document outlines two approaches for decoupling environment variables and enabling multi-tenant testing in our UI automation framework. Both approaches solve the original problems:

1. **Tight Coupling**: All modules depending on core `getEnvConfig.ts`
2. **Single Tenant Limitation**: Framework tied to one tenant per environment

## Problem Statement

### Original Issues

- **Module Autonomy**: Every module config need varies and changing core strcuture everytime was risky due to tight coupling
- **Multi-Tenant Testing**: Couldn't test different tenant configurations (e.g., feed disabled) without affecting other tests
- **Environment Management**: Complex environment variable handling across modules

### Requirements

- Module-specific configuration management
- Multi-tenant support with meaningful tenant keys
- Environment-specific configuration (qa, uat, prod)
- Clean, maintainable API
- Industry-standard patterns

## Approach 1: Singleton Pattern with Separate Config Files

### Architecture

```
src/modules/content/
├── config/
│   └── contentConfig.new.ts          # Singleton config with cache
├── playwright.content.config.ts       # Primary tenant config
└── playwright.content-feed-disabled.config.ts  # Feed-disabled tenant config
```

### Implementation

#### 1. Configuration Structure

```typescript
// contentConfig.new.ts
export const config = {
  primary: {
    qa: { tenantName: 'Primary Tenant', frontendBaseUrl: 'https://chat1.qa.simpplr.xyz', ... },
    uat: { tenantName: 'Primary Tenant', frontendBaseUrl: 'https://chat1.uat.simpplr.xyz', ... },
  },
  feedDisabled: {
    qa: { tenantName: 'Feed Disabled Tenant', frontendBaseUrl: 'https://feed-disabled.qa.simpplr.xyz', ... },
    uat: { tenantName: 'Feed Disabled Tenant', frontendBaseUrl: 'https://feed-disabled.uat.simpplr.xyz', ... },
  },
  appConfig: { staticFolderPath: '/static/content' }
};

// Singleton cache
let configCache: {
  environment: EnvironmentKey;
  currentTenant: TenantKey;
  tenantConfig: TenantConfig;
  appConfig: AppConfig;
} | null = null;
```

#### 2. Initialization

```typescript
// Initialize once per test run
export function initializeContentConfig(tenant: TenantKey): void {
  if (configCache) return; // Already initialized

  const environment = getCurrentEnvironment(); // From TEST_ENV
  const tenantConfig = config[tenant][environment];

  configCache = {
    environment,
    currentTenant: tenant,
    tenantConfig,
    appConfig: config.appConfig,
  };
}
```

#### 3. Usage

```typescript
// In playwright.content.config.ts
initializeContentConfig('primary');

// In test files
import { getContentConfig } from './config/contentConfig.new';
const config = getContentConfig(); // Returns cached config
```

#### 4. Running Tests

```bash
# Primary tenant tests
TEST_ENV=qa npm run test --config=src/modules/content/playwright.content.config.ts

# Feed-disabled tenant tests
TEST_ENV=qa npm run test --config=src/modules/content/playwright.content-feed-disabled.config.ts
```

### Pros

- ✅ **Performance**: Config loaded once, cached forever
- ✅ **Clean API**: No parameters needed in test code
- ✅ **Explicit**: Clear separation between tenants
- ✅ **Type Safety**: Full TypeScript support

### Cons

- ❌ **Multiple Files**: Separate config files per tenant
- ❌ **Global State**: Shared cache across tests
- ❌ **Complexity**: More custom code to maintain

## Approach 2: Playwright Fixture Override Pattern

### Architecture

```
src/modules/integrations/
├── config/
│   └── integration.config.ts         # Tenant configuration
├── fixtures/
│   └── integrationsFixture.ts         # Default tenant + overrides
└── playwright.integrations.config.ts  # Single config with multiple projects
```

### Implementation

#### 1. Configuration Structure

```typescript
// integration.config.ts
export function getTenantConfigByTenant(tenant: string) {
  const configs = {
    primary: { tenantName: 'Primary Tenant', frontendBaseUrl: 'https://newintegrations.qa.simpplr.xyz', ... },
    azuresso: { tenantName: 'Azure SSO Tenant', frontendBaseUrl: 'https://azuresso.qa.simpplr.xyz', ... },
    workday: { tenantName: 'Workday Tenant', frontendBaseUrl: 'https://workday.qa.simpplr.xyz', ... },
  };
  return configs[tenant];
}
```

#### 2. Fixture with Default

```typescript
// integrationsFixture.ts
export const integrationsFixture = base.extend<Options>({
  tenantConfig: [
    {
      tenantName: 'Primary Tenant', // Default fallback
      frontendBaseUrl: 'https://newintegrations.qa.simpplr.xyz',
      apiBaseUrl: 'https://newintegrations-api.qa.simpplr.xyz',
      appManagerEmail: 'neha.manhas@simpplr.com',
      appManagerPassword: 'Simp@12345',
      endUserEmail: 'priyanka.dubey@simpplr.com',
      endUserPassword: 'Pass@123',
    },
    { option: true, scope: 'worker' }, // Can be overridden
  ],
});
```

#### 3. Project-Level Override

```typescript
// playwright.integrations.config.ts
export default defineConfig<Options>({
  projects: [
    {
      name: 'integrations-primary',
      use: {
        tenantConfig: getTenantConfigByTenant('primary'), // Override fixture default
      },
    },
    {
      name: 'integrations-azure-sso',
      use: {
        tenantConfig: getTenantConfigByTenant('azuresso'), // Different tenant
      },
    },
    {
      name: 'integrations-workday',
      use: {
        tenantConfig: getTenantConfigByTenant('workday'), // Another tenant
      },
    },
  ],
});
```

#### 4. Usage

```typescript
// In test files
test('my test', async ({ homeDashboard, tenantConfig }) => {
  // tenantConfig is automatically injected with correct tenant
  await homeDashboard.navigate();
});
```

#### 5. Running Tests

```bash
# All tenants
TEST_ENV=qa npm run test --config=src/modules/integrations/playwright.integrations.config.ts

# Specific tenant
TEST_ENV=qa npm run test --config=src/modules/integrations/playwright.integrations.config.ts --project=integrations-azure-sso
```

### Pros

- ✅ **Playwright-Native**: Uses built-in fixture override mechanism
- ✅ **Single File**: One config file, multiple projects
- ✅ **No Global State**: Each project has its own config
- ✅ **Flexible**: Easy to override at any level

### Cons

- ❌ **Less Explicit**: Tenant selection happens at project level
- ❌ **Fixture Dependency**: Relies on Playwright fixture system
- ❌ **Parameter Passing**: Tests receive tenantConfig as parameter

## Comparison Matrix

| Aspect                | Singleton Pattern     | Fixture Override        |
| --------------------- | --------------------- | ----------------------- |
| **Complexity**        | High (custom logic)   | Low (Playwright native) |
| **Files**             | Multiple config files | Single config file      |
| **Global State**      | Yes (cache)           | No (per-project)        |
| **Performance**       | Excellent (cached)    | Good (per-project)      |
| **Maintainability**   | Medium                | High                    |
| **Playwright Native** | No                    | Yes                     |
| **Type Safety**       | Excellent             | Excellent               |
| **Flexibility**       | Medium                | High                    |

## Recommendation

### For New Modules: **Approach 2 (Fixture Override)**

**Rationale:**

- Uses Playwright's native capabilities
- Less custom code to maintain
- More flexible and extensible
- Industry standard for Playwright projects
- Easier for new team members to understand

### For Existing Modules: **Gradual Migration**

**Migration Strategy:**

1. **Phase 1**: Implement Approach 2 for new modules
2. **Phase 2**: Migrate existing modules one by one
3. **Phase 3**: Remove singleton pattern code

## Implementation Guidelines

### Approach 2 Implementation Steps

1. **Create Configuration Function**

   ```typescript
   export function getTenantConfigByTenant(tenant: string) {
     // Return tenant-specific config
   }
   ```

2. **Create Fixture with Default**

   ```typescript
   export const moduleFixture = base.extend<Options>({
     tenantConfig: [defaultConfig, { option: true, scope: 'worker' }],
   });
   ```

3. **Create Playwright Config**

   ```typescript
   export default defineConfig<Options>({
     projects: [
       { name: 'module-primary', use: { tenantConfig: getTenantConfigByTenant('primary') } },
       { name: 'module-tenant2', use: { tenantConfig: getTenantConfigByTenant('tenant2') } },
     ],
   });
   ```

4. **Update Tests**
   ```typescript
   test('my test', async ({ page, tenantConfig }) => {
     // Use tenantConfig automatically
   });
   ```

## Environment Management

Both approaches use `TEST_ENV` environment variable:

```bash
# QA environment
TEST_ENV=qa npm run test

# UAT environment
TEST_ENV=uat npm run test

# Production environment
TEST_ENV=prod npm run test
```

## Conclusion

The **Fixture Override Pattern (Approach 2)** is recommended for new implementations due to its simplicity, Playwright-native design, and maintainability. The Singleton Pattern (Approach 1) works well but requires more custom code and maintenance overhead.

Both approaches successfully solve the original problems of tight coupling and single-tenant limitations while providing clean, maintainable solutions for multi-tenant testing.
