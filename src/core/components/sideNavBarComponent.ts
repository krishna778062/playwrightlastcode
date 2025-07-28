import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';

export class SideNavBarComponent extends BaseComponent {
  readonly createSection: Locator;
  readonly feedLink: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    super(page);
    this.createSection = page.getByRole('button', { name: 'Create' });
    this.feedLink = page.locator("p").filter({ hasText: 'Feed' });
    this.homeLink = page.locator("p").filter({ hasText: 'Home' });
  }

  /**
   * Clicks on the Create button in the side navigation
   * @param options - The options for the step
   */
  async clickOnCreateButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Clicking Create button in side navigation`, async () => {
      await this.clickOnElement(this.createSection);
    });
  }

  async clickOnGlobalFeed(): Promise<void> {
    await test.step('Clicking Global Feed button in side navigation', async () => {
      if (await this.verifier.verifyTheElementIsVisible(this.feedLink)) {
        await this.clickOnElement(this.feedLink);
      } else {
        await this.clickOnElement(this.homeLink);
      }
    });
  }
} 