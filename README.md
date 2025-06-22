# Central UI Automation Framework

A centralized, scalable, and modular end-to-end UI automation framework built with [Playwright](https://playwright.dev/) and TypeScript. This framework is designed to support multiple product modules (e.g., chat) while enforcing best practices for code reuse, maintainability, and clarity.

## Core Principles

- **Centralization of Common Logic:**
  - All shared utilities, base classes, API clients, types, and helpers reside in `src/core`.
  - This ensures maximum code reuse and a single source of truth for common logic.
- **Layered Architecture:**
  - **Tests:** Describe the business logic and user flow. They should be readable and high-level.
  - **Helpers:** Act as a "driver" or "interface" layer. They orchestrate complex, multi-step user actions (e.g., `openDirectMessageWithUser`). Tests should call helpers, not page objects directly.
  - **Page Objects/Components:** Represent the UI. They provide the low-level "tools" (locators and basic interactions like `click` or `fill`) for helpers to use.
- **Modularization:**
  - Module-specific APIs, pages, components, helpers, and tests are organized under `src/modules/<module-name>` (e.g., `src/modules/chat`).
  - Each module is self-contained, making it easy to extend or add new modules.

## Directory Structure

```
central-ui-automation/
├── src/
│   ├── core/                # Shared utilities, base classes, API clients, types, constants
│   │   ├── api/             # Core API clients, services, interfaces, factories
│   │   ├── components/      # Shared UI components (if any)
│   │   ├── constants/       # Shared constants (e.g., environments, timeouts)
│   │   ├── helpers/         # Shared, stateless action helpers (e.g., LoginHelper)
│   │   ├── pages/           # Shared page objects (e.g., LoginPage, HomePage)
│   │   ├── test-data-builders/ # Shared test data builder patterns
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # Shared utility functions
│   └── modules/
│       └── chat/            # Example module: Chat
│           ├── api/         # Module-specific API services and interfaces
│           ├── components/  # Module-specific UI components
│           ├── helpers/     # Module-specific helpers (e.g., ChatHelper facade)
│           ├── pages/       # Module-specific page objects
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

### Install Dependencies

```sh
npm install
```

### Running Tests

- **Chat Module UI Tests:**
  ```sh
  npm run test:chat
  ```
- **Run Only P0 Tests:**
  ```sh
  npm run test:chat:P0
  ```
- **Run Smoke Tests:**
  ```sh
  npm run test:chat:smoke
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
- **helpers/**: Provides shared, stateless helper classes for common, reusable actions (e.g., `LoginHelper`).
- **utils/**: Shared utility functions (e.g., environment loader, test data generators, browser factory).
- **test-data-builders/**: Shared builder patterns for creating test data.
- **types/**: Shared TypeScript types (e.g., user, group, API types).
- **constants/**: Shared constants (e.g., environment names, timeouts, paths).

### Modules (`src/modules/<module>`)

Each module (e.g., `chat`) contains its own APIs, pages, components, helpers, builders, types, and tests.

- **api/**: Module-specific API services and interfaces.
- **pages/**: Page objects for UI automation. A Page Object should only provide locators and simple, granular interactions (`clickButton`, `fillInput`). It should not contain complex business logic.
- **components/**: UI components specific to the module, following the same principles as Page Objects.
- **helpers/**: This is the "driver" or "controller" layer for your tests. Helpers orchestrate sequences of actions on pages and components to perform a complete business action (e.g., `openDirectMessageWithUser`).
  - **Facade Pattern:** For discoverability, a module should expose a single entry-point helper (e.g., `ChatHelper`). This facade provides access to more specialized helpers (e.g., `ChatHelper.directMessages`, `ChatHelper.common`).
- **tests/**: Contains `ui-tests` and `api-tests` for the module. Tests should be clean, readable, and call methods from the helper layer.
- **test-data-builders/**: Module-specific logic for building complex test data.

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

1. Create a new folder under `src/modules/<your-module>`.
2. Follow the same structure as the `chat` module for APIs, pages, components, helpers, and tests.
3. Register any shared logic in `src/core` if it could be reused by other modules.
4. Add or extend Playwright config as needed.

## Contributing

- Follow the existing structure for maximum maintainability.
- Place all shared logic in `src/core`.
- Place module-specific logic in the appropriate module folder.
- Use TypeScript for all code.
- Format code with Prettier (`npm run format`).
- Lint code with ESLint.

## Tooling & Dependencies

- [Playwright](https://playwright.dev/) for browser automation
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) for code quality
- [Faker](https://fakerjs.dev/) for test data generation
- [http-server](https://www.npmjs.com/package/http-server) for serving reports

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

### 3. Full Example

This example from `user-chat.spec.ts` demonstrates the framework's design patterns. The test is readable and high-level, calling the `ChatHelper` facade to orchestrate actions.

```typescript
import { ChatHelper } from '@chat/helpers/chatHelper';
import { TestPriority } from '@core/constants/testPriority';

test(
  'Verify that user 1 can open direct message with user 2 and they both are able to send message to each other',
  {
    tag: [TestPriority.P0],
  },
  async () => {
    tagTest(test.info(), {
      zephyrTestId: 'CONT-5376',
    });

    const [user1ChatsPage, user2ChatsPage] = await multiUserChatTest.loginMultipleUsersAndNavigateToChats();

    // User 1 creates new chat with user 2
    await ChatHelper.directMessages.openDirectMessageWithUser(user1ChatsPage, user2.fullName, {
      stepInfo: `User 1 opening direct message with ${user2.fullName}`,
    });

    // User 1 sends a message
    await ChatHelper.common.sendMessage(user1ChatsPage, 'Hello from User 1', {
      stepInfo: `User 1 sending first message`,
    });

    // User 2 opens the chat and replies
    await ChatHelper.directMessages.openUserDirectMessageItemInInbox(user2ChatsPage, user1.fullName);
    await ChatHelper.common.sendMessage(user2ChatsPage, 'Hello back from User 2!', {
      stepInfo: `User 2 replying`,
    });

    // User 1 verifies the reply is visible
    await ChatHelper.common.verifyMessageIsVisible(user1ChatsPage, 'Hello back from User 2!');
  }
);
```

---

For more details, refer to the codebase and module-specific files. Contributions and suggestions are welcome!

## Managing Environment-Specific Data

Environment-specific configuration (such as API endpoints, credentials, or feature flags) is managed using `.env`-style files located in the `env/` directory at the project root.  
Typical files include:

- `env/qa.env` — for the QA environment
- `env/uat.env` — for the UAT environment

**How it works:**

- The framework loads the appropriate environment file based on the `TEST_ENV` variable (e.g., `qa`, `uat`).
- These files are parsed at runtime to inject environment variables into your tests and application code.

**Example usage:**

```sh
TEST_ENV=qa npm run test:chat
```

This will load variables from `env/qa.env`.

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
