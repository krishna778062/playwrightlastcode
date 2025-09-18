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
    await this.verifier.verifyTheElementIsVisible(this.audienceModalComponent.audienceModalHeading, {
      assertionMessage: 'Audience modal heading should be visible on audience modal page',
    });
  }

  async verifyingAudienceModalHeading(): Promise<void> {
    await test.step('Verifying audience modal heading', async () => {
      await this.verifier.verifyTheElementIsVisible(this.audienceModalComponent.audienceModalHeading, {
        assertionMessage: 'Audience modal heading should be visible on audience modal page',
      });
    });
  }

  async clickOnAllOrganizationOption(): Promise<void> {
    await test.step('Clicking on all organization option', async () => {
      await this.clickOnElement(this.audienceModalComponent.allOrganizationToggle);
      await this.verifier.verifyTheElementIsVisible(this.audienceModalComponent.allOrganizationMessage, {
        assertionMessage: 'All organization switch should be visible on audience modal page',
      });
      await this.clickOnElement(this.audienceModalComponent.allOrganizationToggle);
    });
  }

  async selectingAudience(): Promise<void> {
    await test.step('Selecting audience', async () => {
      await this.clickOnElement(this.audienceModalComponent.openParentContainer);
      await this.clickOnElement(this.audienceModalComponent.selectingAudienceGroup);
      await this.clickOnElement(this.audienceModalComponent.clickingOnDoneButton);
    });
  }
}
