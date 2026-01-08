import { expect, Locator, Page } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { NewHomePage } from '@core/ui/pages/newHomePage';

/**
 * Newsletter home page adapter.
 * Extends NewHomePage and adds fallback verification logic for newsletter-specific pages.
 * Overrides the abstract verifyThePageIsLoaded() method from BasePage (inherited via NewHomePage).
 */
export class NewsletterHomePageAdapter extends NewHomePage {
  // Fallback verification locators
  readonly topNavControls: Locator;
  readonly pageContainer: Locator;
  readonly newsletterHeading: Locator;
  readonly filtersButton: Locator;

  constructor(page: Page) {
    super(page);

    // Fallback verification locators
    // Simplified top nav selectors based on actual TopNavBarComponent usage
    this.topNavControls = this.page
      .locator(
        'button[aria-label*="Profile settings" i], button[aria-label*="Messaging" i], button[aria-label*="Notifications" i]'
      )
      .first();
    this.pageContainer = this.page.locator('[data-testid="pageContainer-page"]');
    this.newsletterHeading = this.page.getByRole('heading', { name: /^Newsletter\b/i });
    this.filtersButton = this.page.getByRole('button', { name: /^Filters\b/i }).first();
  }

  async verifyThePageIsLoaded(options?: { timeout?: number }): Promise<void> {
    try {
      await super.verifyThePageIsLoaded();
      return;
    } catch (originalError) {
      const timeout = options?.timeout ?? TIMEOUTS.MEDIUM;
      const fallbackChecks: Array<{ locator: Locator; description: string }> = [
        {
          locator: this.topNavControls,
          description: 'top navigation controls',
        },
        {
          locator: this.pageContainer,
          description: 'newsletter page container',
        },
        {
          locator: this.newsletterHeading,
          description: 'newsletter page heading',
        },
        {
          locator: this.filtersButton,
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
}
