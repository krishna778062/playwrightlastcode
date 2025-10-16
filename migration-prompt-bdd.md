# BDD to Central UI Automation Framework Migration Guide

This guide provides a step-by-step approach to migrate existing BDD (Cucumber) test cases to the central UI automation framework using Playwright and TypeScript.

## Overview

The migration process involves converting:

- **BDD Steps** → **Page Actions/Assertions**
- **UIActions** → **BaseActionUtil methods**
- **Cucumber scenarios** → **Playwright test cases**
- **Separate locator files** → **Page class locators**

## Step 1: Analysis and Planning

### 1.1 Review Source Files

```bash
# Identify the files to migrate:
# - BDD feature file (.feature)
# - Step definitions (.ts)
# - Page classes (.ts)
# - Locator files (.ts)
```

### 1.2 Understand Current Structure

- **BDD Framework**: Uses Cucumber with step definitions
- **Central Framework**: Uses Page Object Model with Playwright
- **Key Differences**:
  - No more `UIActions` class dependency
  - Locators moved to page classes
  - Actions grouped by interface
  - Uses `test.step()` for better reporting

## Step 2: Create Type Definitions

### 2.1 Create Type File

Create `src/modules/<module>/types/<feature>.type.ts`:

```typescript
export interface FeatureData {
  // Define data structures used in your feature
  field1: string;
  field2: string[];
  // etc.
}

export interface FeatureOptions {
  stepInfo?: string;
  timeout?: number;
}
```

### 2.2 Follow Naming Conventions

- Use PascalCase for interfaces: `FeatureData`, `FeatureOptions`
- Use descriptive names that match your feature functionality
- Export all types for reuse

## Step 3: Create Page Class

### 3.1 Basic Page Structure

Create `src/modules/<module>/pages/<feature>Page.ts`:

```typescript
import { expect, Locator, Page, test } from '@playwright/test';
import { BasePage } from '@core/pages/basePage';
import { FeatureData, FeatureOptions } from '@<module>/types/<feature>.type';

export interface IFeatureActions {
  // Define action methods here
  action1(param: string, options?: FeatureOptions): Promise<void>;
  action2(data: FeatureData, options?: FeatureOptions): Promise<void>;
}

export interface IFeatureAssertions {
  // Define assertion methods here
  verifySomething(text: string, options?: FeatureOptions): Promise<void>;
  verifyNotVisible(element: string, options?: FeatureOptions): Promise<void>;
}

export class FeaturePage extends BasePage implements IFeatureActions, IFeatureAssertions {
  // Locators
  readonly someButton: Locator;
  readonly someInput: Locator;

  // Private locator methods for dynamic selectors
  private readonly dynamicLocator = (index: number) => `selector[data-index="${index}"]`;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.someButton = this.page.locator('button:has-text("Some Text")');
    this.someInput = this.page.locator('input[name="someInput"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the feature page is loaded', async () => {
      await expect(this.someButton).toBeVisible();
    });
  }

  // ==================== ACTION METHODS ====================

  async action1(param: string, options?: FeatureOptions): Promise<void> {
    await test.step(options?.stepInfo || `Performing action1 with ${param}`, async () => {
      await this.clickOnElement(this.someButton, {
        stepInfo: `Click some button`,
      });
    });
  }

  // ==================== ASSERTION METHODS ====================

  async verifySomething(text: string, options?: FeatureOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify something: ${text}`, async () => {
      const element = this.page.getByText(text);
      await expect(element).toBeVisible();
    });
  }

  // ==================== CLEAN API GROUPING ====================

  get actions(): IFeatureActions {
    return this;
  }

  get assertions(): IFeatureAssertions {
    return this;
  }
}
```

### 3.2 Locator Organization

**Move locators from separate files to page class:**

```typescript
// ❌ Old way (separate constants file)
export const LOCATORS = {
  button: 'button.some-class',
  input: 'input[name="field"]',
};

// ✅ New way (in page class)
export class FeaturePage extends BasePage {
  // Static locators as readonly properties
  readonly button: Locator;
  readonly input: Locator;

  // Dynamic locators as private methods
  private readonly dynamicLocator = (index: number) => `selector[data-index="${index}"]`;

  constructor(page: Page) {
    super(page);
    this.button = this.page.locator('button.some-class');
    this.input = this.page.locator('input[name="field"]');
  }
}
```

### 3.3 Replace UIActions with BaseActionUtil

**Convert UIActions methods to BaseActionUtil:**

```typescript
// ❌ Old way (UIActions)
await this.web.assertAndInteractWithElementByRole('button', 'Click me', 'click');

// ✅ New way (BaseActionUtil)
await this.clickOnButtonWithName('Click me');

// ❌ Old way (UIActions)
await this.web.assertAndInteractWithElementByXPath("//input[@id='field']", 'fill', 'value');

// ✅ New way (BaseActionUtil)
await this.fillInElement("input[id='field']", 'value');
```

## Step 4: Map BDD Steps to Page Methods

### 4.1 Action Steps Mapping

**Convert BDD action steps to page actions:**

```gherkin
# BDD Step
Then "Click on {string} button", async function (buttonText) {
  await this.web.assertAndInteractWithElementByRole("button", buttonText, "click");
}
```

```typescript
// Page Action Method
async clickButton(buttonText: string, options?: FeatureOptions): Promise<void> {
  await test.step(options?.stepInfo || `Click ${buttonText} button`, async () => {
    await this.clickOnButtonWithName(buttonText);
  });
}
```

### 4.2 Assertion Steps Mapping

**Convert BDD assertion steps to page assertions:**

```gherkin
# BDD Step
Then "The {string} should be visible", async function (text) {
  await this.web.assertAndInteractWithElementByRole("heading", text, "visible");
}
```

```typescript
// Page Assertion Method
async verifyElementIsVisible(text: string, options?: FeatureOptions): Promise<void> {
  await test.step(options?.stepInfo || `Verify ${text} is visible`, async () => {
    const element = this.page.getByRole("heading", { name: text });
    await expect(element).toBeVisible();
  });
}
```

### 4.3 Data Table Handling

**Convert BDD data tables to TypeScript interfaces:**

```gherkin
# BDD Data Table
Then "Enter data", async function (dataTable) {
  const data = dataTable.raw().map(row => ({
    field1: row[0],
    field2: row[1].split(",").map(item => item.trim())
  }));
}
```

```typescript
// TypeScript Interface
export interface DataTableRow {
  field1: string;
  field2: string[];
}

// Page Method
async enterData(data: DataTableRow[], options?: FeatureOptions): Promise<void> {
  await test.step(options?.stepInfo || `Enter data for ${data.length} rows`, async () => {
    for (const row of data) {
      await this.fillInElement(this.field1Input, row.field1);
      // Process field2 array...
    }
  });
}
```

## Step 5: Update Configuration

### 5.1 Add Path Mapping

Update `tsconfig.json` if needed:

```json
{
  "compilerOptions": {
    "paths": {
      "@<module>/*": ["./src/modules/<module>/*"]
    }
  }
}
```

### 5.2 Create Module Index

Create `src/modules/<module>/index.ts`:

```typescript
// Export types
export * from './types/<feature>.type';

// Export pages
export * from './pages/<feature>Page';
```

## Step 6: Create Test Cases (Optional)

### 6.1 Basic Test Structure

Create `src/modules/<module>/tests/ui-tests/<feature>.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { FeaturePage } from '@<module>/pages/<feature>Page';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Feature Functionality', { tag: ['@feature'] }, () => {
  let featurePage: FeaturePage;

  test.beforeEach(async ({ page }) => {
    // TODO: Add proper login fixture and page navigation
    featurePage = new FeaturePage(page);
  });

  test(
    'Should perform basic action',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'FEATURE-1001',
        description: 'Verify basic functionality',
      });

      await featurePage.actions.action1('test param');
      await featurePage.assertions.verifySomething('expected text');
    }
  );
});
```

## Step 7: Review and Validation

### 7.1 Review Checklist

- [ ] **All BDD steps mapped** to page methods
- [ ] **Locators moved** to page class
- [ ] **UIActions replaced** with BaseActionUtil
- [ ] **Types defined** for data structures
- [ ] **test.step()** wrappers added
- [ ] **Interface grouping** implemented
- [ ] **Path mappings** configured
- [ ] **Module exports** set up

### 7.2 Common Issues to Check

1. **Missing imports**: Ensure all imports are correct
2. **Type mismatches**: Verify data types match interfaces
3. **Locator references**: Update all locator references
4. **Method signatures**: Ensure interface matches implementation
5. **Error handling**: Add proper error handling where needed

### 7.3 Testing the Migration

1. **Compile check**: Ensure TypeScript compiles without errors
2. **Lint check**: Run ESLint to catch any issues
3. **Basic functionality**: Test basic page navigation
4. **Method calls**: Verify all page methods work correctly

## Step 8: Advanced Patterns

### 8.1 Complex Data Handling

```typescript
// For complex data structures
export interface ComplexData {
  questions: QuestionData[];
  settings: SettingsData;
}

export interface QuestionData {
  text: string;
  answers: string[];
  correctAnswer: number;
}
```

### 8.2 Conditional Logic

```typescript
// Handle conditional steps
async conditionalAction(condition: boolean, options?: FeatureOptions): Promise<void> {
  await test.step(options?.stepInfo || 'Perform conditional action', async () => {
    if (condition) {
      await this.action1();
    } else {
      await this.action2();
    }
  });
}
```

### 8.3 Dynamic Locators

```typescript
// For dynamic selectors
private readonly dynamicSelector = (param: string) => `[data-testid="${param}"]`;

async clickDynamicElement(param: string): Promise<void> {
  const selector = this.dynamicSelector(param);
  await this.clickOnElement(selector);
}
```

## Troubleshooting

### Common Errors

1. **"Cannot find module"**: Check path mappings in tsconfig.json
2. **"Property missing"**: Ensure interface matches implementation
3. **"Type mismatch"**: Verify data types in interfaces
4. **"Locator not found"**: Check selector syntax and page structure

### Debugging Tips

1. **Use test.step()**: For better test reporting
2. **Add logging**: Use console.log for debugging
3. **Check selectors**: Verify locators work in browser dev tools
4. **Review original**: Compare with original BDD implementation

## Best Practices

1. **Keep it simple**: Start with basic functionality
2. **Follow patterns**: Use established central framework patterns
3. **Add TODOs**: Mark incomplete implementations clearly
4. **Document decisions**: Comment on why certain approaches were chosen
5. **Test incrementally**: Test each method as you implement it

## Example Migration Summary

### Before (BDD)

```gherkin
Feature: Awareness Check
  Scenario: Create awareness check
    Given load the site
    Then Enter awareness check question and answeres
      | Question | Answers | Correctness |
      | What is 2+2? | 3,4,5 | incorrect,correct,incorrect |
    And Click three dot icon
    And The "What is 2+2?" question should be visible on the screen
```

### After (Central Framework)

```typescript
// Page class with all methods
// Test case using page methods
await awarenessCheckPage.actions.enterAwarenessQuestions(questions);
await awarenessCheckPage.actions.clickThreeDotIcon();
await awarenessCheckPage.assertions.verifyQuestionIsVisible('What is 2+2?');
```

This migration guide ensures consistent, maintainable, and scalable test automation following the central framework's established patterns.
