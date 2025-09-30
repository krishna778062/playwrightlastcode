# Central Framework Migration Guide

This document provides a comprehensive guide and prompt for migrating test files from the old Rewards project to the central UI automation framework.

## Migration Prompt

Use the following prompt to migrate test files from the old Rewards project to the central framework:

```
I want you to move the [SPEC_FILE_NAME] into the [TARGET_FOLDER] folder in the central framework.

Please use the predefined functions present in the @baseActionUtil.ts and @baseVerificationUtil.ts files.

I want you to:
1. Do not create new functions or variables
2. Just use the methods used in the original spec file
3. Follow the structure and format of existing files in the target folder
4. Use the central framework's test fixtures and page objects
5. Replace old utility functions with central framework equivalents:
   - Replace `isVisible()` with `verifier.isTheElementVisible()`
   - Replace `expect().toBeVisible()` with `verifier.verifyTheElementIsVisible()`
   - Replace `expect().toHaveText()` with `verifier.verifyElementHasText()`
   - Replace `expect().toContainText()` with `verifier.verifyElementContainsText()`
   - Replace `expect().toBeEnabled()` with `verifier.verifyTheElementIsEnabled()`
   - Replace `expect().toHaveURL()` with `verifier.waitUntilPageHasNavigatedTo()`
   - Replace `click()` with `clickOnElement()`
   - Replace `fill()` with `fillInElement()`
   - Replace `waitFor()` with `verifier.waitUntilElementIsVisible()`
   - Replace `page.goto()` with `loadPage()`
   - Replace `page.reload()` with `page.reload()`

6. Update imports to use central framework paths:
   - Replace old fixture imports with central framework fixtures
   - Replace old page imports with central framework page objects
   - Use central framework constants and utilities

7. Update test structure:
   - Use central framework test fixtures
   - Use central framework test decorators and tags
   - Follow central framework naming conventions
   - Use central framework step information format
   - Update beforeEach hooks to use central framework patterns

8. Update page object methods:
   - Add missing locators to page objects if needed
   - Use central framework base page methods
   - Follow central framework method naming conventions
   - Add placeholder objects for complex UI components (like dialog boxes)

9. Handle complex UI components:
   - Create placeholder objects for dialog boxes and modals
   - Use proper locator strategies for dynamic content
   - Implement proper error handling for missing elements
```

## Key Migration Patterns

### 1. Test File Structure

**Before (Old Rewards):**

```typescript
import test from '@fixtures/base-test';
import { expect } from '@playwright/test';
import { Tags } from '@constants';
import { HomePage, LoginPage } from '@pages';
import { isVisible } from '../../../utils/global-utils';
```

**After (Central Framework):**

```typescript
import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsPage } from '@modules/reward/pages/manage-rewards/manage-rewards-page';
```

### 2. Test Structure

**Before (Old Rewards):**

```typescript
test.describe('Test Suite', () => {
  test('[RC-1234] Test name', { tag: [Tags.Both, Tags.Regression] }, async ({ manageRecognitionPage }) => {
    // test implementation
  });
});
```

**After (Central Framework):**

```typescript
test.describe('Test Suite', { tag: [REWARD_SUITE_TAGS.REGRESSION_TEST] }, () => {
  test(
    '[RC-1234] Test name',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Test description',
        zephyrTestId: 'RC-1234',
        storyId: 'RC-1234',
      });
      // test implementation
    }
  );
});
```

### 3. Element Interactions

**Before (Old Rewards):**

```typescript
const isVisible = await isVisible(element, 10000);
await element.click();
await element.fill('text');
await expect(element).toBeVisible();
await expect(element).toHaveText('text');
```

**After (Central Framework):**

```typescript
const isVisible = await pageObject.verifier.isTheElementVisible(element, { timeout: 10000 });
await pageObject.clickOnElement(element, { stepInfo: 'Clicking on element' });
await pageObject.fillInElement(element, 'text', { stepInfo: 'Filling text' });
await pageObject.verifier.verifyTheElementIsVisible(element);
await pageObject.verifier.verifyElementHasText(element, 'text');
```

### 4. Page Object Methods

**Before (Old Rewards):**

```typescript
async someMethod() {
    await this.element.click();
    await expect(this.otherElement).toBeVisible();
}
```

**After (Central Framework):**

```typescript
async someMethod(): Promise<void> {
    await this.clickOnElement(this.element, {
      stepInfo: 'Clicking on element',
    });
    await this.verifier.verifyTheElementIsVisible(this.otherElement);
}
```

### 5. BeforeEach Hook Patterns

**Before (Old Rewards):**

```typescript
test.beforeEach(async ({ loginPage, homePage }) => {
  await loginPage.login('appmanager');
  await homePage.navigationBar.profileIcon.waitFor({ state: 'visible', timeout: 20000 });
  await homePage.navigationBar.visitRewardsStore();
  const manageRecognitionPage = new ManageRecognition(homePage.page);
  await manageRecognitionPage.rewards.enableTheRewardStoreAndPeerGiftingIfDisabled();
  await homePage.navigationBar.visitRewardsStore();
});
```

**After (Central Framework):**

```typescript
test.beforeEach(async ({ appManagerPage }) => {
  const manageRewardsPage = new ManageRewardsPage(appManagerPage);
  const rewardsStore = new RewardsStore(appManagerPage);

  await manageRewardsPage.loadPage();
  await manageRewardsPage.verifyThePageIsLoaded();
  // Enable rewards if disabled
  const isRewardsEnabled = await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.enableRewardsButton, {
    timeout: 5000,
  });
  if (isRewardsEnabled) {
    await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
      stepInfo: 'Enabling rewards if disabled',
    });
    await manageRewardsPage.verifyToastMessage('Rewards enabled');
  }

  await rewardsStore.visit();
});
```

### 6. Complex UI Components (Dialog Boxes, Modals)

**Before (Old Rewards):**

```typescript
// Direct access to dialog box methods
await rewardsStorePage.rewardsDialogBox.clickOnTheCheckoutButton();
await rewardsStorePage.rewardsDialogBox.enterTheConfirmEmail();
```

**After (Central Framework):**

```typescript
// Placeholder object in page object
readonly rewardsDialogBox: any;

constructor(page: Page) {
  // ... other locators
  this.rewardsDialogBox = {
    clickOnTheCheckoutButton: () => Promise.resolve(),
    enterTheConfirmEmail: () => Promise.resolve(),
    checkTheTermsAndConditionCheckbox: () => Promise.resolve(),
    confirmOrder: page.locator('button[type="submit"]'),
    clickOnConfirmOrder: () => Promise.resolve(),
    successOrderLogo: page.locator('[class*="SuccessDialog_logo"]'),
    successOrderHeading: page.locator('[class*="SuccessDialog_heading"]'),
    successOrderDescription: page.locator('[class*="SuccessDialog_description"]'),
    closeTheSuccessDialogBox: () => Promise.resolve(),
  };
}
```

## Common Utility Function Mappings

| Old Function                          | Central Framework Equivalent                         |
| ------------------------------------- | ---------------------------------------------------- |
| `isVisible(element, timeout)`         | `verifier.isTheElementVisible(element, { timeout })` |
| `expect(element).toBeVisible()`       | `verifier.verifyTheElementIsVisible(element)`        |
| `expect(element).toHaveText(text)`    | `verifier.verifyElementHasText(element, text)`       |
| `expect(element).toContainText(text)` | `verifier.verifyElementContainsText(element, text)`  |
| `expect(element).toBeEnabled()`       | `verifier.verifyTheElementIsEnabled(element)`        |
| `expect(page).toHaveURL(url)`         | `verifier.waitUntilPageHasNavigatedTo(url)`          |
| `element.click()`                     | `clickOnElement(element, { stepInfo })`              |
| `element.fill(text)`                  | `fillInElement(element, text, { stepInfo })`         |
| `element.waitFor()`                   | `verifier.waitUntilElementIsVisible(element)`        |
| `page.goto(url)`                      | `loadPage()`                                         |
| `tab.click()`                         | `clickOnElement(tab, { stepInfo })`                  |
| `dropdown.selectOption(value)`        | `selectDropdownByLabel(dropdown, value)`             |

## Page Object Migration Checklist

- [ ] Add missing locators to page object constructor
- [ ] Update method signatures to include proper return types
- [ ] Replace direct Playwright calls with central framework utilities
- [ ] Add proper step information to all actions
- [ ] Use central framework verification methods
- [ ] Follow central framework naming conventions
- [ ] Add proper error handling using central framework patterns

## Test File Migration Checklist

- [ ] Update imports to use central framework paths
- [ ] Replace test fixture with central framework fixture
- [ ] Update test structure to use central framework format
- [ ] Replace utility functions with central framework equivalents
- [ ] Update page object instantiation
- [ ] Add proper test decorators and tags
- [ ] Update step information format
- [ ] Verify all assertions use central framework methods
- [ ] Update beforeEach hooks to use central framework patterns
- [ ] Handle complex UI components with placeholder objects
- [ ] Update URL navigation checks to use central framework methods
- [ ] Ensure proper error handling for missing elements

## Example Migrations

See the following migrated files for complete examples of how to migrate test files from the old Rewards project to the central framework:

1. **Simple Test Migration**: `reward-enable.spec.ts` in `/src/modules/reward/tests/manage-rewards/`
   - Basic test structure migration
   - Element interaction updates
   - Page object method updates

2. **Complex Test Migration**: `rewards-order-history.spec.ts` in `/src/modules/reward/tests/reward-store/`
   - BeforeEach hook migration
   - Complex UI component handling
   - Multiple page object interactions
   - Dynamic content handling

## Notes

- Always check for linting errors after migration
- Ensure all imports are correctly resolved
- Test the migrated files to ensure functionality is preserved
- Follow the existing patterns in the target folder
- Use the central framework's error handling and logging mechanisms
