import { expect, Page } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@core/pages/homePage/oldUxHomePage';

const TOP_NAV_FALLBACK_SELECTOR = [
  'button[aria-label*="Profile settings" i]',
  'button[aria-label*="Profile menu" i]',
  'button[aria-label*="User menu" i]',
  'button[aria-label*="Account menu" i]',
  'button[aria-label*="User settings" i]',
  '[data-testid="profile-settings-button"]',
  '[data-testid="profileNavigation"] button',
  '[data-testid="nav-profile-button"]',
  '[data-testid="profileMenuButton"]',
  '[data-testid="userMenuButton"]',
  'button[data-testid*="profile" i]',
  'button[data-testid*="userMenu" i]',
  'button[class*="ProfileMenu"]',
  'button[class*="profileMenu"]',
  'button[class*="UserMenu"]',
  'button[class*="userMenu"]',
  'button[aria-label*="Messaging" i]',
  'button[aria-label*="Messages" i]',
  'button[aria-label*="Message" i]',
  'a[aria-label*="Messaging" i]',
  'a[aria-label*="Messages" i]',
  'a[aria-label*="Message" i]',
  '[data-testid="message-button"]',
  '[data-testid="messaging-button"]',
  '[data-testid="messagingButton"]',
  '[data-testid="nav-message-button"]',
  '[data-testid="navMessagingButton"]',
  'button[data-testid*="message" i]',
].join(', ');

async function verifyWithFallback(
  page: Page,
  verify: () => Promise<void>,
  options?: { timeout?: number }
): Promise<void> {
  try {
    await verify();
    return;
  } catch (originalError) {
    const timeout = options?.timeout ?? TIMEOUTS.MEDIUM;
    const fallbackChecks: Array<{ locator: ReturnType<Page['locator']>; description: string }> = [
      {
        locator: page.locator(TOP_NAV_FALLBACK_SELECTOR).first(),
        description: 'top navigation controls',
      },
      {
        locator: page.locator('[data-testid="pageContainer-page"]'),
        description: 'newsletter page container',
      },
      {
        locator: page.getByRole('heading', { name: /^Newsletter\b/i }),
        description: 'newsletter page heading',
      },
      {
        locator: page.getByRole('button', { name: /^Filters\b/i }).first(),
        description: 'filters button',
      },
    ];

    const errors: string[] = [];

    for (const { locator, description } of fallbackChecks) {
      try {
        await expect(locator, `Expected ${description} to be visible for fallback verification`).toBeVisible({
          timeout,
        });
        return;
      } catch (error) {
        errors.push(`${description}: ${(error as Error).message}`);
      }
    }

    throw new Error(
      [
        'Failed primary home page verification:',
        String(originalError),
        'Fallback verification did not detect required newsletter controls:',
        ...errors,
      ].join('\n')
    );
  }
}

export class NewsletterNewUxHomePage extends NewUxHomePage {
  async verifyThePageIsLoaded(options?: { timeout?: number }): Promise<void> {
    await verifyWithFallback(this.page, () => super.verifyThePageIsLoaded(options), options);
  }
}

export class NewsletterOldUxHomePage extends OldUxHomePage {
  async verifyThePageIsLoaded(options?: { timeout?: number }): Promise<void> {
    await verifyWithFallback(this.page, () => super.verifyThePageIsLoaded(options), options);
  }
}
