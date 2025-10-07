import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { AudienceModalComponent } from '@/src/modules/content-abac/components/audienceModalComponent';

export interface IAudienceModalActions {
  verifyingAudienceModalHeading: () => Promise<void>;
  selectingAudience: () => Promise<void>;
}

export interface IAudienceModalAssertions {
  clickOnAllOrganizationOption: () => Promise<void>;
}

export class AudienceModalPage extends BasePage {
  private audienceModalComponent: AudienceModalComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ADD_SITE_SCREEN_PAGE);
    this.audienceModalComponent = new AudienceModalComponent(page);
  }

  get actions(): IAudienceModalActions {
    return this;
  }
  get assertions(): IAudienceModalAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.audienceModalComponent.verifyThePageIsLoaded();
  }

  async verifyingAudienceModalHeading(): Promise<void> {
    await this.audienceModalComponent.verifyingAudienceModalHeading();
  }

  async clickOnAllOrganizationOption(): Promise<void> {
    await this.audienceModalComponent.clickOnAllOrganizationOption();
  }

  async selectingAudience(): Promise<void> {
    await this.audienceModalComponent.selectingAudience();
  }
}
