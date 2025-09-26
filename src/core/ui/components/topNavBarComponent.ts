import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class TopNavBarComponent extends BaseComponent {
  readonly profileSettingsButton: Locator;
  readonly messageButton: Locator;
  readonly seeAllMessagesButton: Locator;
  readonly globalSearchInputBox: Locator;
  readonly globalSearchButton: Locator;
  readonly addContentButton: Locator;
  readonly notificationsButton: Locator;
  constructor(page: Page) {
    super(page);
    this.profileSettingsButton = this.page.getByLabel('Profile settings');

    this.messageButton = this.page.getByRole('button', { name: 'Messaging' });
    this.seeAllMessagesButton = this.page.getByText('See all messages');
    this.globalSearchInputBox = this.page.locator('input[aria-label*=Search]');
    this.globalSearchButton = this.page.locator('button[type="button"][aria-label="Search"]');
    this.addContentButton = this.page.getByRole('button', { name: 'Create' });
    this.notificationsButton = this.page.locator('button[aria-label*=Notifications]');
  }

  /**
   * Opens the message inbox
   * @param options - The options for the step
   */
  async openMessageInbox(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo || `Opening message inbox`, async () => {
      await this.clickOnElement(this.messageButton);
    });
  }

  async clickSeeAllMessages(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Clicking 'See all messages'`, async () => {
      await this.clickOnElement(this.seeAllMessagesButton);
    });
  }

  async typeInSearchBarInput(searchTerm: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Typing ${searchTerm} in search bar input`, async () => {
      await this.typeInElement(this.globalSearchInputBox, searchTerm, { timeout: 80_000 });
    });
  }

  async clickSearchButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Clicking search button`, async () => {
      await this.clickOnElement(this.globalSearchButton);
    });
  }

  /**
   * Clicks on add content button on the top nav bar
   * @param options - The options for the step
   */

  async clickOnCreateContentButton(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Clicking on add content button on top nav bar`, async () => {
      await this.clickOnElement(this.addContentButton);
    });
  }

  async clickOnBellIcon(options?: { stepInfo?: string }): Promise<void> {
    await this.clickByInjectingJavaScript(this.notificationsButton);
  }
}
