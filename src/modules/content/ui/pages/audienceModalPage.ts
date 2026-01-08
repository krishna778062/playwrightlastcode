import { Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { AudienceModalComponent } from '@/src/modules/content/ui/components/audienceModalComponent';

export class AudienceModalPage extends BasePage {
  private audienceModalComponent: AudienceModalComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ADD_SITE_SCREEN_PAGE);
    this.audienceModalComponent = new AudienceModalComponent(page);
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
