# Global Search Module - Usage Examples

This document shows how to use the Global Search module with your existing environment files.

## Your Environment Files

You have the following environment files set up:

```
env/
├── test.env    # Zeus Delta test environment
├── qa.env      # QA environment
├── uat.env     # UAT environment
└── zeus.env    # Additional Zeus environment (optional)
```

## Running Tests in Different Environments

### 1. Test Environment (Zeus Delta)

```bash
# This will load env/test.env and use:
# - URL: https://zeus-delta-test-sen.test.simpplr.xyz/
# - Username: Search_Workplace AppManager
# - Password: pass@12345

TEST_ENV=test npm run test:global-search
```

**Expected Output:**

```
=== Environment: TEST ===
Environment variables loaded:
FRONTEND_BASE_URL: https://zeus-delta-test-sen.test.simpplr.xyz/
APP_MANAGER_USERNAME: Search_Workplace AppManager
APP_MANAGER_PASSWORD: ***
=====================================
Navigating to login page: https://zeus-delta-test-sen.test.simpplr.xyz/login
```

### 2. QA Environment

```bash
# This will load env/qa.env and use:
# - URL: https://chat1.qa.simpplr.xyz
# - Username: prateek.parashar@simpplr.com
# - Password: Pp@123456

TEST_ENV=qa npm run test:global-search
```

**Expected Output:**

```
=== Environment: QA ===
Environment variables loaded:
FRONTEND_BASE_URL: https://chat1.qa.simpplr.xyz
APP_MANAGER_USERNAME: prateek.parashar@simpplr.com
APP_MANAGER_PASSWORD: ***
=====================================
Navigating to login page: https://chat1.qa.simpplr.xyz/login
```

### 3. UAT Environment

```bash
# This will load env/uat.env and use:
# - URL: https://chat1.uat.simpplr.xyz/
# - Username: prateek.parashar@simpplr.com
# - Password: Pp@9791035986

TEST_ENV=uat npm run test:global-search
```

**Expected Output:**

```
=== Environment: UAT ===
Environment variables loaded:
FRONTEND_BASE_URL: https://chat1.uat.simpplr.xyz/
APP_MANAGER_USERNAME: prateek.parashar@simpplr.com
APP_MANAGER_PASSWORD: ***
=====================================
Navigating to login page: https://chat1.uat.simpplr.xyz/login
```

### 4. Default Environment (QA)

```bash
# If no TEST_ENV is set, it defaults to QA environment
npm run test:global-search
```

## Test Names with Environment

The test names will show which environment is being used:

- **TEST Environment:** `Test Global Search application for Site Search functionality - Environment: TEST`
- **QA Environment:** `Test Global Search application for Site Search functionality - Environment: QA`
- **UAT Environment:** `Test Global Search application for Site Search functionality - Environment: UAT`

## Advanced Usage Examples

### Run Specific Tests in Different Environments

```bash
# Run only P0 tests in TEST environment
TEST_ENV=test npm run test:global-search -- --grep "@P0"

# Run only global search tests in QA environment
TEST_ENV=qa npm run test:global-search -- --grep "@global-search"

# Run specific test case in UAT environment
TEST_ENV=uat npm run test:global-search -- --grep "SEN-12408"
```

### Run with Different Browsers

```bash
# Run in TEST environment with Chrome
TEST_ENV=test npm run test:global-search -- --project=chromium

# Run in QA environment with Firefox
TEST_ENV=qa npm run test:global-search -- --project=firefox

# Run in UAT environment with Safari
TEST_ENV=uat npm run test:global-search -- --project=webkit
```

### Run with Parallel Execution

```bash
# Run in TEST environment with 3 workers
TEST_ENV=test npm run test:global-search -- --workers=3

# Run in QA environment with 2 workers
TEST_ENV=qa npm run test:global-search -- --workers=2
```

## Environment File Structure

Each environment file contains the same variables but with environment-specific values:

### test.env (Zeus Delta)

```bash
FRONTEND_BASE_URL=https://zeus-delta-test-sen.test.simpplr.xyz/
API_BASE_URL=https://zeus-delta-test-sen.test.simpplr.xyz/
APP_MANAGER_USERNAME=Search_Workplace AppManager
APP_MANAGER_PASSWORD=pass@12345
ORG_ID="test-org-id"
```

### qa.env

```bash
FRONTEND_BASE_URL=https://chat1.qa.simpplr.xyz
API_BASE_URL=https://chat1-api.qa.simpplr.xyz
APP_MANAGER_USERNAME=prateek.parashar@simpplr.com
APP_MANAGER_PASSWORD=Pp@123456
ORG_ID="94dcb0ff-6443-400e-934c-40d46418c9b6"
```

### uat.env

```bash
FRONTEND_BASE_URL=https://chat1.uat.simpplr.xyz/
API_BASE_URL=https://chat1-api.uat.simpplr.xyz
APP_MANAGER_USERNAME=prateek.parashar@simpplr.com
APP_MANAGER_PASSWORD=Pp@9791035986
ORG_ID="ca85330b-3435-4569-bba5-e5e7a7c00f57"
```

## How It Works

1. **Environment Detection:** The test reads `process.env.TEST_ENV`
2. **File Loading:** Loads the corresponding `env/{environment}.env` file
3. **Variable Injection:** Injects environment variables into `process.env`
4. **Test Execution:** Uses the loaded variables for authentication and navigation
5. **Debug Output:** Shows which environment and variables are being used

## Benefits

- ✅ **No code changes needed** to switch environments
- ✅ **Uses your existing env files** without modification
- ✅ **Clear visibility** of which environment is being used
- ✅ **Consistent behavior** across all environments
- ✅ **Easy to add new environments** (just create new env file)
