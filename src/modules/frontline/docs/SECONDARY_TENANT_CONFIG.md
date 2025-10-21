# Secondary Tenant Configuration

## 🎯 **Separate Config File Approach**

Instead of initializing secondary tenant configuration in spec files, we now use a dedicated configuration file that handles all secondary tenant setup.

---

## 📁 **Architecture**

```
src/modules/frontline/config/
├── frontlineConfig.ts          # Main config with all tenants
└── secondaryTenantConfig.ts     # Dedicated secondary tenant config
```

---

## 🔧 **How It Works**

### **1. Secondary Tenant Config File**

```typescript
// config/secondaryTenantConfig.ts
import { initializeFrontlineConfig, getFrontlineTenantConfigFor } from '../config/frontlineConfig';

// ✅ Initialize secondary tenant configuration
initializeFrontlineConfig('secondary');

// ✅ Export the secondary tenant config for use in tests
export const secondaryTenantConfig = getFrontlineTenantConfigFor('secondary');

// ✅ Export helper functions for secondary tenant tests
export const getSecondaryConfig = () => secondaryTenantConfig;
export const getSecondaryTenantName = () => secondaryTenantConfig.tenantName;
export const getSecondaryFrontendUrl = () => secondaryTenantConfig.frontendBaseUrl;
export const getSecondaryApiUrl = () => secondaryTenantConfig.apiBaseUrl;
export const getSecondaryOrgId = () => secondaryTenantConfig.orgId;
```

### **2. Playwright Config Uses Config File**

```typescript
// playwright.frontline.config.ts
import { secondaryTenantConfig } from './config/secondaryTenantConfig';

export default defineConfig({
  projects: [
    {
      name: 'frontline-secondary',
      testMatch: /login-with-otp\.spec\.ts$/,
      use: {
        baseURL: secondaryTenantConfig.frontendBaseUrl, // ✅ From config file
      },
    },
  ],
});
```

### **3. Test Files Import Config**

```typescript
// login-with-otp.spec.ts
import { getSecondaryConfig } from '@/src/modules/frontline/config/secondaryTenantConfig';

test.beforeAll(async ({ appManagerApiContext }) => {
  // ✅ Get secondary tenant config from dedicated config file
  const config = getSecondaryConfig();
  console.log(`🔧 Running OTP test on: ${config.tenantName}`);

  // Use config for API calls, etc.
});
```

---

## ✅ **Benefits of Separate Config File**

| Aspect                     | Spec File Init                    | Separate Config File                 |
| -------------------------- | --------------------------------- | ------------------------------------ |
| **Separation of Concerns** | ❌ Config mixed with test logic   | ✅ Config isolated in dedicated file |
| **Reusability**            | ❌ Must import in every test file | ✅ Import once, use everywhere       |
| **Maintainability**        | ❌ Config scattered across files  | ✅ Single source of truth            |
| **Test File Cleanliness**  | ❌ Config imports and calls       | ✅ Clean test files                  |
| **Type Safety**            | ❌ Manual config access           | ✅ Typed helper functions            |
| **Documentation**          | ❌ Config logic hidden            | ✅ Self-documenting config file      |

---

## 📝 **Usage Examples**

### **In Test Files**

```typescript
// ✅ Clean test file
import { getSecondaryConfig } from '@frontline/config/secondaryTenantConfig';

test('OTP login test', async ({ page }) => {
  const config = getSecondaryConfig();

  // Use config values
  await page.goto(config.frontendBaseUrl + '/login');
  // ... test logic
});
```

### **In Playwright Config**

```typescript
// ✅ Playwright config uses config file
import { secondaryTenantConfig } from './config/secondaryTenantConfig';

export default defineConfig({
  projects: [
    {
      name: 'frontline-secondary',
      use: {
        baseURL: secondaryTenantConfig.frontendBaseUrl,
      },
    },
  ],
});
```

### **In Other Services**

```typescript
// ✅ Services can import config
import { getSecondaryOrgId } from '@frontline/config/secondaryTenantConfig';

class UserManagementService {
  private getOrgId(): string {
    return getSecondaryOrgId(); // ✅ Clean helper function
  }
}
```

---

## 🔄 **Adding More Tenant Config Files**

To add a third tenant (e.g., staging):

### **1. Create Config File**

```typescript
// config/stagingTenantConfig.ts
import { initializeFrontlineConfig, getFrontlineTenantConfigFor } from '../config/frontlineConfig';

initializeFrontlineConfig('staging');
export const stagingTenantConfig = getFrontlineTenantConfigFor('staging');
export const getStagingConfig = () => stagingTenantConfig;
```

### **2. Update Playwright Config**

```typescript
// playwright.frontline.config.ts
import { stagingTenantConfig } from './config/stagingTenantConfig';

projects: [
  {
    name: 'frontline-staging',
    testMatch: /staging-.*\.spec\.ts$/,
    use: {
      baseURL: stagingTenantConfig.frontendBaseUrl,
    },
  },
];
```

### **3. Use in Test Files**

```typescript
// staging-tests.spec.ts
import { getStagingConfig } from '@frontline/config/stagingTenantConfig';

test('staging test', async () => {
  const config = getStagingConfig();
  // Use config...
});
```

---

## 📊 **Current State**

| Config File                  | Purpose                           | Used By                      |
| ---------------------------- | --------------------------------- | ---------------------------- |
| **frontlineConfig.ts**       | Main config with all tenants      | Primary tenant, base config  |
| **secondaryTenantConfig.ts** | Secondary tenant dedicated config | OTP tests, secondary project |

---

## 🎉 **Result**

✅ **Clean separation** - Config files handle configuration, test files handle testing  
✅ **Reusable configuration** - Import once, use everywhere  
✅ **Type-safe helpers** - Dedicated functions for each config value  
✅ **Maintainable** - Single source of truth for each tenant  
✅ **Scalable** - Easy to add new tenant config files

**Configuration is now properly separated from test logic!** 🚀
