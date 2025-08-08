import { Page, expect } from '@playwright/test';

export type UserType = 'Admin' | 'EndUser' | 'Manager' | 'SystemAdmin' | 'SystemEndUser' | 'SuccessFactor';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginOptions {
  maxRetries?: number;
  timeout?: number;
  skipIfLoggedIn?: boolean;
}

// User credential mappings
const USER_CREDENTIALS: Record<UserType, Record<string, string>> = {
  Admin: {
    Email: 'APP_MANAGER_USERNAME',
    Mobile: 'QA_MOBILE',
    'Employee number': 'QA_ALTERNATE',
    Phone: 'QA_ALTERNATE_PHONE',
    password: 'APP_MANAGER_PASSWORD',
  },
  EndUser: {
    Email: 'End_USER_USERNAME',
    Mobile: 'QA_END_MOBILE',
    'Employee number': 'QA_END_ALTERNATE',
    Phone: 'QA_END_ALTERNATE_PHONE',
    password: 'End_USER_PASSWORD',
  },
  Manager: {
    Email: 'QA_MANAGER_EMAIL',
    password: 'QA_MANAGER_PASSWORD',
  },
  SystemAdmin: {
    Email: 'QA_SYSTEM_ADMIN_USERNAME',
    password: 'QA_SYSTEM_ADMIN_PASSWORD',
  },
  SystemEndUser: {
    Email: 'QA_SYSTEM_END_USER_USERNAME',
    password: 'QA_SYSTEM_END_USER_PASSWORD',
  },
  SuccessFactor: {
    Email: 'QA_SUCCESS_FACTOR_USERNAME',
    password: 'QA_SUCCESS_FACTOR_USER_PASSWORD',
  },
};

/**
 * Get environment variable with validation
 * @param key Environment variable key
 * @returns Environment variable value
 * @throws Error if environment variable is not set
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get credentials for a specific user type and identifier type
 * @param userType Type of user
 * @param identifierType Type of identifier (Email, Mobile, etc.)
 * @returns Login credentials
 */
function getCredentials(userType: UserType, identifierType: string): LoginCredentials {
  const userConfig = USER_CREDENTIALS[userType];
  if (!userConfig) {
    throw new Error(`Unsupported user type: ${userType}`);
  }

  // For non-Admin/EndUser types, default to Email
  const usernameKey = userConfig[identifierType] || userConfig.Email;
  const passwordKey = userConfig.password;
  if (!usernameKey || !passwordKey) {
    throw new Error(`No credentials configured for ${userType} with identifier type: ${identifierType}`);
  }
  return {
    username: getRequiredEnv(usernameKey),
    password: getRequiredEnv(passwordKey),
  };
}

/**
 * Check if user is already logged in
 * @param page Playwright page
 * @returns True if already logged in
 */
async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check for profile button with exact aria-label
    await page.waitForSelector('button[aria-label="Profile settings"]', {
      timeout: 3000,
    });
    return true;
  } catch {
    // Fallback check for dashboard/home page content
    try {
      await page.waitForSelector('heading:has-text("Home -"), h1:has-text("Home -")', {
        timeout: 2000,
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Detect identifier input type from page
 * @param page Playwright page
 * @returns Identifier type
 */
async function detectIdentifierType(page: Page): Promise<string> {
  try {
    // Wait for the first label to appear and get its text
    const label = page.locator('label').first();
    await label.waitFor({ timeout: 10000 });
    const labelText = await label.innerText();

    // Determine identifier type based on label content
    if (labelText.includes('Email')) return 'Email';
    if (labelText.includes('Mobile')) return 'Mobile';
    if (labelText.includes('Employee number')) return 'Employee number';
    if (labelText.includes('Phone')) return 'Phone';

    // Default to Email if no match
    return 'Email';
  } catch (error) {
    console.warn('Could not detect identifier type, defaulting to Email');
    return 'Email';
  }
}

/**
 * Perform login steps
 * @param page Playwright page
 * @param credentials Login credentials
 * @param timeout Timeout for operations
 */
async function performLogin(page: Page, credentials: LoginCredentials, timeout: number = 30000): Promise<void> {
  // Fill username/identifier
  const usernameInput = page.locator('#inputOption');
  await usernameInput.waitFor({ state: 'visible', timeout });
  await usernameInput.fill(credentials.username);

  // Click continue button
  const continueButton = page.getByRole('button', { name: /continue/i });
  await continueButton.click();

  // Fill password
  const passwordInput = page.locator('#inputPassword');
  await passwordInput.waitFor({ state: 'visible', timeout });
  await passwordInput.fill(credentials.password);

  // Click sign in button
  const signInButton = page.getByRole('button', { name: /sign in/i });
  await signInButton.click();

  // Wait for successful login (dashboard or home page)
  await page.waitForURL(/\/(home|dashboard)($|\/|\?)/, { timeout });
}

/**
 * Login to QA environment
 * @param page Playwright page
 * @param userType Type of user to login as
 * @param options Login options
 */
export async function loginToQAEnv(page: Page, userType: UserType, options: LoginOptions = {}): Promise<void> {
  const { timeout = 30000, skipIfLoggedIn = true } = options;

  try {
    // Check if already logged in
    if (skipIfLoggedIn && (await isLoggedIn(page))) {
      console.log('User already logged in, skipping login process');
      // Wait for dashboard to fully load
      await page.waitForTimeout(5000);
      console.log('Dashboard fully loaded, ready for next steps');
      return;
    }

    // Navigate to login page
    const baseUrl = getRequiredEnv('FRONTEND_BASE_URL');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout });
    const identifierType = await detectIdentifierType(page);

    // Get credentials
    const credentials = getCredentials(userType, identifierType);
    console.log(`Logging in as ${userType} with ${identifierType}`);
    await performLogin(page, credentials, timeout);

    // Wait for dashboard to fully load after login
    await page.waitForTimeout(5000);
    console.log(`Successfully logged in as ${userType} - Dashboard fully loaded`);
  } catch (error) {
    console.error(`Login failed for user type ${userType}:`, error);
    throw error;
  }
}

/**
 * Logout from the application
 * @param page Playwright page
 */
export async function logout(page: Page): Promise<void> {
  try {
    // Look for profile/user menu using exact aria-label
    const profileButton = page.locator('button[aria-label="Profile settings"]');
    await profileButton.click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    try {
      const logoutButton = page.getByText('Log out').first();
      await logoutButton.click({ timeout: 5000 });
    } catch (error1) {
      try {
        const logoutMenuItem = page.getByRole('menuitem', { name: /log out/i });
        await logoutMenuItem.click({ timeout: 5000 });
      } catch (error2) {
        const logoutLink = page.locator('a[href="/logout"]');
        await logoutLink.click({ timeout: 5000 });
      }
    }

    // Wait for redirect to login page
    await page.waitForURL(/login|signin/, { timeout: 30000 });
    console.log('Successfully logged out');
  } catch (error) {
    console.warn('Logout failed, but continuing:', (error as Error).message);
  }
}
