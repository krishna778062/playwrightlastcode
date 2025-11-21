import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from './baseComponent';

export class ProfileDropdownComponent extends BaseComponent {
  readonly viewProfileButton: Locator;
  readonly mySettingsButton: Locator;
  readonly whatsNewButton: Locator;
  readonly helpCenterButton: Locator;
  readonly logoutButton: Locator;
  constructor(page: Page) {
    super(page);
    this.viewProfileButton = page.getByRole('link', { name: 'View profile' });
    this.mySettingsButton = page.getByRole('menuitem', { name: 'My settings' });
    this.whatsNewButton = page.getByRole('menuitem', { name: 'Whats new' });
    this.helpCenterButton = page.getByRole('menuitem', { name: 'Help center' });
    this.logoutButton = page.getByRole('menuitem', { name: 'Log out' });
  }

  /**
   * Clicks on the view profile button
   * @param options - The options for the step
   */
  async clickOnViewProfileButton(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.viewProfileButton, {
      stepInfo: options?.stepInfo || `profile dropdown: clicking on view profile button`,
    });
  }

  /**
   * Clicks on the my settings button
   * @param options - The options for the step
   */
  async clickOnMySettingsButton(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.mySettingsButton, {
      stepInfo: options?.stepInfo || `profile dropdown: clicking on my settings button`,
    });
  }

  /**
   * Clicks on the whats new button
   * @param options - The options for the step
   */
  async clickOnWhatsNewButton(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.whatsNewButton, {
      stepInfo: options?.stepInfo || `profile dropdown: clicking on whats new button`,
    });
  }

  /**
   * Clicks on the help center button
   * @param options - The options for the step
   */
  async clickOnHelpCenterButton(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.helpCenterButton, {
      stepInfo: options?.stepInfo || `profile dropdown: clicking on help center button`,
    });
  }

  /**
   * Clicks on the logout button
   * @param options - The options for the step
   */
  async clickOnLogoutButton(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.logoutButton, {
      stepInfo: options?.stepInfo || `profile dropdown: clicking on logout button`,
    });
  }

  /**
   * Gets the user name from the profile dropdown
   * @param options - The options for the step
   */
  async getUserNameFromUI(options?: { stepInfo?: string }): Promise<string> {
    return await test.step(options?.stepInfo || `profile dropdown: getting user name from UI`, async () => {
      const text = await this.page.locator('.UserPanelWithPopoverMenu-module-username___SjAnN').textContent();
      if (!text) {
        throw new Error('User name not found in profile dropdown');
      }
      return text;
    });
  }
}
