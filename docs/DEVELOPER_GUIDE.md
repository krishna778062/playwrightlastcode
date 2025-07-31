# 🛠️ Developer Guide

This guide helps you get started with the development workflow and tooling for the Central UI Automation Framework.

## 🚀 Quick Setup

After cloning the repository, run these commands:

```bash
# Install dependencies (this will also set up git hooks automatically)
npm install

# Verify everything is working
npm run format:check
npm run lint:check
npm run type-check
```

## 🎯 Development Workflow

### 1. **Writing Code**

- Use VS Code with the recommended extensions for the best experience
- Code will be automatically formatted on save
- Import statements will be automatically organized

### 2. **Before Committing**

- Pre-commit hooks will automatically run when you commit
- They will check and fix formatting, linting issues
- If checks fail, the commit will be blocked until issues are resolved

### 3. **Commit Messages**

Follow the conventional commit format:

```bash
# ✅ Good examples
git commit -m "feat: add user login functionality"
git commit -m "fix: resolve chat message display issue"
git commit -m "test: add tests for message validation"
git commit -m "docs: update API documentation"

# ❌ Bad examples
git commit -m "fixed stuff"
git commit -m "Update file"
git commit -m "WIP"
```

## 📝 Commit Message Types

| Type       | Description           | Example                               |
| ---------- | --------------------- | ------------------------------------- |
| `feat`     | New feature           | `feat: add dark mode toggle`          |
| `fix`      | Bug fix               | `fix: resolve login validation error` |
| `test`     | Adding/updating tests | `test: add chat message tests`        |
| `docs`     | Documentation changes | `docs: update setup instructions`     |
| `style`    | Code style/formatting | `style: fix indentation`              |
| `refactor` | Code refactoring      | `refactor: extract message utility`   |
| `chore`    | Maintenance tasks     | `chore: update dependencies`          |

## 🔧 Available Scripts

### **Code Quality**

```bash
npm run format          # Fix formatting issues
npm run format:check    # Check formatting (CI)
npm run lint           # Fix linting issues
npm run lint:check     # Check linting (CI)
npm run type-check     # Check TypeScript types
```

### **Testing**

```bash
# Chat module
npm run test:chat
npm run test:chat:P0     # Priority 0 tests only
npm run test:chat:smoke  # Smoke tests only

# Content module
npm run test:content
npm run test:content:P0
npm run test:content:smoke

# Global search module
npm run test:global-search
npm run test:global-search:P0
npm run test:global-search:smoke
```

### **Reports**

```bash
npm run generate-report  # Generate HTML report
npm run serve-report     # Serve report locally at http://localhost:3000
```

## 🔍 VS Code Integration

### **Recommended Extensions**

When you open the project in VS Code, you'll be prompted to install recommended extensions:

- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Playwright Test** - Test running and debugging
- **Error Lens** - Inline error highlighting
- **Path Intellisense** - Auto-complete for file paths

### **Debug Configuration**

Use VS Code's debug panel with these pre-configured options:

- **Debug Playwright Tests** - Debug all tests
- **Debug Chat Tests** - Debug chat module tests only
- **Debug Current Test File** - Debug the currently open test file

## 🚫 What Happens When Rules Are Broken

### **Pre-commit Hook Failures**

If pre-commit checks fail:

```bash
# Example error output
🔍 Running pre-commit checks...
✖ Some errors found:
  - ESLint found 3 issues in src/modules/chat/pages/chatPage.ts
  - Prettier formatting issues in 2 files

# Fix the issues and try again
npm run lint    # Auto-fix linting issues
npm run format  # Auto-fix formatting issues
git add .       # Re-stage fixed files
git commit -m "your message"  # Commit again
```

### **Commit Message Validation**

If your commit message doesn't follow conventions:

```bash
# Error example
📝 Validating commit message...
✖ type must be one of [feat, fix, docs, style, refactor, test, chore, ci, build, revert]
✖ subject must not be sentence-case, start-case, pascal-case, upper-case

# Fix and retry
git commit -m "feat: add proper commit message"
```

## 🎨 Import Organization

Imports are automatically organized in this order:

```typescript
// 1. External libraries
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// 2. Internal modules (using path mapping)
import { BasePage } from '@core/pages/basePage';
import { ChatTestUser } from '@chat/types/chat-test.type';

// 3. Relative imports
import '../styles/chat.css';
import './component.scss';
```

## 🆘 Troubleshooting

### **Hook Setup Issues**

If git hooks aren't working:

```bash
# Reinstall Husky
npx husky install
chmod +x .husky/pre-commit .husky/commit-msg
```

### **ESLint/Prettier Conflicts**

Our configuration ensures ESLint and Prettier work together. If you see conflicts:

```bash
# Reset to our configuration
npm run format
npm run lint
```

### **ESLint Configuration Issues**

If you see ESLint configuration errors after updates:

```bash
# Clear ESLint cache and retry
rm -f .eslintcache
npm run lint:check
```

**Note:** Our ESLint configuration is written in **TypeScript** (`eslint.config.ts`) for better type safety and IntelliSense when modifying linting rules.

### **VS Code Not Formatting**

1. Install the Prettier extension
2. Set Prettier as default formatter: `Ctrl/Cmd + Shift + P` → "Format Document With" → Choose Prettier
3. Enable "Format On Save" in VS Code settings

### **TypeScript Errors**

```bash
# Check for type errors
npm run type-check

# Common solutions:
# 1. Update imports after file moves
# 2. Add proper type annotations
# 3. Check tsconfig.json path mappings
```

## 💡 Tips for QAs

### **Test Automation Friendly Rules**

Our linting rules are **specifically relaxed for test automation**:

- ✅ **`console.log` allowed** - Great for debugging test failures
- ✅ **`any` types allowed** - Test data is often dynamic
- ✅ **Unused variables = warnings** - Not errors, won't block commits
- ✅ **Focus on import organization** - Automatic sorting keeps code clean
- ✅ **Formatting handled automatically** - No manual work needed

### **Writing Tests**

- Use the existing page object methods via `page.actions.doSomething()`
- Follow the test metadata pattern with `tagTest()`
- Use descriptive test names and step information
- Leverage VS Code debugging for troubleshooting
- Add `console.log` statements freely for debugging

### **Working with Imports**

- Use path mappings: `@core/`, `@chat/`, etc. instead of relative paths
- Let ESLint auto-organize imports for you
- VS Code will suggest correct import paths

### **Code Consistency**

- Don't worry about formatting - Prettier handles it automatically
- Focus on writing clear, readable test logic
- Use TypeScript types when helpful, but `any` is allowed for test flexibility
- Console statements are allowed for debugging tests
- Unused variables will show warnings, not errors (prefix with `_` to ignore)

## 🔗 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**Need help?** Check the team documentation or ask in the QA channel! 🚀
