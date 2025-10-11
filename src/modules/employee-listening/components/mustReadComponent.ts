import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class MustReadComponent extends BaseComponent {
  // Must Read specific elements
  readonly contentThreeDotsMenu: Locator;
  readonly mustReadBanner: Locator;
  readonly mustReadLabel: Locator;
  readonly mustReadIcon: Locator;
  readonly mustReadButton: Locator;
  readonly mustReadModal: Locator;
  readonly mustReadModalTitle: Locator;
  readonly mustReadModalContent: Locator;
  readonly mustReadModalCloseButton: Locator;
  readonly mustReadConfirmButton: Locator;
  readonly mustReadCancelButton: Locator;
  readonly mustReadStatusIndicator: Locator;
  readonly mustReadCompletedIndicator: Locator;
  readonly mustReadProgressBar: Locator;
  readonly mustReadHistoryLink: Locator;
  readonly mustReadNotificationBadge: Locator;

  // Settings menu and options
  readonly settingsMenuButton: Locator;
  readonly makeMustReadOption: Locator;

  constructor(page: Page) {
    super(page);
    this.contentThreeDotsMenu = this.page.getByRole('button', { name: 'Category option' });
    this.mustReadBanner = this.page.locator('[data-testid="must-read-banner"]');
    this.mustReadLabel = this.page.locator('.must-read-label, [data-testid="must-read-label"]');
    this.mustReadIcon = this.page.locator('.must-read-icon, [data-testid="must-read-icon"]');
    this.mustReadButton = this.page.getByRole('button', { name: /must read/i });
    this.mustReadModal = this.page.locator('[data-testid="must-read-modal"], .must-read-modal');
    this.mustReadModalTitle = this.page.locator('[data-testid="must-read-modal-title"]');
    this.mustReadModalContent = this.page.locator('[data-testid="must-read-modal-content"]');
    this.mustReadModalCloseButton = this.page.locator('[data-testid="must-read-modal-close"], .modal-close');
    this.mustReadConfirmButton = this.page.getByRole('button', { name: /confirm|acknowledge/i });
    this.mustReadCancelButton = this.page.getByRole('button', { name: /cancel|close/i });
    this.mustReadStatusIndicator = this.page.locator('[data-testid="must-read-status"]');
    this.mustReadCompletedIndicator = this.page.locator('[data-testid="must-read-completed"]');
    this.mustReadProgressBar = this.page.locator('[data-testid="must-read-progress"]');
    this.mustReadHistoryLink = this.page.getByRole('link', { name: /must read history/i });
    this.mustReadNotificationBadge = this.page.locator('[data-testid="must-read-notification"]');

    // Settings menu locators
    this.settingsMenuButton = this.page.getByRole('button', { name: 'Category option' });
    this.makeMustReadOption = this.page.getByRole('button', { name: "Make 'must read'" });
  }

  /**
   * Click on content three dots menu
   */
  async clickOnContentThreeDotsMenu(): Promise<void> {
    await test.step('Click on content three dots menu', async () => {
      await this.clickOnElement(this.contentThreeDotsMenu, { force: true });
    });
  }

  /**
   * Select from menu options for must read
   */
  async selectMustReadFromMenuOptions(): Promise<void> {
    await test.step('Click on make must read option', async () => {
      await this.clickOnElement(this.makeMustReadOption, { force: true });
    });
  }

  /**
   * Verify must read element is visible
   */
  async verifyIsVisible(): Promise<void> {
    await test.step('Verify must read element is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mustReadBanner, {
        assertionMessage: 'Must read banner should be visible',
      });
    });
  }

  /**
   * Acknowledge must read
   */
  async acknowledgeMustRead(): Promise<void> {
    await test.step('Acknowledge must read', async () => {
      try {
        // Try to find and click make must read button or similar actions
        const mustReadActionSelectors = [
          this.page.getByRole('button', { name: /make.*must.*read/i }),
          this.page.getByRole('button', { name: /confirm/i }),
          this.page.getByRole('button', { name: /acknowledge/i }),
          this.page.getByRole('button', { name: /ok/i }),
          this.mustReadConfirmButton,
        ];

        for (const selector of mustReadActionSelectors) {
          try {
            if (await selector.isVisible({ timeout: 2000 })) {
              await selector.click();
              console.log('Successfully acknowledged must read');
              return;
            }
          } catch (error) {
            console.log(`Must read acknowledge selector failed: ${error}`);
            continue;
          }
        }

        throw new Error('Could not acknowledge must read');
      } catch (error) {
        console.log(`Error acknowledging must read: ${error}`);
        throw error;
      }
    });
  }

  /**
   * Click on must read button/banner
   */
  async clickMustRead(): Promise<void> {
    await test.step('Click must read button', async () => {
      try {
        // Try to find and click must read button with flexible selectors
        const mustReadClickSelectors = [
          this.mustReadButton,
          this.mustReadBanner,
          this.page.getByRole('button', { name: /must.*read/i }),
          this.page.getByText(/must.*read/i).filter({ hasText: /read/i }),
          this.page.locator('[data-testid*="must-read"]').filter({ hasText: /button|click|read/i }),
          this.page.locator('.must-read-button, .must-read-banner').first(),
        ];

        for (const selector of mustReadClickSelectors) {
          try {
            if (await selector.isVisible({ timeout: 2000 })) {
              await selector.click();
              console.log('Successfully clicked must read element');
              return;
            }
          } catch (error) {
            console.log(`Must read click selector failed: ${error}`);
            continue;
          }
        }

        throw new Error('Could not find must read element to click');
      } catch (error) {
        console.log(`Error clicking must read: ${error}`);
        throw error;
      }
    });
  }

  /**
   * Check if must read is completed
   */
  async isMustReadCompleted(): Promise<boolean> {
    return await test.step('Check if must read is completed', async () => {
      try {
        return await this.mustReadCompletedIndicator.isVisible({ timeout: 5000 });
      } catch (error) {
        console.log(`Error checking must read completion status: ${error}`);
        return false;
      }
    });
  }

  /**
   * Get must read status
   */
  async getMustReadStatus(): Promise<string> {
    return await test.step('Get must read status', async () => {
      try {
        const statusText = await this.mustReadStatusIndicator.textContent();
        return statusText || 'Unknown';
      } catch (error) {
        console.log(`Error getting must read status: ${error}`);
        return 'Error';
      }
    });
  }

  /**
   * Click must read history link
   */
  async clickMustReadHistory(): Promise<void> {
    await test.step('Click must read history link', async () => {
      try {
        await this.mustReadHistoryLink.waitFor({ state: 'visible', timeout: 5000 });
        await this.mustReadHistoryLink.click();
      } catch (error) {
        console.log(`Error clicking must read history: ${error}`);
        throw error;
      }
    });
  }

  /**
   * Verify must read modal is open
   */
  async verifyMustReadModalIsOpen(): Promise<void> {
    await test.step('Verify must read modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mustReadModal, {
        assertionMessage: 'Must read modal should be visible',
      });
    });
  }

  /**
   * Check if must read banner is visible
   */
  async isMustReadBannerVisible(): Promise<boolean> {
    return await test.step('Check if must read banner is visible', async () => {
      try {
        return await this.mustReadBanner.isVisible({ timeout: 5000 });
      } catch (error) {
        console.log(`Error checking must read banner visibility: ${error}`);
        return false;
      }
    });
  }

  /**
   * Close must read modal
   */
  async closeMustReadModal(): Promise<void> {
    await test.step('Close must read modal', async () => {
      try {
        await this.mustReadModalCloseButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.mustReadModalCloseButton.click();
      } catch (error) {
        console.log(`Error closing must read modal: ${error}`);
        throw error;
      }
    });
  }
}
