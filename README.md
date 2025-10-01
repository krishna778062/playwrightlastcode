# Central UI Automation Framework

A centralized, scalable, and modular end-to-end UI automation framework built with [Playwright](https://playwright.dev/) and TypeScript. This framework is designed to support multiple product modules while enforcing best practices for code reuse, maintainability, and clarity.

**🚀 Now featuring an Interactive Test Runner** for the best developer and QA experience - simply run `npm test` to get started!

## Core Principles

- **Centralization of Common Logic:**
  - All shared utilities, base classes, API clients, types, and helpers reside in `src/core`.
  - This ensures maximum code reuse and a single source of truth for common logic.
- **Layered Architecture:**
  - **Tests:** Describe the business logic and user flow. They should be readable and high-level.
  - **Page Classes:** Act as both the "driver" and "interface" layer. They contain inline methods that orchestrate complex, multi-step user actions (e.g., `openDirectMessageWithUser`) and provide clean APIs through interface grouping.
  - **Components:** Represent individual UI sections. They provide the low-level "tools" (locators and basic interactions like `click` or `fill`) for page methods to use.
- **Modularization:**
  - Module-specific APIs, pages, components, and tests are organized under `src/modules/<module-name>` (e.g., `src/modules/chat`).
  - Each module is self-contained, making it easy to extend or add new modules.

## ✨ Key Features

- **🎯 Interactive Test Runner**: User-friendly CLI that guides you through test execution options
- **🔧 Generic Module Runner**: Single script to run any module with flexible parameters
- **🏷️ Dynamic Tag Management**: Automatically discovers and combines core and module-specific test tags
- **⚡ Flexible Execution**: Support for workers, headed/headless mode, and all Playwright CLI options
- **🚀 One-Command Setup**: `npm run setup` handles entire framework initialization
- **🔍 Auto-Discovery**: Automatically detects available modules and environments

## Available npm Scripts

| Command                   | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `npm test`                | **Interactive test runner** (recommended for local development)                    |
| `npm run setup`           | **One-time setup** - installs dependencies, browsers, and git hooks                |
| `npm run create:module`   | **Create new module** - scaffolds complete module structure                        |
| `npm run test:module`     | **Generic module runner** - `npm run test:module <module> [tags] [env] [flags...]` |
| `npm run test:chat`       | Run chat module tests directly                                                     |
| `npm run test:chat:P0`    | Run priority P0 chat tests                                                         |
| `npm run test:chat:smoke` | Run smoke tests for chat module                                                    |
| `npm run serve-report`    | View latest test reports in browser                                                |
| `npm run format`          | Format code with Prettier                                                          |
| `npm run lint`            | Check code with ESLint                                                             |

## Directory Structure

```
central-ui-automation/
├── src/
│   ├── core/                # Shared utilities, base classes, API clients, types, constants
│   │   ├── api/             # Core API clients, services, interfaces, factories
│   │   ├── components/      # Shared UI components (if any)
│   │   ├── constants/       # Shared constants (e.g., environments, timeouts)
│   │   ├── helpers/         # Shared utility functions and services (not page helpers)
│   │   ├── pages/           # Shared page objects (e.g., LoginPage, HomePage)
│   │   ├── test-data-builders/ # Shared test data builder patterns
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # Shared utility functions
│   └── modules/
│       └── chat/            # Example module: Chat
│           ├── api/         # Module-specific API services and interfaces
│           ├── components/  # Module-specific UI components
│           ├── helpers/     # Module-specific utility functions and services
│           ├── pages/       # Module-specific page objects with inline methods
│           ├── test-data-builders/ # Module-specific test data builders
│           ├── tests/       # Module-specific tests (api-tests, ui-tests)
│           └── types/       # Module-specific types
├── playwright.base.config.ts    # Base Playwright config (shared)
├── src/modules/chat/playwright.chat.config.ts # Module-specific Playwright config
├── convert-report.js            # Custom report converter for Playwright results
├── package.json                 # Project dependencies and scripts
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Quick Setup

The fastest way to get started:

```sh
npm run setup
```

This will:

- Install all dependencies
- Install Playwright browsers
- Set up git hooks (locally)
- Run initial checks
- Display usage instructions

### Running Tests

#### 🚀 Interactive Test Runner (Recommended)

For the best developer experience, use our interactive CLI:

```sh
npm test
```

This will guide you through:

- **Module Selection**: Choose which module to test (chat, content, global-search, etc.)
- **Environment**: Select target environment (qa, uat, etc.)
- **Test Filtering**: Pick from available tags (P0, smoke, module-specific features)
- **Execution Options**: Set workers, headed/headless mode
- **Real-time Preview**: See the exact command before execution

#### Direct Module Testing

For CI/CD or when you know exactly what to run:

```sh
# Generic module runner
npm run test:module <module> [tags] [env] [flags...]

# Examples:
npm run test:module chat P0 qa --workers=2
npm run test:module chat '[P0,smoke]' qa --headed
npm run test:module content sanity uat --workers=1 --debug
```

#### Traditional npm Scripts (Still Available)

- **Chat Module UI Tests:**
  ```sh
  npm run test:chat
  ```
- **Run Only P0 Tests:**
  ```sh
  npm run test:chat -- --grep="@P0"
  ```
- **Run Smoke Tests:**
  ```sh
  npm run test:chat -- --grep="@smoke"
  ```

### Test Reports

- **Generate HTML Report:**
  ```sh
  npm run generate-report
  ```
- **Serve Report Locally:**
  ```sh
  npm run serve-report
  ```
  This will start a local server at [http://localhost:3000](http://localhost:3000) and open the Playwright HTML report.

## 🎯 Interactive Test Runner

The framework includes a powerful interactive CLI tool designed to make test execution intuitive for both developers and QA engineers.

### Features

- **🔍 Auto-Discovery**: Automatically detects available modules and environments
- **🏷️ Smart Tag Management**: Dynamically loads test tags from:
  - Core constants (P0, P1, P2, smoke, sanity, regression)
  - Module-specific feature tags (e.g., @chat-attachment, @group-chat)
- **⚡ Flexible Execution**: Configure workers, headed/headless mode, and other Playwright options
- **👀 Command Preview**: See exactly what will be executed before running
- **🚀 One-Click Execution**: No need to remember complex command syntax

### Example Interactive Flow

```sh
$ npm test

🚀 Interactive Playwright Test Runner

? 📁 Which module do you want to test? › chat
? 🌍 Which environment? › qa
? 🏷️ How do you want to filter tests? › Select from common tags
? 🏷️ Select tags (Use space to select, enter to continue) › @P0, @smoke
? ⚡ How many parallel workers? › 4 workers (default)
? 👁️ Run with browser UI visible (headed mode)? › No

📋 Command Preview:
./scripts/test-module.sh chat [P0,smoke] qa --workers=4

? 🚀 Execute this command? › Yes
🏃 Running tests...
```

### Tag Management System

The framework uses a hierarchical tag system:

#### Core Tags (Available in All Modules)

- **Priority**: `@P0`, `@P1`, `@P2` (from `src/core/constants/testPriority.ts`)
- **Test Type**: `@smoke`, `@sanity`, `@regression` (from `src/core/constants/testType.ts`)

#### Module-Specific Tags

Each module maintains its own tag definitions in `constants/testTags.ts`:

```typescript
// src/modules/chat/constants/testTags.ts
export enum CHAT_FEATURE_TAGS {
  CHAT_ATTACHMENT = '@chat-attachment',
  GROUP_CHAT = '@group-chat',
  VIDEO_CALL = '@video-call',
  // ...
}

export const CHAT_TEST_TAGS = [...Object.values(CHAT_FEATURE_TAGS)] as const;
export default CHAT_TEST_TAGS;
```

The interactive runner automatically combines core and module-specific tags for easy selection.

### 🚨 Troubleshooting & Fallback Options

If you encounter issues with the interactive runner or shell script, you can always fall back to the underlying commands:

#### Option 1: Direct npm Scripts

```sh
# Run all chat tests
npm run test:chat

# With specific environment
TEST_ENV=uat npm run test:chat

# With specific tags
npm run test:chat -- --grep="@P0"

# With Playwright options
npm run test:chat -- --workers=2 --headed
```

#### Option 2: Direct Playwright Commands

```sh
# Basic command structure
TEST_ENV=<env> MODULE_NAME=<module> npx playwright test --config=<config-path>

# Examples:
TEST_ENV=uat MODULE_NAME=chat npx playwright test --config=src/modules/chat/playwright.chat.config.ts

TEST_ENV=qa MODULE_NAME=content npx playwright test --config=src/modules/content/playwright.content.config.ts --grep="@P0"

TEST_ENV=uat MODULE_NAME=chat npx playwright test --config=src/modules/chat/playwright.chat.config.ts --workers=1 --headed --debug
```

#### Understanding the Hierarchy

All our tools are just convenient wrappers around the core Playwright command:

```
🎯 Interactive Runner (npm test)
    ↓ calls
🔧 Shell Script (npm run test:module)
    ↓ calls
📦 npm Scripts (npm run test:chat)
    ↓ calls
⚡ Direct Playwright (npx playwright test)
```

**When to use each:**

- **Interactive Runner**: Best for exploration and daily development
- **Shell Script**: Perfect for CI/CD and when you know exact parameters
- **npm Scripts**: Quick access to module-specific tests
- **Direct Playwright**: Troubleshooting, debugging, or maximum control

## Running Tests Manually via GitHub Actions

You can manually trigger the UI E2E automation suite directly from GitHub Actions using the provided workflow. This is useful for on-demand test runs, selecting specific modules, priorities, environments, and parallelism.

### How to Trigger

1. Go to your repository on GitHub.
2. Click on the **Actions** tab.
3. Select the **UI E2E Tests** workflow from the list on the left.
4. Click the **Run workflow** button.
5. Fill in the required inputs:
   - **module_name**: Select the module to test (e.g., `chat`, `feed`).
   - **priority_filter**: Choose which test priorities to run (`@P0`, `@P1`, or `all`).
   - **environment**: Select the environment (`qa`, `uat`).
   - **workers**: Set the number of parallel workers (1–5).
6. Click **Run workflow** to start the suite with your chosen parameters.

### Example

To run all P0 tests for the chat module in the QA environment with 3 workers:

- `module_name`: `chat`
- `priority_filter`: `@P0`
- `environment`: `qa`
- `workers`: `3`

The workflow will:

- Install dependencies and Playwright browsers
- Run the selected tests with the specified filters and parallelism
- Generate and upload the HTML report
- Deploy the report to GitHub Pages

## Framework Design

### Core (`src/core`)

- **api/**: Contains base API clients, shared services, interfaces, and factories for API instantiation.
- **pages/**: Contains shared, cross-module page objects, such as `LoginPage` or `HomePage`.
- **helpers/**: Provides shared utility functions and services (not page-specific helpers).
- **utils/**: Shared utility functions (e.g., environment loader, test data generators, browser factory).
- **test-data-builders/**: Shared builder patterns for creating test data.
- **types/**: Shared TypeScript types (e.g., user, group, API types).
- **constants/**: Shared constants (e.g., environment names, timeouts, paths).

### Modules (`src/modules/<module>`)

Each module (e.g., `chat`) contains its own APIs, pages, components, and tests.

- **api/**: Module-specific API services and interfaces.
- **pages/**: Page objects with inline business logic methods. Pages use interface grouping to provide clean APIs (e.g., `page.actions.sendMessage()`).
- **components/**: UI components specific to the module. Components provide locators and simple, granular interactions (`clickButton`, `fillInput`).
- **helpers/**: Module-specific utility functions and services (not page helpers).
- **tests/**: Contains `ui-tests` and `api-tests` for the module. Tests should be clean, readable, and call methods from page classes.
- **test-data-builders/**: Module-specific logic for building complex test data.

### Page Class Architecture Patterns

The framework supports two patterns based on page complexity:

#### Single Class Pattern (Simple Pages)

For pages with fewer than 50 methods total:

```typescript
class LoginPage extends BasePage implements ILoginActions, ILoginAssertions {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.LOGIN_PAGE);
    // Initialize locators
  }

  // Inline action methods
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Inline assertion methods
  async verifyLoginSuccess() {
    await expect(this.successMessage).toBeVisible();
  }

  // Clean API grouping
  get actions(): ILoginActions {
    return this;
  }
  get assertions(): ILoginAssertions {
    return this;
  }
}
```

#### Base Class Inheritance Pattern (Complex Pages)

For pages with 50+ methods, multiple UX variants, or significant complexity:

```typescript
// Level 1: Component Base - Infrastructure only
abstract class ChatPageBase extends BasePage {
  // Only components and locators
  readonly inboxSideBarComponent: ChatInboxSideBarComponent;
  readonly conversationWindow: ConversationWindowComponent;
  readonly directMessageSection: DirectMessageSectionInInbox;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CHATS_PAGE);
    // Initialize components only
  }

  abstract verifyThePageIsLoaded(): Promise<void>;
}

// Level 2: Implementation Page - Business logic
class ChatAppPage extends ChatPageBase implements IChatActions, IChatAssertions {
  constructor(page: Page) {
    super(page);
  }

  // ==================== ACTION METHODS ====================
  async sendMessage(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Sending message: "${message}"`, async () => {
      await this.conversationWindow.sendMessage(message);
    });
  }

  async openDirectMessageWithUser(userName: string) {
    await this.inboxSideBarComponent.clickCreateNewMessageButton();
    await this.inboxSideBarComponent.searchAndSelectUser(userName);
    await this.inboxSideBarComponent.clickStartChatButton();
  }

  // ==================== ASSERTION METHODS ====================
  async verifyMessageIsVisible(message: string) {
    await expect(this.conversationWindow.getMessageByText(message)).toBeVisible();
  }

  // ==================== CLEAN API GROUPING ====================
  get actions(): IChatActions {
    return this;
  }
  get assertions(): IChatAssertions {
    return this;
  }
}
```

### Interface Design for Actions and Assertions

#### Basic Interface Grouping

```typescript
// Define clean interfaces for grouping
interface IChatActions {
  sendMessage(message: string, options?: { stepInfo?: string }): Promise<void>;
  sendAttachment(path: string, options?: { stepInfo?: string }): Promise<void>;
  openDirectMessageWithUser(userName: string): Promise<void>;
}

interface IChatAssertions {
  verifyMessageIsVisible(message: string, options?: { timeout?: number }): Promise<void>;
  verifyAttachmentIsVisible(filename: string): Promise<void>;
  verifyUserIsOnline(userName: string): Promise<void>;
}
```

#### Interface Inheritance for UX Variants

When dealing with multiple UX variants where some methods are common and others are variant-specific:

```typescript
// ❌ BAD: Single interface forces all variants to implement everything
interface IHomePageActions {
  searchForTerm(): Promise<void>; // ✅ Common to both UX variants
  clickOnModernSidebarButton(): Promise<void>; // ❌ Only exists in New UX
  clickOnLegacyMenuButton(): Promise<void>; // ❌ Only exists in Old UX
}

// ✅ GOOD: Interface inheritance hierarchy
interface ICommonHomePageActions {
  searchForTerm(term: string): Promise<GlobalSearchResultPage>;
  navigateToSettings(): Promise<void>;
  // Only methods that exist in ALL UX variants
}

interface INewUxHomePageActions extends ICommonHomePageActions {
  clickOnCreateButtonOnSideNavBar(): Promise<CreateComponent>;
  openModernSidePanel(): Promise<void>;
  // New UX specific methods
}

interface IOldUxHomePageActions extends ICommonHomePageActions {
  clickOnLegacyAddButton(): Promise<void>;
  openOldStyleMenu(): Promise<void>;
  // Old UX specific methods
}
```

#### Implementation with Variants

```typescript
// Base class implements only common interface
abstract class BaseHomePage extends BasePage implements ICommonHomePageActions {
  // Common components
  readonly topNavBarComponent: TopNavBarComponent;

  // Only common methods implemented here
  async searchForTerm(term: string): Promise<GlobalSearchResultPage> {
    await this.topNavBarComponent.typeInSearchBarInput(term);
    await this.topNavBarComponent.clickSearchButton();
    return new GlobalSearchResultPage(this.page);
  }

  get actions(): ICommonHomePageActions {
    return this;
  }
}

// Variant-specific implementations
class HomePageNewUx extends BaseHomePage implements INewUxHomePageActions {
  readonly sideNavBarComponent: SideNavBarComponent;

  async clickOnCreateButtonOnSideNavBar(): Promise<CreateComponent> {
    await this.sideNavBarComponent.clickOnCreateButton();
    return new CreateComponent(this.page);
  }

  // Override with more specific type
  get actions(): INewUxHomePageActions {
    return this;
  }
}

class HomePageOldUx extends BaseHomePage implements IOldUxHomePageActions {
  readonly legacyMenuComponent: LegacyMenuComponent;

  async clickOnLegacyAddButton(): Promise<void> {
    await this.legacyMenuComponent.clickAddButton();
  }

  // Override with more specific type
  get actions(): IOldUxHomePageActions {
    return this;
  }
}
```

### When to Use Each Pattern

| Scenario                      | Pattern                            | Reasoning                          |
| ----------------------------- | ---------------------------------- | ---------------------------------- |
| **Simple login/signup pages** | Single Class                       | <50 methods, straightforward UI    |
| **Complex feature pages**     | Base Class Inheritance             | 50+ methods, better organization   |
| **Multiple UX variants**      | Base Class + Interface Inheritance | Code reuse + variant-specific APIs |
| **Module entry points**       | Single Class                       | Clean, discoverable interface      |

### Inline Method Pattern with Interface Grouping (Recommended)

Instead of separate helper classes, the framework uses **inline methods** with **interface grouping** to provide clean, discoverable APIs while maintaining all logic within the page class.

**Benefits:**

- **Clean API**: `chatPage.actions.sendMessage()` and `chatPage.assertions.verifyMessageIsVisible()` provide intuitive grouping
- **No Circular Dependencies**: All methods are part of the same class, eliminating object reference cycles
- **Better Performance**: No additional object instantiation overhead
- **Maintainable**: Related logic stays together in the same file
- **Type Safety**: Full TypeScript intellisense and type checking

**Implementation Pattern:**

```typescript
import { test } from '@playwright/test';

class ChatAppPage extends ChatPageBase implements IChatActions, IChatAssertions {
  // ==================== ACTION METHODS ====================
  async sendMessage(message: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Sending message: "${message}"`, async () => {
      await this.conversationWindow.sendMessage(message, {
        stepInfo: options?.stepInfo ?? `Sending message ${message} in focused chat`,
      });
    });
  }

  async sendAttachment(attachmentPath: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Sending attachment: "${attachmentPath}"`, async () => {
      const chatEditor = this.conversationWindow.getChatEditorComponent();
      await chatEditor.addMediaAttachment(attachmentPath);
      await chatEditor.clickOnSendMessageButton();
    });
  }

  // ==================== ASSERTION METHODS ====================
  async verifyMessageIsVisible(message: string, options?: { timeout?: number }): Promise<void> {
    await test.step(`Verifying message "${message}" is visible`, async () => {
      await this.conversationWindow.verifyMessageIsPresentInListOfChatMessages(message, {
        timeout: options?.timeout,
      });
    });
  }

  // ==================== CLEAN API GROUPING ====================
  get actions(): IChatActions {
    return this; // Same object, but TypeScript only shows action methods
  }

  get assertions(): IChatAssertions {
    return this; // Same object, but TypeScript only shows assertion methods
  }
}
```

**Integration with Framework:**

- **Page Methods**: Replace the need for separate helper classes while maintaining clean APIs
- **Components**: Continue to provide granular UI interactions (unchanged)
- **Tests**: Call page methods directly via the grouped interfaces
- **Backward Compatibility**: Existing component and page structure remains the same

**Usage in Tests:**

```typescript
// Clean, discoverable API - IDE shows only relevant methods
await chatPage.actions.sendMessage('Hello!');
await chatPage.actions.sendAttachment('path/to/file.pdf');
await chatPage.assertions.verifyMessageIsVisible('Hello!');

// Direct component access still available for advanced scenarios
await chatPage.conversationWindow.getChatEditorComponent().inputTextBox.fill('Advanced input');
```

**Guidance:**

- **Start simple**: For new pages, begin with inline methods in a single class
- **Refactor when needed**: If a class exceeds ~50 methods, consider the base class inheritance pattern
- **Use interface grouping**: Always provide `actions` and `assertions` getters for clean APIs
- **Maintain discoverability**: Interfaces should expose the most commonly used methods

### Test Organization

- **UI Tests:** Located under `src/modules/<module>/tests/ui-tests/`
- **API Tests:** Located under `src/modules/<module>/tests/api-tests/`
- **Test Data:** Place module-specific test data in `test-data/` subfolders.

### Configuration

- **Base Config:** `playwright.base.config.ts` contains shared Playwright settings.
- **Module Config:** Each module can override or extend the base config (e.g., `playwright.chat.config.ts`).

## Custom Reporting

- The framework includes a custom report converter (`convert-report.js`) to generate enhanced HTML summaries from Playwright JSON results.
- Reports are served from the `playwright-report/` directory.

## Adding a New Module

### 🚀 Quick Module Creation (Recommended)

The fastest way to create a new module:

```sh
npm run create:module
```

This will:

- Prompt for module name
- Create complete directory structure
- Generate template files with proper placeholders
- Set up environment configurations
- Create empty directories for future use
- Make the module immediately available to the interactive test runner

**Example:**

```sh
$ npm run create:module

🚀 Module Creation Tool

📁 Enter module name: my-feature

Creating module: my-feature
📋 Copying template structure...
🔄 Replacing placeholders...
📝 Renaming files...
📁 Creating empty directories...

✅ Module 'my-feature' created successfully!

📚 Next steps:
  1. Navigate to: src/modules/my-feature/
  2. Add your test tags in: constants/testTags.ts
  3. Configure environments in: env/
  4. Add your test data in: test-data/my-feature.test-data.ts
  5. Run: npm test (to test the new module)

🎯 Your module is ready for the interactive test runner!
```

### Manual Module Creation

If you prefer to create modules manually:

1. **Create Module Structure**: Create a new folder under `src/modules/<your-module>` following the same structure as existing modules.

2. **Set Up Test Tags**: Create `src/modules/<your-module>/constants/testTags.ts`:

   ```typescript
   export enum YOUR_MODULE_FEATURE_TAGS {
     FEATURE_A = '@feature-a',
     FEATURE_B = '@feature-b',
     // Add module-specific feature tags
   }

   export enum YOUR_MODULE_SUITE_TAGS {
     SUITE_A = '@suite-a',
     SUITE_B = '@suite-b',
     // Add module-specific test suite tags
   }

   export const YOUR_MODULE_TEST_TAGS = [
     ...Object.values(YOUR_MODULE_FEATURE_TAGS),
     ...Object.values(YOUR_MODULE_SUITE_TAGS),
   ] as const;

   export default YOUR_MODULE_TEST_TAGS;
   ```

3. **Create Environment Files**: Add environment-specific config files in `src/modules/<your-module>/env/`:
   - `qa.env`
   - `uat.env`
   - etc.

4. **Choose Page Architecture**: Select the appropriate page class pattern based on complexity:
   - **Simple modules**: Use single class pattern with inline methods
   - **Complex modules**: Use base class inheritance pattern
   - **Multiple UX variants**: Use interface inheritance hierarchy

5. **Add Playwright Config**: Create `src/modules/<your-module>/playwright.<your-module>.config.ts` extending the base config.

6. **Register Shared Logic**: Add any shared logic to `src/core` if it could be reused by other modules.

7. **Test the Integration**: The interactive test runner will automatically discover your new module and its tags!

## Contributing

- Follow the existing structure for maximum maintainability.
- Place all shared logic in `src/core`.
- Place module-specific logic in the appropriate module folder.
- Use TypeScript for all code.
- Format code with Prettier (`npm run format`).
- Lint code with ESLint.

## Tooling & Dependencies

- [Playwright](https://playwright.dev/) for browser automation
- [TypeScript](https://www.typescriptlang.org/) for type safety and direct execution via ts-node
- [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) for code quality
- [Faker](https://fakerjs.dev/) for test data generation
- [http-server](https://www.npmjs.com/package/http-server) for serving reports
- [inquirer](https://www.npmjs.com/package/inquirer) for interactive CLI prompts
- [ts-node](https://www.npmjs.com/package/ts-node) for direct TypeScript execution
- [cross-env](https://www.npmjs.com/package/cross-env) for cross-platform environment variables

## Best Practices for Writing Tests

### 1. Add Test Metadata

Always annotate your test cases with relevant metadata for traceability and reporting. Use the `tagTest` utility from `@core/utils/testDecorator` to add:

- Zephyr test case ID
- Story ID
- Custom tags
- Descriptions

**Example:**

```typescript
import { tagTest } from '@core/utils/testDecorator';

test('My test case', async () => {
  tagTest(test.info(), {
    zephyrTestId: 'CONT-1234',
    storyId: 'STORY-5678',
    description: 'Verify user can send a message',
    customTags: ['@direct-message'],
  });
  // ...test steps...
});
```

### 2. Categorize Tests with Tags

Use enums/constants to tag your tests for filtering and reporting:

- **Test Type:** Use `TestGroupType` (e.g., SMOKE, REGRESSION)
- **Test Priority:** Use `TestPriority` (e.g., P0, P1)

**Example:**

```typescript
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

test(
  'Critical smoke test',
  {
    tag: [TestPriority.P0, TestGroupType.SMOKE],
  },
  async () => {
    // ...test steps...
  }
);
```

### 4. Use Action & Assertion Methods for Clarity

- Prefer using page action and assertion methods directly (e.g., `chatPage.actions.sendMessage()`, `chatPage.assertions.verifyMessageIsVisible()`) for common flows and verifications. This provides a clean and discoverable API for most test scenarios.
- You can still use direct component/page access for advanced or one-off needs. If you find yourself repeating such logic, promote it to an inline method.
- **Note:** Using inline methods with interface grouping is the recommended pattern to prevent class bloat and make maintenance easier, while providing clean, discoverable APIs.

**Example:**

```typescript
// Good: Using interface-grouped methods for clarity and reuse
await chatPage.actions.openDirectMessageWithUser('Alice');
await chatPage.actions.sendMessage('Hello!');
await chatPage.assertions.verifyMessageIsVisible('Hello!');

// Still possible: Direct access for advanced/one-off needs
await chatPage.conversationWindow.getChatEditorComponent().inputTextBox.fill('Advanced input');
```

**Guidance:**

- Start simple: focus on building the right components and writing correct, meaningful tests.
- Don't force every action/assertion into an interface from the start.
- As patterns emerge and code is duplicated, move common logic into inline methods with proper interface grouping.
- This keeps the codebase lean and avoids unnecessary abstraction.

### 5. Full Example

This example from `user-chat.spec.ts` demonstrates the framework's design patterns. The test is readable and high-level, calling inline methods from the page class.

```typescript
import { dmTestFixture as test } from '@chat/fixtures/dmFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { CHAT_TEST_DATA } from '@chat/test-data/chat.test-data';
import { TestGroupType } from '@core/constants/testType';
import { ChatTestUser } from '@chat/types/chat-test.type';
import { ChatAppPage } from '@chat/pages/chatsPage';

test.describe('Direct Message between multiple users', { tag: ['@direct-message'] }, () => {
  let user1: ChatTestUser;
  let user2: ChatTestUser;
  let user1ChatPage: ChatAppPage;
  let user2ChatPage: ChatAppPage;

  test.beforeEach(
    'Setting up the test environment, by creating 2 new users to tenant so to test out messaging between them',
    async ({ endUsersForChat, user1Page, user2Page }) => {
      user1 = endUsersForChat[0];
      user2 = endUsersForChat[1];
      user1ChatPage = new ChatAppPage(user1Page);
      user2ChatPage = new ChatAppPage(user2Page);
      await Promise.all([user1ChatPage.visitPage({ timeout: 40_000 }), user2ChatPage.visitPage({ timeout: 40_000 })]);
    }
  );

  test(
    'Verify that user 1 can open direct message with user 2 and they both are able to send message to each other',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'CONT-5376',
      });

      // User 1 creates new chat with user 2 using inline method
      await user1ChatPage.actions.openDirectMessageWithUser(user2.fullName, {
        stepInfo: `User 1 opening direct message with ${user2.fullName}`,
      });

      // User 1 sends message to user 2 using inline method
      await user1ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `User 1 sending message to user 2`,
      });

      // Verify user 2 sees the message appearing in his inbox
      await user2ChatPage.actions.openUserDirectMessageItemInInbox(user1.fullName, {
        stepInfo: `Verifying user 2 is able to see user 1 in his inbox and opening the direct message with user 1`,
        timeout: 40_000,
      });

      await user2ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
        stepInfo: `User 2 sending message ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} to user 1`,
      });

      // Verify user 1 is able to see the message from user 2 using inline assertion method
      await user1ChatPage.assertions.verifyMessageIsVisible(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
        stepInfo: `Verifying user 1 is able to see the message ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} from user 2`,
      });

      // User 1 sends message to user 2 in DM window
      await user1ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `User 1 sending message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL} to user 2`,
      });

      // Verify that user 2 is able to see the message from user 1 in his DM window
      await user2ChatPage.assertions.verifyMessageIsVisible(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `Verifying user 2 is able to see the message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL} from user 1`,
      });
    }
  );
});
```

---

For more details, refer to the codebase and module-specific files. Contributions and suggestions are welcome!

## Managing Environment-Specific Data

Environment-specific configuration (such as API endpoints, credentials, or feature flags) is managed using `.env`-style files located in each module's `env/` directory.

**Module-based Environment Structure:**

```
src/modules/chat/env/
├── qa.env      # QA environment config
├── uat.env     # UAT environment config
└── prod.env    # Production environment config
```

**How it works:**

- **Interactive Runner**: Automatically detects available environments for the selected module
- **Direct Commands**: Use environment name as parameter (`npm run test:module chat P0 qa`)
- **Traditional Scripts**: Set `TEST_ENV` variable (`TEST_ENV=qa npm run test:chat`)

**Example usage:**

```sh
# Interactive (auto-detects environments)
npm test

# Direct module runner
npm run test:module chat P0 qa

# Traditional approach
TEST_ENV=qa npm run test:chat
```

The framework automatically loads the appropriate environment file and injects variables into your tests.

---

## Playwright Configuration Structure

The framework uses a layered Playwright configuration approach for flexibility and maintainability:

- **Base Configuration:**  
  `playwright.base.config.ts`  
  Contains all common Playwright settings (timeouts, reporters, device settings, etc.) shared across modules.

- **Module-Specific Configuration:**  
  Each module can extend or override the base config.  
  For example, `src/modules/chat/playwright.chat.config.ts` imports the base config and customizes it for the chat module (e.g., test directory, browser launch options).

**How to extend:**

```typescript
// src/modules/chat/playwright.chat.config.ts
import baseConfig from '../../../playwright.base.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  // Module-specific overrides here
});
```

**Best Practice:**  
Always put shared settings in the base config and only override in the module config when necessary.

---
