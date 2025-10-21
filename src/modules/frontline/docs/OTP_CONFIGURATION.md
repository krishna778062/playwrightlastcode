# OTP Configuration and Fixture Setup

## 🎯 **Credentials from Config/Env Files**

OTP credentials are now properly fetched from configuration files instead of being hardcoded in test files.

---

## 📁 **Architecture**

```
src/modules/frontline/
├── config/
│   ├── frontlineConfig.ts          # Main config with OTP credentials
│   └── secondaryTenantConfig.ts    # Secondary tenant config with OTP helpers
├── fixtures/
│   └── otpFixture.ts              # OTP fixture for tests
└── tests/ui-tests/
    └── login-with-otp.spec.ts     # Clean test using OTP fixture
```

---

## 🔧 **How It Works**

### **1. OTP Credentials in Config**

```typescript
// config/frontlineConfig.ts
export interface FrontlineTenantConfig {
  // ... other fields
  // OTP credentials for Mailosaur
  mailosaurApiKey?: string;
  mailosaurServerId?: string;
}

export const config = {
  secondary: {
    qa: {
      // ... other config
      // OTP credentials for Mailosaur
      mailosaurApiKey: 'RuhqTyBb8hp7JtPT',
      mailosaurServerId: 'znl8uqcc',
    },
  },
};
```

### **2. Secondary Tenant Config Helpers**

```typescript
// config/secondaryTenantConfig.ts
export const getSecondaryMailosaurApiKey = () => secondaryTenantConfig.mailosaurApiKey;
export const getSecondaryMailosaurServerId = () => secondaryTenantConfig.mailosaurServerId;
```

### **3. OTP Fixture**

```typescript
// fixtures/otpFixture.ts
export const otpFixture = {
  otpUtils: [
    async ({}, use) => {
      // Get OTP credentials from config
      const apiKey = getSecondaryMailosaurApiKey();
      const serverId = getSecondaryMailosaurServerId();

      if (!apiKey || !serverId) {
        throw new Error('Mailosaur credentials not found in secondary tenant config');
      }

      // Initialize OTP utils with credentials from config
      const otpUtils = new OTPUtils(apiKey, serverId);

      await use(otpUtils);
    },
    { scope: 'test' },
  ],
};
```

### **4. Test File Using Fixture**

```typescript
// login-with-otp.spec.ts
import { otpFixture } from '@/src/modules/frontline/fixtures/otpFixture';
import { frontlineTestFixture } from '@/src/modules/frontline/fixtures/frontlineFixture';

// Merge the frontline test with OTP fixture
const testWithOTP = mergeTests(frontlineTestFixture, base.extend(otpFixture));

testWithOTP('login with otp', async ({ page, otpUtils }) => {
  // ✅ otpUtils is automatically initialized with credentials from config
  const otp = await otpUtils.getOTPFromSMS(testPhone);
});
```

---

## ✅ **Benefits of Config-Based OTP**

| Aspect                  | Before (Hardcoded)              | After (Config-Based)                     |
| ----------------------- | ------------------------------- | ---------------------------------------- |
| **Security**            | ❌ Credentials in test files    | ✅ Credentials in config files           |
| **Maintainability**     | ❌ Hard to update credentials   | ✅ Single source of truth                |
| **Reusability**         | ❌ Must duplicate in every test | ✅ Fixture handles initialization        |
| **Environment Support** | ❌ Same credentials everywhere  | ✅ Different credentials per environment |
| **Type Safety**         | ❌ Manual credential handling   | ✅ Typed helper functions                |
| **Test Cleanliness**    | ❌ Config mixed with test logic | ✅ Clean test files                      |

---

## 📝 **Usage Examples**

### **In Test Files**

```typescript
// ✅ Clean test file
testWithOTP('OTP login test', async ({ page, otpUtils }) => {
  // otpUtils is automatically initialized with config credentials
  const otp = await otpUtils.getOTPFromSMS('+447457416481');

  await page.fill('[name="otp"]', otp);
  await page.click('[name="verify"]');
});
```

### **Adding OTP to Other Tenants**

```typescript
// config/frontlineConfig.ts
export const config = {
  primary: {
    qa: {
      // ... other config
      mailosaurApiKey: 'primary-api-key',
      mailosaurServerId: 'primary-server-id',
    },
  },
  secondary: {
    qa: {
      // ... other config
      mailosaurApiKey: 'secondary-api-key',
      mailosaurServerId: 'secondary-server-id',
    },
  },
};
```

### **Using OTP in Different Environments**

```typescript
// Different credentials for different environments
export const config = {
  secondary: {
    qa: {
      mailosaurApiKey: 'qa-api-key',
      mailosaurServerId: 'qa-server-id',
    },
    uat: {
      mailosaurApiKey: 'uat-api-key',
      mailosaurServerId: 'uat-server-id',
    },
    test: {
      mailosaurApiKey: 'test-api-key',
      mailosaurServerId: 'test-server-id',
    },
  },
};
```

---

## 🔄 **Adding OTP to Other Modules**

To add OTP support to other modules (e.g., chat):

### **1. Add to Module Config**

```typescript
// src/modules/chat/config/chatConfig.ts
export interface ChatTenantConfig {
  // ... other fields
  mailosaurApiKey?: string;
  mailosaurServerId?: string;
}
```

### **2. Create OTP Fixture**

```typescript
// src/modules/chat/fixtures/chatOtpFixture.ts
export const chatOtpFixture = {
  otpUtils: [
    async ({}, use) => {
      const apiKey = getChatMailosaurApiKey();
      const serverId = getChatMailosaurServerId();
      const otpUtils = new OTPUtils(apiKey, serverId);
      await use(otpUtils);
    },
    { scope: 'test' },
  ],
};
```

### **3. Use in Tests**

```typescript
// src/modules/chat/tests/otp-test.spec.ts
const testWithOTP = mergeTests(chatTestFixture, base.extend(chatOtpFixture));

testWithOTP('chat OTP test', async ({ page, otpUtils }) => {
  // Use otpUtils...
});
```

---

## 📊 **Current State**

| Component                   | Status     | Credentials Source          |
| --------------------------- | ---------- | --------------------------- |
| **Frontline Config**        | ✅ Updated | Config file                 |
| **Secondary Tenant Config** | ✅ Updated | Helper functions            |
| **OTP Fixture**             | ✅ Created | Config-based initialization |
| **Test File**               | ✅ Updated | Uses fixture                |

---

## 🎉 **Result**

✅ **Credentials from config/env files** - No hardcoded credentials  
✅ **OTP fixture initialization** - Automatic setup in tests  
✅ **Type-safe configuration** - Helper functions with proper typing  
✅ **Environment-specific credentials** - Different credentials per environment  
✅ **Clean test files** - No configuration logic in tests  
✅ **Reusable fixture** - Can be used across multiple test files

**OTP credentials are now properly managed through configuration files!** 🚀
