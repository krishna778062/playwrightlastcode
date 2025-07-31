import { test as base } from '@playwright/test';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

export type UserType = 'appManager' | 'standardUser';

export const users = {
  appManager: {
    email: process.env.APP_MANAGER_USERNAME || '',
    password: process.env.APP_MANAGER_PASSWORD || '',
  },
  standardUser: {
    email: process.env.STANDARD_USER_USERNAME || '',
    password: process.env.STANDARD_USER_PASSWORD || '',
  },
};

export const test = base.extend<{ loginAs: (userType: UserType) => Promise<void> }>({
  loginAs: async ({ page }, use) => {
    await use(async (userType: UserType) => {
      await LoginHelper.loginWithPassword(page, users[userType]);
    });
  },
}); 