#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

// ANSI colors for better UX
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

console.log(`${colors.bold}${colors.cyan}🚀 Interactive Playwright Test Runner${colors.reset}\n`);

async function getAvailableModules(): Promise<string[]> {
  const modulesDir = path.join(__dirname, '..', 'src', 'modules');
  if (!fs.existsSync(modulesDir)) return [];

  return fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
}

async function getAvailableEnvironments(moduleName: string): Promise<string[]> {
  const envDir = path.join(__dirname, '..', 'src', 'modules', moduleName, 'env');
  if (!fs.existsSync(envDir)) return [];

  return fs
    .readdirSync(envDir)
    .filter(file => file.endsWith('.env'))
    .map(file => file.replace('.env', ''))
    .sort();
}

async function getTestTags(moduleName: string): Promise<string[]> {
  const tags: string[] = [];

  try {
    // 1. Import common priority tags from core constants
    try {
      const { TestPriority } = await import('../src/core/constants/testPriority');
      const priorityTags = Object.values(TestPriority);
      tags.push(...priorityTags);
    } catch (importError: any) {
      console.warn(`${colors.yellow}⚠️  Could not import TestPriority: ${importError.message}${colors.reset}`);
    }

    // 2. Import common test type tags from core constants
    try {
      const { TestGroupType } = await import('../src/core/constants/testType');
      const testTypeTags = Object.values(TestGroupType);
      tags.push(...testTypeTags);
    } catch (importError: any) {
      console.warn(`${colors.yellow}⚠️  Could not import TestGroupType: ${importError.message}${colors.reset}`);
    }

    // 3. Import module-specific tags from testTags.ts file
    try {
      const moduleTagsModule = await import(`../src/modules/${moduleName}/constants/testTags`);

      // Use default export for easy importing
      if (moduleTagsModule.default) {
        tags.push(...moduleTagsModule.default);
      } else {
        console.warn(`${colors.yellow}⚠️  No default export found in ${moduleName} testTags.ts${colors.reset}`);
      }
    } catch (importError: any) {
      console.warn(`${colors.yellow}⚠️  Could not import ${moduleName} tags: ${importError.message}${colors.reset}`);
    }

    // Fallback if no tags were imported at all
    if (tags.length === 0) {
      console.warn(`${colors.yellow}⚠️  No tags found, using fallback tags${colors.reset}`);
      const fallbackTags = ['@P0', '@P1', '@P2', '@smoke', '@sanity', '@regression'];
      tags.push(...fallbackTags);
    }
  } catch (error: any) {
    console.warn(`${colors.yellow}⚠️  Error loading tags: ${error.message}${colors.reset}`);
    // Fallback tags
    const fallbackTags = ['@P0', '@P1', '@P2', '@smoke', '@sanity', '@regression'];
    tags.push(...fallbackTags);
  }

  // Remove duplicates, ensure @ prefix, and sort
  const uniqueTags = [...new Set(tags)].map((tag: string) => (tag.startsWith('@') ? tag : `@${tag}`)).sort();

  return uniqueTags;
}

async function main() {
  try {
    const modules = await getAvailableModules();
    if (modules.length === 0) {
      console.log(`${colors.red}❌ No modules found in src/modules/${colors.reset}`);
      process.exit(1);
    }

    // Step 1: Select Module
    const { selectedModule } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedModule',
        message: `${colors.blue}📁 Which module do you want to test?${colors.reset}`,
        choices: modules.map(module => ({
          name: `${colors.green}${module}${colors.reset}`,
          value: module,
        })),
      },
    ]);

    // Step 2: Select Environment
    const environments = await getAvailableEnvironments(selectedModule);
    let selectedEnv = '';

    if (environments.length > 0) {
      const envChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedEnv',
          message: `${colors.blue}🌍 Which environment?${colors.reset}`,
          choices: [
            ...environments.map(env => ({
              name: `${colors.green}${env}${colors.reset}`,
              value: env,
            })),
            { name: `${colors.yellow}Skip (use default)${colors.reset}`, value: '' },
          ],
        },
      ]);
      selectedEnv = envChoice.selectedEnv;
    }

    // Step 3: Select Test Types/Tags
    const availableTags = await getTestTags(selectedModule);
    const { testFilterChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'testFilterChoice',
        message: `${colors.blue}🏷️  How do you want to filter tests?${colors.reset}`,
        choices: [
          { name: `${colors.yellow}Run all tests (no filter)${colors.reset}`, value: 'all' },
          { name: `${colors.cyan}Select from common tags${colors.reset}`, value: 'select' },
          { name: `${colors.magenta}Enter custom tags${colors.reset}`, value: 'custom' },
        ],
      },
    ]);

    let selectedTags = [];

    if (testFilterChoice === 'select') {
      const tagSelection = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedTags',
          message: `${colors.blue}🏷️  Select tags (Use space to select, enter to continue)${colors.reset}`,
          choices: availableTags.map(tag => ({
            name: tag.startsWith('@')
              ? `${colors.magenta}${tag}${colors.reset}`
              : `${colors.cyan}@${tag}${colors.reset}`,
            value: tag.startsWith('@') ? tag : tag,
          })),
        },
      ]);
      selectedTags = tagSelection.selectedTags;
    } else if (testFilterChoice === 'custom') {
      const customInput = await inquirer.prompt([
        {
          type: 'input',
          name: 'customTags',
          message: `${colors.blue}🏷️  Enter tags (comma-separated, e.g. P0,smoke,@attachment):${colors.reset}`,
          validate: input => {
            if (!input.trim()) return 'Please enter at least one tag';
            return true;
          },
        },
      ]);
      selectedTags = customInput.customTags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
    }

    // Step 4: Test Configuration
    const { workers, headed } = await inquirer.prompt([
      {
        type: 'list',
        name: 'workers',
        message: `${colors.blue}⚡ How many parallel workers?${colors.reset}`,
        choices: [
          { name: `${colors.green}1 worker${colors.reset}`, value: 1 },
          { name: `${colors.green}2 workers${colors.reset}`, value: 2 },
          { name: `${colors.green}4 workers${colors.reset}`, value: 4 },
          { name: `${colors.green}Auto (default)${colors.reset}`, value: null },
        ],
      },
      {
        type: 'confirm',
        name: 'headed',
        message: `${colors.blue}👁️  Run with browser UI visible (headed mode)?${colors.reset}`,
        default: false,
      },
    ]);

    // Build command arguments for shell script: module, test-type, env, flags
    const args = [];

    // 1. Module (required)
    args.push(selectedModule);

    // 2. Test tags (optional)
    if (selectedTags.length > 0) {
      const tagString = selectedTags.length === 1 ? selectedTags[0] : `[${selectedTags.join(',')}]`;
      args.push(tagString);
    } else {
      args.push(''); // Empty string for "all tests"
    }

    // 3. Environment (optional)
    args.push(selectedEnv || '');

    // 4. Playwright flags
    if (workers !== null) args.push(`--workers=${workers}`);
    if (headed) args.push('--headed');

    console.log(`\n${colors.bold}${colors.yellow}📋 Command Preview:${colors.reset}`);
    console.log(`${colors.cyan}./scripts/test-module.sh ${args.join(' ')}${colors.reset}\n`);

    // Confirm execution
    const { execute } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'execute',
        message: `${colors.blue}🚀 Execute this command?${colors.reset}`,
        default: true,
      },
    ]);

    if (!execute) {
      console.log(`${colors.yellow}⏹️  Execution cancelled${colors.reset}`);
      process.exit(0);
    }

    // Execute the command
    console.log(`${colors.green}🏃 Running tests...${colors.reset}\n`);

    // Call the shell script with the prepared arguments
    const scriptPath = path.join(__dirname, 'test-module.sh');
    const child = spawn(scriptPath, args, {
      stdio: 'inherit',
    });

    child.on('close', code => {
      if (code === 0) {
        console.log(`\n${colors.green}✅ Tests completed successfully!${colors.reset}`);
      } else {
        console.log(`\n${colors.red}❌ Tests failed with exit code ${code}${colors.reset}`);
      }
      process.exit(code);
    });
  } catch (error: any) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}⏹️  Interrupted by user${colors.reset}`);
  process.exit(1);
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
