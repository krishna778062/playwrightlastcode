# Test Runner Scripts

This directory contains two powerful test runner scripts for the Playwright automation framework.

## 🚀 Interactive Test Runner (Recommended for QA)

The easiest way to run tests! Interactive prompts guide you through all options.

### Usage

```bash
# Simple command to start interactive mode
npm test

# Or explicitly
npm run test:interactive
```

### Features

- 📁 **Module Selection**: Choose from available modules (chat, content, global-search, etc.)
- 🌍 **Environment Selection**: Pick from available environments (qa, uat, test, etc.)
- 🏷️ **Tag Selection**: Choose from common tags, enter custom tags, or run all tests
- ⚡ **Worker Configuration**: Choose parallel workers (1, 2, 4, or auto)
- 👁️ **Browser Mode**: Headed (visible) or headless

### Example Flow

```
🚀 Interactive Playwright Test Runner

📁 Which module do you want to test?
❯ chat
  content
  global-search

🌍 Which environment?
❯ qa
  uat
  Skip (use default)

🏷️ How do you want to filter tests?
❯ Run all tests (no filter)
  Select from common tags
  Enter custom tags

🏷️ Select tags (Use space to select, enter to continue)
◉ P0
◉ smoke
◯ @attachment

⚡ How many parallel workers?
❯ 2 workers
  1 worker (sequential)
  4 workers
  Auto (default)

👁️ Run with browser UI visible (headed mode)? No

📋 Command Preview:
./scripts/test-module.sh chat [P0,smoke] qa --workers=2

🚀 Execute this command? Yes
```

---

## ⚡ Direct Test Runner (Advanced Users)

For developers who prefer command-line efficiency.

### Usage

```bash
# Basic usage
npm run test:module -- <module> [tags] [env] [playwright-flags...]

# Examples
npm run test:module -- chat P0 qa --workers=1
npm run test:module -- chat '[P0,smoke]' qa --headed --workers=2
npm run test:module -- integrations '@critical,regression' uat --debug
```

### Features

- **Array Syntax**: `[P0,smoke,attachment]` for multiple tags
- **Auto @ Prefix**: `P0` becomes `@P0` automatically
- **Environment Support**: Validates environment files exist
- **Full Playwright Flags**: Pass any Playwright CLI option
- **Fast Execution**: No interactive prompts

### Examples

```bash
# Single test type
npm run test:module -- chat P0 qa

# Multiple test types
npm run test:module -- chat '[P0,smoke]' qa

# With Playwright flags
npm run test:module -- chat '[P0,smoke]' qa --workers=2 --headed --debug

# Custom tags
npm run test:module -- chat '[@attachment,@fileupload]' uat --reporter=html

# All options combined
npm run test:module -- integrations '[P0,@critical]' uat \
  --workers=4 --headed --max-failures=5 --timeout=90000
```

---

## 🆚 Which Should I Use?

| Use Case                      | Recommended Tool                   |
| ----------------------------- | ---------------------------------- |
| **QA Testing**                | Interactive Runner (`npm test`)    |
| **Quick Development**         | Direct Runner                      |
| **CI/CD Pipelines**           | Direct Runner                      |
| **Learning the Framework**    | Interactive Runner                 |
| **Complex Flag Combinations** | Either (Interactive shows preview) |

---

## 📝 Adding New Modules

1. Create module directory: `src/modules/your-module/`
2. Add Playwright config: `src/modules/your-module/playwright.your-module.config.ts`
3. Add environment files: `src/modules/your-module/env/qa.env`
4. Add test tags file: `src/modules/your-module/constants/testTags.ts`

### Tag File Structure

```typescript
// src/modules/your-module/constants/testTags.ts

export enum YOUR_MODULE_FEATURE_TAGS {
  FEATURE_A = '@feature-a',
  FEATURE_B = '@feature-b',
  // ... other feature tags
}

export enum YOUR_MODULE_SUITE_TAGS {
  SUITE_A = '@suite-a',
  SUITE_B = '@suite-b',
  // ... other suite tags
}

// Combined export for the module
export const YOUR_MODULE_TEST_TAGS = [
  ...Object.values(YOUR_MODULE_FEATURE_TAGS),
  ...Object.values(YOUR_MODULE_SUITE_TAGS),
] as const;

// Default export for easy importing in interactive tool
export default YOUR_MODULE_TEST_TAGS;
```

The interactive tool will automatically detect and offer your new module with its tags! 🎉

---

## 🔧 Troubleshooting

**"Module not found"**: Ensure the module directory exists in `src/modules/`

**"Environment file not found"**: Check that `src/modules/MODULE/env/ENV.env` exists

**"npm warn Unknown cli config"**: Use `--` separator: `npm run test:module -- module tags env --flags`

**Workers not respected**: Make sure to use `--` when passing flags to the direct runner
