import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { AddSiteScreenComponent } from '@/src/modules/content-abac/components/addSiteScreenComponent';

export interface IAddSiteScreenActions {
  clickOnBrowseButton: () => Promise<void>;
}

export interface IAddSiteScreenAssertions {}

export class AddSiteScreenPage extends BasePage {
  private addSiteScreenComponent: AddSiteScreenComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ADD_SITE_SCREEN_PAGE);
    this.addSiteScreenComponent = new AddSiteScreenComponent(page);
  }

  get actions(): IAddSiteScreenActions {
    return this;
  }
  get assertions(): IAddSiteScreenAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.addSiteScreenComponent.addSiteHeading, {
      assertionMessage: 'Add site heading should be visible on add site screen page',
    });
  }

  async clickOnBrowseButton(): Promise<void> {
    await test.step('Click on browse button', async () => {
      await this.clickOnElement(this.addSiteScreenComponent.browseButton);
    });
  }
}
