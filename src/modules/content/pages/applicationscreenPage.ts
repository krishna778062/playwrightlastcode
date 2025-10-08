import { Locator, Page, Response, test } from '@playwright/test';

import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { BasePage } from '@core/pages/basePage';

import { PageCreationResponse } from '../apis/types/pageCreationResponse';
import { AddContentModalComponent } from '../components/addContentModal';
import { AttachementUploaderComponent } from '../components/attachementUploader';
import { ImageCropperComponent } from '../components/imageCropper';
import { PromotePageModal } from '../components/promotePageModal';
import { PageContentType } from '../constants/pageContentType';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { ApplicationSettingsComponent } from '@/src/modules/content/components/applicationSettingsComponent';

export interface IApplicationScreenPageActions {
  clickOnApplication: () => Promise<void>;
  clickOnTopics: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}

export class ApplicationSettingsPage extends BasePage implements IApplicationScreenPageActions {
  private sideNavBarComponent: SideNavBarComponent;
  private applicationSettingsComponent: ApplicationSettingsComponent;
  actions: any;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APPLICATION_SETTINGS);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.applicationSettingsComponent = new ApplicationSettingsComponent(page);
    this.actions = {
      clickOnApplication: this.clickOnApplication.bind(this),
      clickOnTopics: this.clickOnTopics.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify application settings page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.applicationSettingsComponent.pageHeading, {
        assertionMessage: 'Application settings page should be visible',
      });
    });
  }

  async clickOnApplication(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.applicationSettingsComponent.clickOnApplication);
    });
  }

  async clickOnTopics(): Promise<void> {
    await test.step('Clicking on topics', async () => {
      await this.clickOnElement(this.applicationSettingsComponent.clickOnTopics);
    });
  }
}
