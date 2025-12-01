import { Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { AppsLinksComponents } from '@/src/modules/integrations/ui/components/appsLinksComponent';

export class AppsLinksPage extends BasePage {
  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  readonly appslinksComponent: AppsLinksComponents;
  constructor(page: Page) {
    super(page);
    this.appslinksComponent = new AppsLinksComponents(page);
  }

  async addLinks(linkData: Array<{ Link_URL: string; Link_Label: string }>): Promise<void> {
    return this.appslinksComponent.addLinks(linkData);
  }

  async enterLinkLabel(label: string): Promise<void> {
    return this.appslinksComponent.enterLinkLabel(label);
  }

  async enterLinkUrl(url: string): Promise<void> {
    return this.appslinksComponent.enterLinkUrl(url);
  }

  async clickAddButton(): Promise<void> {
    return this.appslinksComponent.clickAddButton();
  }

  async clickSaveButton(): Promise<void> {
    return this.appslinksComponent.clickSaveButton();
  }

  async cancelAllLinksPresent(): Promise<void> {
    return this.appslinksComponent.cancelAllLinksPresent();
  }

  async verifyAppsDuplicate(message: string): Promise<void> {
    return this.appslinksComponent.verifyAppsDuplicate(message);
  }

  async verifyLinksDuplicate(label: string, url: string): Promise<void> {
    return this.appslinksComponent.verifyLinksDuplicate(label, url);
  }

  async clickOnAppsIntegrationDropdown(integrationName: string): Promise<void> {
    return this.appslinksComponent.clickOnAppsIntegrationDropdown(integrationName);
  }

  async clickOnCustomJsonInputField(): Promise<void> {
    return this.appslinksComponent.clickOnCustomJsonInputField();
  }

  async clickOnHomePageHeader(headerName: string): Promise<void> {
    return this.appslinksComponent.clickOnHomePageHeader(headerName);
  }

  async verifySubTabsInsideAppsLinksTabIsVisible(headerName: string): Promise<void> {
    return this.appslinksComponent.verifySubTabsInsideAppsLinksTabIsVisible(headerName);
  }

  async markAppsFavorite(appName: string): Promise<void> {
    return this.appslinksComponent.markAppsFavorite(appName);
  }

  async markLinksFavorite(linkName: string): Promise<void> {
    return this.appslinksComponent.markLinksFavorite(linkName);
  }

  async appsLinksLaunchpadButtons(button: string): Promise<void> {
    return this.appslinksComponent.appsLinksLaunchpadButtons(button);
  }

  async verifyAppsAreMarkedAsFavorite(appName: string): Promise<void> {
    return this.appslinksComponent.verifyAppsAreMarkedAsFavorite(appName);
  }

  async verifyLinksAreMarkedAsFavorite(linkName: string): Promise<void> {
    return this.appslinksComponent.verifyLinksAreMarkedAsFavorite(linkName);
  }

  async clickOnSaveButton(): Promise<void> {
    return this.appslinksComponent.clickOnSaveButton();
  }

  async clickOnSaveButtonIfEnabled(): Promise<void> {
    return this.appslinksComponent.clickOnSaveButtonIfEnabled();
  }

  async verifyApps(name: string): Promise<void> {
    return this.appslinksComponent.verifyApps(name);
  }

  async verifyURL(type: string, name: string, url: string): Promise<void> {
    return this.appslinksComponent.verifyURL(type, name, url);
  }

  async verifyOrgLinks(name: string): Promise<void> {
    return this.appslinksComponent.verifyOrgLinks(name);
  }

  async customLinkCheckBox(status: string): Promise<void> {
    return this.appslinksComponent.customLinkCheckBox(status);
  }

  async verifyCustomLinkVisibility(status: string): Promise<void> {
    return this.appslinksComponent.verifyCustomLinkVisibility(status);
  }

  async clickOnSubButtonsInsideLinksTab(name: string): Promise<void> {
    return this.appslinksComponent.clickOnSubButtonsInsideLinksTab(name);
  }

  async addAndVerifyCustomLinks(name: string, url: string): Promise<void> {
    return this.appslinksComponent.addAndVerifyCustomLinks(name, url);
  }

  async deleteCustomLink(name: string): Promise<void> {
    return this.appslinksComponent.deleteCustomLink(name);
  }

  async verifyHomePageHeaderNonVisibility(button: string): Promise<void> {
    return this.appslinksComponent.verifyHomePageHeaderNonVisibility(button);
  }

  async verifyEndUserCustomLinks(message: string): Promise<void> {
    return this.appslinksComponent.verifyEndUserCustomLinks(message);
  }

  async verifyOrgLinkVisibility(status: string): Promise<void> {
    return this.appslinksComponent.verifyOrgLinkVisibility(status);
  }

  async verifyButtonInsideCustomLinks(button: string): Promise<void> {
    return this.appslinksComponent.verifyButtonInsideCustomLinks(button);
  }

  async verifySearchBoxVisibilityAndCountInsideLaunchpad(): Promise<void> {
    return this.appslinksComponent.verifySearchBoxVisibilityAndCountInsideLaunchpad();
  }

  async verifyZeroStateMessageOfFavoritesTab(message: string, subMessage: string): Promise<void> {
    return this.appslinksComponent.verifyZeroStateMessageOfFavoritesTab(message, subMessage);
  }

  async clickOnSubButtonsInsideFavorite(name: string): Promise<void> {
    return this.appslinksComponent.clickOnSubButtonsInsideFavorite(name);
  }

  async addDuplicateLinks(label: string, url: string): Promise<void> {
    return this.appslinksComponent.addDuplicateLinks(label, url);
  }

  async addAppsFromCustomJson(customJsonOption: string): Promise<void> {
    return this.appslinksComponent.addAppsFromCustomJson(customJsonOption);
  }

  async navigateTo(url: string): Promise<void> {
    await test.step('Navigate to external apps page', async () => {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  async verifySubTabsInsideLinksVisibility(header: string, subTab: string, status: string): Promise<void> {
    return this.appslinksComponent.verifySubTabsInsideLinksVisibility(header, subTab, status);
  }

  /**
   * Verify toast message appears
   */
  async verifyToastMessage(message: string): Promise<void> {
    return this.appslinksComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async addDuplicateCustomApps(): Promise<void> {
    return this.appslinksComponent.addDuplicateCustomApps();
  }
}
