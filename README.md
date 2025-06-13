# Central UI Automation Framework

A centralized, scalable, and modular end-to-end UI automation framework built with [Playwright](https://playwright.dev/) and TypeScript. This framework is designed to support multiple product modules (e.g., chat) while enforcing best practices for code reuse, maintainability, and clarity.

## Core Principles

- **Centralization of Common Logic:**
  - All shared utilities, base classes, API clients, types, and constants reside in `src/core`.
  - This ensures maximum code reuse and a single source of truth for common logic.
- **Modularization:**
  - Module-specific APIs, pages, components, helpers, and tests are organized under `src/modules/<module-name>` (e.g., `src/modules/chat`).
  - Each module is self-contained, making it easy to extend or add new modules.

## Directory Structure

```
central-ui-automation/
├── src/
│   ├── core/                # Shared utilities, base classes, API clients, types, constants
│   │   ├── api/             # Core API clients, services, interfaces, factories
│   │   ├── builders/        # Shared builder patterns
│   │   ├── components/      # Shared UI components (if any)
│   │   ├── constants/       # Shared constants (e.g., environments, timeouts)
│   │   ├── pages/           # Shared page objects (if any)
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # Shared utility functions
│   └── modules/
│       └── chat/            # Example module: Chat
│           ├── api/         # Module-specific API services and interfaces
│           ├── builders/    # Module-specific builders
│           ├── components/  # Module-specific UI components
│           ├── helpers/     # Module-specific helpers
│           ├── pages/       # Module-specific page objects
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

## Framework Design

### Core (`src/core`)

- **api/**: Contains base API clients, shared services, interfaces, and factories for API instantiation.
- **utils/**: Shared utility functions (e.g., environment loader, test data generators, browser factory).
- **types/**: Shared TypeScript types (e.g., user, group, API types).
- **constants/**: Shared constants (e.g., environment names, timeouts, paths).

### Modules (`src/modules/<module>`)

- Each module (e.g., `chat`) contains its own APIs, pages, components, helpers, builders, types, and tests.
- **api/**: Module-specific API services and interfaces.
- **pages/**: Page objects for UI automation.
- **components/**: UI components specific to the module.
- **tests/**: Contains `ui-tests` and `api-tests` for the module.

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

---

For more details, refer to the codebase and module-specific files. Contributions and suggestions are welcome!
