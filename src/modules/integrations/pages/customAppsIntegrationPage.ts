import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

import { AppConnectorOptions, CustomAppsListComponent } from '../components/customAppsListComponent';

export enum CustomAppType {
  CREATE_OWN_APP = 'Create your own app',
  ADD_PREBUILT_APP = 'Add prebuilt app',
}

export class CustomAppsIntegrationPage extends BasePage {
  readonly resultListAppTilesItemCountLocator: Locator;

  //component initialisation
  readonly customAppsListComponent: CustomAppsListComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE);
    this.resultListAppTilesItemCountLocator = page.locator('div[class*="result-list-item-count"]');
    this.customAppsListComponent = new CustomAppsListComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.resultListAppTilesItemCountLocator, {
        timeout: 30_000,
        assertionMessage:
          'Verifying that the custom page is loaded by assertion for app tiles list item count presence',
      });
    });
  }

  async searchAndSelectAppWithNameToPerformAction(appName: string, action: AppConnectorOptions): Promise<void> {
    await test.step('Search and select app with name', async () => {
      await this.customAppsListComponent.searchForApp(appName);
      await this.customAppsListComponent.verifyCountOfAppsInListIs(1);
      await this.customAppsListComponent.clickOnAppConnector(appName);
      await this.customAppsListComponent.selectConnectorOption(action);
    });
  }

  async addPrebuiltApp(appName: string) {
    await test.step(`Add prebuilt app of type ${appName}`, async () => {
      await this.customAppsListComponent.clickAddPrebuiltApp(appName);
      await this.customAppsListComponent.searchForPrebuiltApp(appName);

      //verify that we are navigating to page
      await this.page.waitForURL(/new/);
    });
  }
}
