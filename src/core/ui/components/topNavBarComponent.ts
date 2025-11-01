import { Locator, Page, test } from '@playwright/test';

import { ProfileDropdownComponent } from './profileDropdownComponent';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class TopNavBarComponent extends BaseComponent {
  readonly messageButton: Locator;
  readonly seeAllMessagesButton: Locator;
  readonly globalSearchInputBox: Locator;
  readonly globalSearchButton: Locator;
  readonly addContentButton: Locator;

  //collapse or expand side nav bar
  readonly collapseSideNavBarButton: Locator;
  readonly expandSideNavBarButton: Locator;

  //apps and links section
  readonly appsAndLinksSection: Locator;

  //notifications section
  readonly notificationsButton: Locator;

  //profile settings section
  readonly viewProfileButton: Locator;
  readonly profileSettingsButton: Locator;
  readonly xButtonToClearGlobalSearchBar: Locator;
  constructor(
    page: Page,
    readonly isNewUxEnabled = true
  ) {
    super(page);
    this.isNewUxEnabled = isNewUxEnabled;
    this.seeAllMessagesButton = this.page.getByText('See all messages');
    this.addContentButton = this.page.getByRole('button', { name: 'Create' });
    //collapse or expand side nav bar
    this.collapseSideNavBarButton = this.page.getByRole('button', { name: 'Collapse sidenav' });
    this.expandSideNavBarButton = this.page.getByRole('button', { name: 'Expand sidenav' });

    //apps and links section
    this.appsAndLinksSection = this.page.getByRole('button', { name: 'Apps & links' });

    //notifications section
    this.notificationsButton = this.page.getByRole('button', { name: 'Notifications' });

    //message section
    this.messageButton = this.page.getByRole('button', { name: 'Messaging' });

    //search section
    this.globalSearchInputBox = this.page.locator('input[aria-label*=Search]').first();
    this.globalSearchButton = this.page.locator('button[type="button"][aria-label="Search"]');

    //profile settings section
    this.profileSettingsButton = this.page.getByLabel('Profile settings');
    this.viewProfileButton = this.page.getByText('View profile');
    this.xButtonToClearGlobalSearchBar = this.page.getByRole('button', { name: 'Clear' });
  }

  /**
   * Opens the message inbox
   * @param options - The options for the step
   */
  async openMessageInbox(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo || `Opening message inbox`, async () => {
      await this.clickByInjectingJavaScript(this.messageButton);
    });
  }

  async clickSeeAllMessages(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Clicking 'See all messages'`, async () => {
      await this.clickOnElement(this.seeAllMessagesButton);
    });
  }

  async typeInSearchBarInput(searchTerm: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `topnavbar: typing ${searchTerm} in search bar input`, async () => {
      await this.typeInElement(this.globalSearchInputBox, searchTerm, { timeout: 80_000 });
    });
  }
  async clickOnXButtonToClearGlobalSearchBarInput(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `topnavbar: clicking x button to clear global search bar input`, async () => {
      await this.clickOnElement(this.xButtonToClearGlobalSearchBar);
    });
  }

  async clickSearchButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `topnavbar: clicking search button`, async () => {
      const globalSearchResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.globalSearchButton, { delay: 2_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.search.enterprise) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      return globalSearchResponse;
    });
  }

  /**
   * Searches for a term in the global search bar
   * @param searchTerm - The term to search for
   * @param options - The options for the step
   */
  async searchForTerm(searchTerm: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `topnavbar: searching for ${searchTerm}`, async () => {
      await this.typeInSearchBarInput(searchTerm);
      await this.clickSearchButton();
    });
  }

  /**
   * Clicks on add content button on the top nav bar
   * @param options - The options for the step
   */

  async clickOnCreateContentButton(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `topnavbar: clicking on add content button`, async () => {
      await this.clickOnElement(this.addContentButton);
    });
  }

  async clickOnBellIconToOpenNotifications(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `topnavbar: clicking on bell icon to open notifications`, async () => {
      await this.clickByInjectingJavaScript(this.notificationsButton);
    });
  }

  /**
   * Collapses the side nav bar
   * @param options - The options for the step
   */
  async collapseSideNavBar(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.collapseSideNavBarButton, {
      stepInfo: options?.stepInfo || `topnavbar: clicking on button to collapse side nav bar`,
    });
  }

  /**
   * Expands the side nav bar
   * @param options - The options for the step
   */
  async expandSideNavBar(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.expandSideNavBarButton, {
      stepInfo: options?.stepInfo || `topnavbar: clicking on button to expand side nav bar`,
    });
  }

  /**
   * Opens the apps and links section
   * @param options - The options for the step
   */
  async openAppsAndLinksSection(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.appsAndLinksSection, {
      stepInfo: options?.stepInfo || `topnavbar: clicking on apps and links button`,
    });
  }

  /**
   * Opens the profile settings
   * @param options - The options for the step
   */
  async openProfileSettings(options?: { stepInfo?: string }): Promise<ProfileDropdownComponent> {
    const profileDropdownComponent = new ProfileDropdownComponent(this.page);
    await this.clickOnElement(this.profileSettingsButton, {
      stepInfo: options?.stepInfo || `topnavbar: clicking on profile settings button`,
    });
    return profileDropdownComponent;
  }

  /**
   * Logs out a user
   * @param options - The options for the step
   */
  async logout(options?: { stepInfo?: string }): Promise<void> {
    const profileDropdownComponent = await this.openProfileSettings(options);
    await profileDropdownComponent.clickOnLogoutButton();
  }

  async openMySettings(options?: { stepInfo?: string }): Promise<void> {
    const profileDropdownComponent = await this.openProfileSettings(options);
    await profileDropdownComponent.clickOnMySettingsButton();
  }

  async openViewProfile(options?: { stepInfo?: string }): Promise<void> {
    const profileDropdownComponent = await this.openProfileSettings(options);
    await profileDropdownComponent.clickOnViewProfileButton();
  }

  async openWhatsNew(options?: { stepInfo?: string }): Promise<void> {
    const profileDropdownComponent = await this.openProfileSettings(options);
    await profileDropdownComponent.clickOnWhatsNewButton();
  }

  async openHelpCenter(options?: { stepInfo?: string }): Promise<void> {
    const profileDropdownComponent = await this.openProfileSettings(options);
    await profileDropdownComponent.clickOnHelpCenterButton();
  }
}
