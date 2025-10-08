import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TargetAudienceComponent } from '@/src/modules/content-abac/components/targetAudienceComponent';

export interface ISiteDetailsPageActions {
  removingAudienceGroup: () => Promise<void>;
}

export interface ISiteDetailsPageAssertions {
  verifyWarningMessage: () => Promise<void>;
}
export class SiteDetailsPage extends BasePage {
  private targetAudienceComponent: TargetAudienceComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));
    this.targetAudienceComponent = new TargetAudienceComponent(page);
  }

  get actions(): ISiteDetailsPageActions {
    return this;
  }

  get assertions(): ISiteDetailsPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {}

  async removingAudienceGroup(): Promise<void> {
    await this.targetAudienceComponent.removingAudienceGroup();
  }

  async verifyWarningMessage(): Promise<void> {
    await this.targetAudienceComponent.verifyWarningMessage();
  }
}
