# Selenium to Playwright Migration Guide

## Migrating from platform-services-automation to central-ui-automation

This comprehensive guide helps migrate test cases from the **platform-services-automation** repository (Java/Selenium/Cucumber) to the **central-ui-automation** repository (TypeScript/Playwright).

## Table of Contents

1. [Framework Overview](#framework-overview)
2. [Key Differences](#key-differences)
3. [Migration Process](#migration-process)
4. [Code Pattern Mappings](#code-pattern-mappings)
5. [File Structure Migration](#file-structure-migration)
6. [Step-by-Step Migration Guide](#step-by-step-migration-guide)
7. [Common Patterns and Examples](#common-patterns-and-examples)
8. [Best Practices](#best-practices)

---

## Framework Overview

### Source Framework (platform-services-automation)

- **Language**: Java
- **Testing Framework**: Selenium WebDriver + Cucumber (BDD)
- **Build Tool**: Maven
- **Structure**:
  - Feature files (`.feature`) with Gherkin syntax
  - Step definitions in Java (`*StepDef.java`)
  - Page objects in Java (`*Page.java`)
  - Properties files for configuration and locators
  - BasePage with factory methods
  - WebUtil for element interactions

### Target Framework (central-ui-automation)

- **Language**: TypeScript
- **Testing Framework**: Playwright
- **Build Tool**: npm/Node.js
- **Structure**:
  - Direct test files (`.spec.ts`) - no BDD
  - Page objects extending `BasePage`
  - `BaseActionUtil` and `BaseVerificationUtil` for interactions
  - Fixtures for test setup
  - Module-based structure
  - Test decorators and tags

---

## Key Differences

| Aspect                   | platform-services-automation             | central-ui-automation                      |
| ------------------------ | ---------------------------------------- | ------------------------------------------ |
| **Test Format**          | BDD (Gherkin feature files)              | Direct TypeScript tests                    |
| **Page Objects**         | Java classes with WebUtil                | TypeScript classes extending BasePage      |
| **Locators**             | Properties files (objectRepo.properties) | Inline in page class as Locator properties |
| **Element Interactions** | WebUtil methods                          | BaseActionUtil methods                     |
| **Assertions**           | JUnit Assert                             | BaseVerificationUtil methods               |
| **Login**                | Step definitions with properties         | Fixtures with LoginHelper                  |
| **Configuration**        | Properties files per environment         | Environment variables (.env files)         |
| **Test Data**            | CSV files, properties                    | TypeScript builders, JSON, CSV utils       |
| **Test Organization**    | Feature files + Step definitions         | Module-based test files                    |

---

## Migration Process

### Phase 1: Analysis

1. **Identify test scenarios** from feature files
2. **Map step definitions** to page methods
3. **Identify page objects** and their methods
4. **List locators** from properties files
5. **Identify test data** sources (CSV, properties)

### Phase 2: Setup

1. **Create module structure** in central-ui-automation
2. **Set up environment files** (.env)
3. **Create type definitions** if needed
4. **Set up fixtures** for the module

### Phase 3: Migration

1. **Create page objects** with locators
2. **Convert page methods** from Java to TypeScript
3. **Create test files** from feature scenarios
4. **Update test data** handling

### Phase 4: Validation

1. **Run tests** and fix issues
2. **Verify test coverage**
3. **Update documentation**

---

## Code Pattern Mappings

### 1. Locator Definitions

**Before (platform-services-automation):**

```java
// In objectRepo.properties
peopleSearchResult=xpath=//div[@class='people-search-result']
filterOptionsInputField=xpath=//input[@placeholder='value']

// In Java Page class
String fieldName = ReadProperty.propertyReader("filterOptionsInputField")
    .replace("value", field);
WebElement fieldEnterText = webUtil.waitForElementToBeVisible(
    By.xpath(fieldName));
```

**After (central-ui-automation):**

```typescript
// In page class
export class PeoplePage extends BasePage {
  readonly peopleSearchResult: Locator;
  readonly filterOptionsInputField: (field: string) => Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.PEOPLE_PAGE) {
    super(page, pageUrl);

    this.peopleSearchResult = page.locator('div.people-search-result');
    this.filterOptionsInputField = (field: string) => page.locator(`input[placeholder='${field}']`);
  }
}
```

### 2. Element Interactions

**Before (platform-services-automation):**

```java
// Using WebUtil
webUtil.click(By.xpath(ReadProperty.propertyReader("button")));
webUtil.waitForElementToBeVisible(By.xpath("//button"));
webUtil.getText(By.xpath("//div"));
webUtil.sendKeys(By.xpath("//input"), "text");
webUtil.selectDropdown(By.xpath("//select"), "value");
```

**After (central-ui-automation):**

```typescript
// Using BaseActionUtil (inherited from BasePage)
await this.clickOnElement(this.button, {
  stepInfo: 'Clicking button',
});
await this.verifier.waitUntilElementIsVisible(this.element);
const text = await this.getElementText(this.element);
await this.fillInElement(this.input, 'text', {
  stepInfo: 'Filling input',
});
await this.selectDropdownByLabel(this.dropdown, 'value');
```

### 3. Assertions

**Before (platform-services-automation):**

```java
import org.junit.Assert;

Assert.assertTrue(basePage.peoplePage().verifyThePresenceOfFilter(filter));
Assert.assertFalse(basePage.peoplePage().verifyTheAbsenceOfFilter(filter));
Assert.assertEquals(driver.getCurrentUrl(), url);
```

**After (central-ui-automation):**

```typescript
// Using BaseVerificationUtil (via this.verifier)
await this.verifier.verifyTheElementIsVisible(this.filter);
await this.verifier.verifyTheElementIsNotVisible(this.filter);
await this.verifier.waitUntilPageHasNavigatedTo(url);
```

### 4. Page Object Methods

**Before (platform-services-automation):**

```java
public class peoplePage extends DriverInitilization {
    WebDriver driver;
    WebUtil webUtil;

    public void EnterTextInField(String value, String field) {
        String fieldName = ReadProperty.propertyReader("filterOptionsInputField")
            .replace("value", field);
        WebElement fieldEnterText = webUtil.waitForElementToBeVisible(
            By.xpath(fieldName));
        fieldEnterText.click();
        fieldEnterText.sendKeys(value);
        webUtil.click(By.xpath(ReadProperty.propertyReader("selectCategory")
            .replace("value", value)));
    }

    public boolean verifyThePresenceOfFilter(String filter) {
        String fieldName = ReadProperty.propertyReader("divContains")
            .replace("value", filter);
        return webUtil.isElementPresent(By.xpath(fieldName), 10);
    }
}
```

**After (central-ui-automation):**

```typescript
export class PeoplePage extends BasePage {
  readonly filterOptionsInputField: (field: string) => Locator;
  readonly selectCategory: (value: string) => Locator;
  readonly filterContainer: (filter: string) => Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.PEOPLE_PAGE) {
    super(page, pageUrl);

    this.filterOptionsInputField = (field: string) => page.locator(`input[placeholder='${field}']`);
    this.selectCategory = (value: string) => page.locator(`[data-value='${value}']`);
    this.filterContainer = (filter: string) => page.locator(`div:has-text('${filter}')`);
  }

  async enterTextInField(value: string, field: string): Promise<void> {
    await test.step(`Enter text ${value} in field ${field}`, async () => {
      const fieldInput = this.filterOptionsInputField(field);
      await this.clickOnElement(fieldInput, {
        stepInfo: `Click on ${field} field`,
      });
      await this.fillInElement(fieldInput, value, {
        stepInfo: `Enter ${value}`,
      });
      await this.clickOnElement(this.selectCategory(value), {
        stepInfo: `Select ${value}`,
      });
    });
  }

  async verifyThePresenceOfFilter(filter: string): Promise<boolean> {
    return await this.verifier.isTheElementVisible(this.filterContainer(filter), { timeout: 10000 });
  }
}
```

### 5. Test Scenarios

**Before (platform-services-automation):**

```gherkin
# People2_0.feature
Feature: Sanity suite for People 2.0

  @sanity @people_2.0 @Platform_Services @tango @zeus
  Scenario: 12171 A Verify that as an App Manager I should able to see Copy profile link on self profile
    Given Deskless Login with any login identifiers for "Admin" with URL "deskless_people_2_0_URL"
    And Click on "User mode" button
    And Mouse hover on "People" and click on option "My profile"
    And Wait for 3 second
    Then Verify the "presence" of "Copy profile link"
```

```java
// PeopleStepDef.java
@Given("Deskless Login with any login identifiers for {string} with URL {string}")
public void desklessLoginAs(String user, String url) {
    // Login logic
}

@Then("Verify the {string} of {string}")
public void verifyThePresenceOf(String presenceOrAbsence, String element) {
    if (presenceOrAbsence.equalsIgnoreCase("presence")) {
        Assert.assertTrue(basePage.peoplePage().verifyThePresenceOfElement(element));
    } else {
        Assert.assertFalse(basePage.peoplePage().verifyThePresenceOfElement(element));
    }
}
```

**After (central-ui-automation):**

```typescript
// people-profile.spec.ts
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { PeopleProfilePage } from '@platforms/ui/pages/people/peopleProfilePage';

test.describe(
  'People Profile Tests',
  {
    tag: ['@people_2.0', '@Platform_Services'],
  },
  () => {
    test(
      'Verify that as an App Manager I should able to see Copy profile link on self profile',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-16288'],
          description: 'Verify Copy profile link visibility for App Manager',
        });

        const peopleProfilePage = new PeopleProfilePage(appManagerFixture.page);
        await peopleProfilePage.navigateToMyProfile();
        await peopleProfilePage.verifier.verifyTheElementIsVisible(peopleProfilePage.copyProfileLink);
      }
    );
  }
);
```

### 6. Login and Setup

**Before (platform-services-automation):**

```java
// CommonStepDef.java
@Given("Login as {string}")
public void loginAs(String user) {
    driver.get(pro.getProperty("Login_URL"));
    if (user.equalsIgnoreCase("Admin")) {
        basePage.loginPage().login(
            pro.getProperty("USERNAME_QA"),
            pro.getProperty("PASSWORD_QA"),
            pro.getProperty("Simpplr_Home_URL")
        );
    }
    // ... more user types
}
```

**After (central-ui-automation):**

```typescript
// Using fixtures - automatically handled
// In fixture file
export const platformTestFixture = test.extend<PlatformFixture>({
  appManagerFixture: async ({ page, apiContext }, use) => {
    const loginHelper = new LoginHelper(page);
    await loginHelper.loginAsAppManager();
    const homePage = new NewHomePage(page);
    await homePage.verifyThePageIsLoaded();

    await use({
      page,
      apiContext,
      homePage,
      // ... other fixtures
    });
  },
});

// In test file - login is automatic via fixture
test('My test', async ({ appManagerFixture }) => {
  // Already logged in as App Manager
  const peoplePage = new PeoplePage(appManagerFixture.page);
  // ... test code
});
```

### 7. Wait and Synchronization

**Before (platform-services-automation):**

```java
webUtil.waitInSeconds(3);
webUtil.waitForPageLoad();
webUtil.waitForElementToBeVisible(By.xpath("//button"), 10);
```

**After (central-ui-automation):**

```typescript
// Playwright auto-waits, but explicit waits available:
await this.page.waitForTimeout(3000); // Avoid if possible
await this.page.waitForLoadState('networkidle');
await this.verifier.waitUntilElementIsVisible(this.button, { timeout: 10000 });
```

### 8. Dropdown Selection

**Before (platform-services-automation):**

```java
Select dropdown = new Select(webUtil.waitForElementToBeVisible(By.xpath("//select")));
dropdown.selectByVisibleText("Option");
```

**After (central-ui-automation):**

```typescript
await this.selectDropdownByLabel(this.dropdown, 'Option');
// or
await this.selectDropdownByValue(this.dropdown, 'value');
```

### 9. Hover Actions

**Before (platform-services-automation):**

```java
Actions actions = new Actions(driver);
WebElement element = webUtil.waitForElementToBeVisible(By.xpath("//element"));
actions.moveToElement(element).perform();
```

**After (central-ui-automation):**

```typescript
await this.hoverOnElement(this.element, { stepInfo: 'Hover on element' });
```

### 10. Navigation

**Before (platform-services-automation):**

```java
driver.get(pro.getProperty("Simpplr_Home_URL"));
basePage.homePage().navigateToPeople();
```

**After (central-ui-automation):**

```typescript
// Using page object
await peoplePage.loadPage(); // Uses pageUrl from constructor
// or
await this.goToUrl(url);
// or using navigation helper
await navigationHelper.navigateToPeople();
```

---

## File Structure Migration

### Source Structure (platform-services-automation)

```
platform-services-automation/
├── src/
│   ├── main/java/com/simpplr/automation/
│   │   ├── page/ui/
│   │   │   ├── BasePage.java
│   │   │   ├── peoplePage.java
│   │   │   └── ...
│   │   ├── util/
│   │   │   ├── WebUtil.java
│   │   │   └── ReadProperty.java
│   │   └── base/
│   │       └── DriverInitilization.java
│   └── test/java/Features/
│       ├── PeopleStepDef.java
│       ├── CommonStepDef.java
│       └── Runner.java
│   └── test/resources/
│       ├── Features/
│       │   └── People2_0.feature
│       ├── config/
│       │   ├── odin/
│       │   │   ├── odin_environment_qa.properties
│       │   │   └── odin_objectRepo.properties
│       │   └── zeus/
│       │       ├── zeus_environment_qa.properties
│       │       └── zeus_objectRepo.properties
│       └── testData/
│           └── *.csv
```

### Target Structure (central-ui-automation)

```
central-ui-automation/
├── src/
│   ├── core/
│   │   ├── ui/pages/
│   │   │   └── basePage.ts
│   │   ├── utils/
│   │   │   ├── baseActionUtil.ts
│   │   │   └── baseVerificationUtil.ts
│   │   └── helpers/
│   │       └── loginHelper.ts
│   └── modules/
│       └── platforms/
│           ├── ui/pages/people/
│           │   ├── peoplePage.ts
│           │   └── peopleProfilePage.ts
│           ├── fixtures/
│           │   └── platformFixture.ts
│           ├── tests/ui-tests/people/
│           │   └── people-profile.spec.ts
│           ├── env/
│           │   ├── test.env
│           │   └── qa.env
│           └── constants/
│               └── testTags.ts
```

---

## Step-by-Step Migration Guide

### Step 1: Analyze the Feature File

**Example Feature File:**

```gherkin
Feature: Sanity suite for People 2.0

  @sanity @people_2.0 @Platform_Services
  Scenario: Verify Copy profile link visibility
    Given Deskless Login with any login identifiers for "Admin"
    And Click on "User mode" button
    And Mouse hover on "People" and click on option "My profile"
    Then Verify the "presence" of "Copy profile link"
```

**Analysis:**

- **Login**: Admin user login
- **Actions**: Click User mode, hover People, click My profile
- **Verification**: Check Copy profile link presence
- **Tags**: @sanity, @people_2.0, @Platform_Services

### Step 2: Identify Step Definitions

Find corresponding step definitions in `*StepDef.java` files:

- `Deskless Login with any login identifiers for {string}` → Login fixture
- `Click on {string} button` → Page action method
- `Mouse hover on {string} and click on option {string}` → Page action method
- `Verify the {string} of {string}` → Page verification method

### Step 3: Identify Page Objects and Methods

Review the Java page class to understand:

- What methods exist
- What locators are used
- What logic is implemented

### Step 4: Create Module Structure (if needed)

```bash
cd central-ui-automation
npm run create:module platforms
```

Or manually create:

```
src/modules/platforms/
├── ui/pages/people/
├── fixtures/
├── tests/ui-tests/people/
├── env/
└── constants/
```

### Step 5: Create Page Object

```typescript
// src/modules/platforms/ui/pages/people/peopleProfilePage.ts
import { expect, Locator, Page, test } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

export class PeopleProfilePage extends BasePage {
  readonly userModeButton: Locator;
  readonly peopleMenu: Locator;
  readonly myProfileOption: Locator;
  readonly copyProfileLink: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.PEOPLE_PROFILE_PAGE) {
    super(page, pageUrl);

    this.userModeButton = page.getByRole('button', { name: 'User mode' });
    this.peopleMenu = page.getByText('People');
    this.myProfileOption = page.getByRole('menuitem', { name: 'My profile' });
    this.copyProfileLink = page.getByRole('button', { name: 'Copy profile link' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the people profile page is loaded', async () => {
      await expect(this.copyProfileLink).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async navigateToMyProfile(): Promise<void> {
    await test.step('Navigate to My Profile', async () => {
      await this.clickOnElement(this.userModeButton, {
        stepInfo: 'Click on User mode button',
      });
      await this.hoverOnElement(this.peopleMenu, {
        stepInfo: 'Hover on People menu',
      });
      await this.clickOnElement(this.myProfileOption, {
        stepInfo: 'Click on My profile option',
      });
      await this.verifyThePageIsLoaded();
    });
  }
}
```

### Step 6: Create Test File

```typescript
// src/modules/platforms/tests/ui-tests/people/people-profile.spec.ts
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { PeopleProfilePage } from '@platforms/ui/pages/people/peopleProfilePage';

test.describe(
  'People Profile Tests',
  {
    tag: ['@people_2.0', '@Platform_Services'],
  },
  () => {
    test(
      'Verify that as an App Manager I should able to see Copy profile link on self profile',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-16288'],
          description: 'Verify Copy profile link visibility for App Manager',
        });

        const peopleProfilePage = new PeopleProfilePage(appManagerFixture.page);
        await peopleProfilePage.navigateToMyProfile();
        await peopleProfilePage.verifier.verifyTheElementIsVisible(peopleProfilePage.copyProfileLink);
      }
    );
  }
);
```

### Step 7: Update Environment Configuration

Create/update `.env` files:

```bash
# src/modules/platforms/env/qa.env
TEST_ENV=qa
BASE_URL=https://qa.example.com
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=password
```

### Step 8: Run and Validate

```bash
# Run the migrated test
npm run test:platforms -- --grep "Copy profile link"

# Or use interactive test runner
npm test
```

---

## Common Patterns and Examples

### Pattern 1: Conditional Verification

**Before:**

```java
@Then("Verify the {string} of {string}")
public void verifyThePresenceOf(String presenceOrAbsence, String element) {
    if (presenceOrAbsence.equalsIgnoreCase("presence")) {
        Assert.assertTrue(basePage.peoplePage().verifyThePresenceOfElement(element));
    } else {
        Assert.assertFalse(basePage.peoplePage().verifyThePresenceOfElement(element));
    }
}
```

**After:**

```typescript
// In page class
async verifyElementPresence(
  element: Locator,
  shouldBePresent: boolean
): Promise<void> {
  await test.step(
    `Verify element ${shouldBePresent ? 'is' : 'is not'} present`,
    async () => {
      if (shouldBePresent) {
        await this.verifier.verifyTheElementIsVisible(element);
      } else {
        await this.verifier.verifyTheElementIsNotVisible(element);
      }
    }
  );
}

// In test
await peoplePage.verifyElementPresence(
  peoplePage.copyProfileLink,
  true // or false
);
```

### Pattern 2: Search and Filter

**Before:**

```java
public void searchPeople(String peopleText) {
    WebElement categoryAction = webUtil.waitForElementToBeVisible(
        By.xpath(ReadProperty.propertyReader("selectCheckBox")
            .replace("value", "term")));
    categoryAction.clear();
    categoryAction.sendKeys(peopleText);
    categoryAction.sendKeys(Keys.ENTER);
    webUtil.waitInSeconds(2);
}
```

**After:**

```typescript
async searchPeople(peopleText: string): Promise<void> {
  await test.step(`Search for people: ${peopleText}`, async () => {
    const searchInput = this.page.locator('input[placeholder*="Search"]');
    await this.fillInElement(searchInput, peopleText, {
      stepInfo: `Enter search text: ${peopleText}`,
    });
    await this.pressKey('Enter');
    await this.page.waitForLoadState('networkidle');
  });
}
```

### Pattern 3: Dropdown Selection with Dynamic Options

**Before:**

```java
public void selectFromAudienceField(String value, String field) {
    String fieldName = ReadProperty.propertyReader("audienceField")
        .replace("value", field);
    WebElement dropdown = webUtil.waitForElementToBeVisible(By.xpath(fieldName));
    Select select = new Select(dropdown);
    select.selectByVisibleText(value);
}
```

**After:**

```typescript
async selectFromAudienceField(value: string, field: string): Promise<void> {
  await test.step(`Select ${value} from ${field}`, async () => {
    const dropdown = this.page.locator(`select[name='${field}']`);
    await this.selectDropdownByLabel(dropdown, value);
  });
}
```

### Pattern 4: Multiple Element Verification

**Before:**

```java
@And("Verify the {string} {int} {string} should be there on {string} section")
public void verifyShouldBeThereOnSection(
    String presenceOfField,
    int noOfAudio,
    String audioPlayer,
    String section
) {
    for (int i = 0; i < noOfAudio; i++) {
        Assert.assertTrue(
            basePage.peoplePage().verifyTheNumberOfAudioPlayer(
                presenceOfField, audioPlayer
            )
        );
    }
}
```

**After:**

```typescript
async verifyAudioPlayersInSection(
  count: number,
  section: string
): Promise<void> {
  await test.step(
    `Verify ${count} audio players in ${section} section`,
    async () => {
      const audioPlayers = this.page
        .locator(`[data-section='${section}']`)
        .locator('[class*="audio-player"]');

      await expect(audioPlayers).toHaveCount(count);

      for (let i = 0; i < count; i++) {
        await this.verifier.verifyTheElementIsVisible(
          audioPlayers.nth(i)
        );
      }
    }
  );
}
```

### Pattern 5: CSV Data Handling

**Before:**

```java
CSVManipulation csvManipulation = basePage.csvManipulation();
List<Map<String, String>> data = csvManipulation.readCSV("testData/bulkUpload.csv");
for (Map<String, String> row : data) {
    // Process row
}
```

**After:**

```typescript
import { CSVUtils } from '@core/utils/csvUtils';

const csvData = await CSVUtils.readCSV('test-data/bulkUpload.csv');
for (const row of csvData) {
  // Process row
  await this.fillInElement(this.field, row.fieldName);
}
```

---

## Best Practices

### 1. Locator Strategy

- ✅ Use semantic locators: `page.getByRole('button', { name: 'Submit' })`
- ✅ Prefer data-testid if available: `page.getByTestId('submit-button')`
- ✅ Use XPath as last resort
- ❌ Avoid brittle selectors like `div:nth-child(3)`

### 2. Page Object Design

- ✅ Keep page objects focused on a single page/component
- ✅ Use interface grouping for actions/assertions
- ✅ Include `verifyThePageIsLoaded()` method
- ✅ Use `test.step()` for better reporting

### 3. Test Organization

- ✅ One test file per feature/functionality
- ✅ Use descriptive test names
- ✅ Add test metadata with `tagTest()`
- ✅ Use appropriate tags (TestPriority, TestGroupType)

### 4. Error Handling

- ✅ Let Playwright auto-wait (don't add unnecessary waits)
- ✅ Use explicit timeouts only when needed
- ✅ Provide meaningful error messages in assertions

### 5. Test Data

- ✅ Use test data builders for complex data
- ✅ Keep test data in module-specific folders
- ✅ Use environment variables for configuration

### 6. Code Reusability

- ✅ Use fixtures for common setup (login, navigation)
- ✅ Create helper methods in page objects
- ✅ Use core utilities from `@core/utils`

---

## Migration Checklist

### Pre-Migration

- [ ] Review feature files and identify all scenarios
- [ ] Map step definitions to page methods
- [ ] Identify all page objects needed
- [ ] List all locators from properties files
- [ ] Identify test data sources

### During Migration

- [ ] Create module structure (if new module)
- [ ] Set up environment files
- [ ] Create type definitions (if needed)
- [ ] Create/update fixtures
- [ ] Create page objects with locators
- [ ] Convert page methods from Java to TypeScript
- [ ] Create test files from feature scenarios
- [ ] Update test data handling

### Post-Migration

- [ ] Run tests and fix issues
- [ ] Verify test coverage matches original
- [ ] Update documentation
- [ ] Code review
- [ ] Add to CI/CD pipeline

---

## Common Issues and Solutions

### Issue 1: Locator Not Found

**Problem**: Element not found after migration
**Solution**:

- Verify locator in browser dev tools
- Check if element is in iframe (use `frameLocator()`)
- Ensure proper wait conditions

### Issue 2: Timing Issues

**Problem**: Tests fail due to timing
**Solution**:

- Playwright auto-waits, but use explicit waits if needed
- Use `waitForLoadState()` for page loads
- Use `waitUntilElementIsVisible()` for dynamic content

### Issue 3: Login/Session Issues

**Problem**: Login not working in migrated tests
**Solution**:

- Use fixtures for login (automatic)
- Check environment variables
- Verify login helper implementation

### Issue 4: Test Data Format

**Problem**: CSV or test data format differences
**Solution**:

- Use `CSVUtils` from core
- Convert CSV format if needed
- Use TypeScript builders for complex data

---

## Additional Resources

- [Central Framework README](./README.md)
- [BDD Migration Guide](./migration-prompt-bdd.md)
- [Central Framework Migration Guide](./centralFrameworkMigration.md)
- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

## Summary

This guide provides a comprehensive approach to migrating test cases from **platform-services-automation** (Java/Selenium/Cucumber) to **central-ui-automation** (TypeScript/Playwright). Key takeaways:

1. **No BDD**: Direct TypeScript tests instead of Gherkin feature files
2. **Page Objects**: TypeScript classes extending `BasePage` with inline locators
3. **Utilities**: `BaseActionUtil` and `BaseVerificationUtil` replace `WebUtil`
4. **Fixtures**: Automatic login and setup via Playwright fixtures
5. **Module Structure**: Organized by feature/module for better maintainability

Follow the step-by-step process, use the code pattern mappings, and refer to examples for common patterns. Always validate migrated tests and ensure they match the original test coverage.
