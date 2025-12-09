#!/usr/bin/env ts-node

import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';

// ANSI colors for better UX
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

async function createModule() {
  try {
    console.log(`${colors.bold}${colors.blue}🚀 Module Creation Tool${colors.reset}\n`);

    const { moduleName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'moduleName',
        message: '📁 Enter module name:',
        validate: (input: string) => {
          if (!input.trim()) return 'Module name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Module name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
          }
          if (fs.existsSync(path.join(__dirname, '..', 'src', 'modules', input))) {
            return `Module '${input}' already exists`;
          }
          return true;
        },
        filter: (input: string) => input.trim().toLowerCase(),
      },
    ]);

    console.log(`\n${colors.yellow}Creating module: ${moduleName}${colors.reset}`);

    const templateDir = path.join(__dirname, 'templates', 'module');
    const targetDir = path.join(__dirname, '..', 'src', 'modules', moduleName);

    // Check if template directory exists
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    // 1. Copy entire template structure
    console.log('📋 Copying template structure...');
    await fs.copy(templateDir, targetDir);

    // 2. Replace placeholders in all files
    console.log('🔄 Replacing placeholders...');
    await replacePlaceholders(targetDir, moduleName);

    // 3. Rename files with module name
    console.log('📝 Renaming files...');
    await renameFiles(targetDir, moduleName);

    // 4. Create empty directories
    console.log('📁 Creating empty directories...');
    await createEmptyDirectories(targetDir);

    console.log(`\n${colors.green}${colors.bold}✅ Module '${moduleName}' created successfully!${colors.reset}\n`);

    // Show next steps
    console.log(`${colors.blue}📚 Next steps:${colors.reset}`);
    console.log(`  1. Navigate to: src/modules/${moduleName}/`);
    console.log(`  2. Add your test tags in: constants/testTags.ts`);
    console.log(`  3. Configure environments in: env/`);
    console.log(`  4. Add your test data in: test-data/${moduleName}.test-data.ts`);
    console.log(`  5. Run: npm test (to test the new module)`);
    console.log(`\n${colors.yellow}🎯 Your module is ready for the interactive test runner!${colors.reset}`);
  } catch (error: any) {
    console.error(`\n${colors.red}❌ Error creating module: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function replacePlaceholders(dir: string, moduleName: string) {
  const files = await fs.readdir(dir, { recursive: true });

  for (const file of files) {
    if (typeof file === 'string' && file.endsWith('.template')) {
      const filePath = path.join(dir, file);
      let content = await fs.readFile(filePath, 'utf8');

      // Replace placeholders
      content = content
        .replace(/\{\{MODULE_NAME\}\}/g, moduleName)
        .replace(/\{\{MODULE_NAME_UPPER\}\}/g, moduleName.toUpperCase().replace(/-/g, '_'))
        .replace(
          /\{\{MODULE_NAME_CAMEL\}\}/g,
          moduleName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
        );

      await fs.writeFile(filePath, content);
    }
  }
}

async function renameFiles(dir: string, moduleName: string) {
  // Rename template files to actual names
  const renames = [
    ['playwright.module.config.ts.template', `playwright.${moduleName}.config.ts`],
    ['module.test-data.ts.template', `${moduleName}.test-data.ts`],
    ['module.type.ts.template', `${moduleName}.type.ts`],
  ];

  for (const [from, to] of renames) {
    const fromPath = path.join(dir, from);
    const toPath = path.join(dir, to);

    if (await fs.pathExists(fromPath)) {
      await fs.move(fromPath, toPath);
    }
  }

  // Remove .template extension from all remaining files
  const files = await fs.readdir(dir, { recursive: true });
  for (const file of files) {
    if (typeof file === 'string' && file.endsWith('.template')) {
      const oldPath = path.join(dir, file);
      const newPath = oldPath.replace('.template', '');
      await fs.move(oldPath, newPath);
    }
  }
}

async function createEmptyDirectories(targetDir: string) {
  const emptyDirs = [
    'api/interfaces',
    'api/services',
    'components',
    'fixtures',
    'helpers',
    'pages',
    'test-data-builders',
    'tests/api-tests',
    'tests/ui-tests',
  ];

  for (const dir of emptyDirs) {
    const dirPath = path.join(targetDir, dir);
    await fs.ensureDir(dirPath);

    // Add .gitkeep to ensure empty directories are tracked
    await fs.writeFile(path.join(dirPath, '.gitkeep'), '');
  }
}

// Run the script
// eslint-disable-next-line @typescript-eslint/no-floating-promises
createModule();
