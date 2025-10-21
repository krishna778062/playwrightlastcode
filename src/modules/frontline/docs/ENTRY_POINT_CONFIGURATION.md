# Frontline Configuration Architecture

## 🎯 **Entry Point Configuration**

All tenant initialization now happens at the **entry point** (Playwright config file) rather than in individual test files.

---

## 📁 **Architecture Overview**

```
playwright.frontline.config.ts (Entry Point)
├── Primary Tenant Init (Config Level)
├── Secondary Tenant Init (globalSetup)
└── Project Routing (testMatch)
```

---

## 🔧 **How It Works**

### **1. Primary Tenant (Config Level)**

```typescript
// playwright.frontline.config.ts
import { initializeFrontlineConfig } from './config/frontlineConfig';

// ✅ Initialize primary tenant at config level
initializeFrontlineConfig('primary');
const primaryConfig = getFrontlineTenantConfigFor('primary');

export default defineConfig({
  projects: [
    {
      name: 'frontline-primary',
      testMatch: /^(?!.*login-with-otp).*\.spec\.ts$/, // All tests EXCEPT OTP
      use: {
        baseURL: primaryConfig.frontendBaseUrl, // Primary tenant URL
      },
    },
  ],
});
```

### **2. Secondary Tenant (globalSetup)**

```typescript
// playwright.frontline.config.ts
export default defineConfig({
  projects: [
    {
      name: 'frontline-secondary',
      testMatch: /login-with-otp\.spec\.ts$/, // Only OTP tests
      use: {
        baseURL: secondaryConfig.frontendBaseUrl, // Secondary tenant URL
      },
      // ✅ Initialize secondary tenant via globalSetup
      globalSetup: path.join(__dirname, 'setup', 'secondaryTenantSetup.ts'),
    },
  ],
});
```

```typescript
// setup/secondaryTenantSetup.ts
export default async function globalSetup() {
  initializeFrontlineConfig('secondary');
}
```

---

## ✅ **Benefits of Entry Point Configuration**

| Aspect                     | Test File Init                  | Entry Point Init                |
| -------------------------- | ------------------------------- | ------------------------------- |
| **Separation of Concerns** | ❌ Config mixed with test logic | ✅ Config handled by framework  |
| **Maintainability**        | ❌ Easy to forget in new tests  | ✅ Automatic, can't be missed   |
| **Consistency**            | ❌ Different tests might forget | ✅ Project ensures consistency  |
| **Test File Cleanliness**  | ❌ Config imports in every file | ✅ Clean test files             |
| **Scalability**            | ❌ Hard to add new tenants      | ✅ Just add new project + setup |

---

## 📝 **Test Files (Clean)**

All test files are now **completely clean** of configuration:

```typescript
// ✅ qr-code-management.spec.ts
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';

test.describe('feature: QR Code Management', () => {
  // No configuration needed!
  // Primary tenant initialized by config file
});
```

```typescript
// ✅ qr-code-download.spec.ts
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';

test.describe('feature: QR Code Download', () => {
  // No configuration needed!
  // Primary tenant initialized by config file
});
```

```typescript
// ✅ login-with-otp.spec.ts
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';

test.describe('feature: login with otp', () => {
  // No configuration needed!
  // Secondary tenant initialized by globalSetup
});
```

---

## 🚀 **Execution Flow**

```
npm run test:module frontline
         ↓
playwright.frontline.config.ts (Entry Point)
         ↓
┌─────────────────────────────────────────┐
│ 1. Initialize primary tenant            │
│ 2. Get configs for both tenants        │
│ 3. Create projects with routing         │
└─────────────────────────────────────────┘
         ↓
┌─────────────┴─────────────┐
↓                           ↓
frontline-primary        frontline-secondary
(19 tests)               (1 test)
         ↓                           ↓
Primary Tenant Init      globalSetup runs
(Config Level)           (Secondary Init)
         ↓                           ↓
QR Code Tests           OTP Test
(Primary QA)            (Secondary QA)
```

---

## 🔄 **Adding New Tenants**

To add a third tenant (e.g., staging):

### **1. Add to Config**

```typescript
// playwright.frontline.config.ts
const stagingConfig = getFrontlineTenantConfigFor('staging');
```

### **2. Create Setup File**

```typescript
// setup/stagingTenantSetup.ts
export default async function globalSetup() {
  initializeFrontlineConfig('staging');
}
```

### **3. Add Project**

```typescript
// playwright.frontline.config.ts
projects: [
  // ... existing projects
  {
    name: 'frontline-staging',
    testMatch: /staging-.*\.spec\.ts$/,
    use: {
      baseURL: stagingConfig.frontendBaseUrl,
    },
    globalSetup: path.join(__dirname, 'setup', 'stagingTenantSetup.ts'),
  },
];
```

---

## 📊 **Current State**

| Project                 | Tests    | Tenant       | Initialization  |
| ----------------------- | -------- | ------------ | --------------- |
| **frontline-primary**   | 19 tests | Primary QA   | ✅ Config level |
| **frontline-secondary** | 1 test   | Secondary QA | ✅ globalSetup  |

---

## 🎉 **Result**

✅ **Zero manual configuration** in test files  
✅ **Entry point handles all tenant initialization**  
✅ **Automatic routing** via Playwright projects  
✅ **Clean, maintainable test files**  
✅ **Impossible to forget** tenant configuration

**Configuration is now centralized at the entry point!** 🚀
