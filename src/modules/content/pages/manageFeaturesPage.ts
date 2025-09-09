import { Locator, Page, Response, test } from '@playwright/test';

import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { PageCreationResponse } from '@/src/modules/content/apis/types/pageCreationResponse';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { AttachementUploaderComponent } from '@/src/modules/content/components/attachementUploader';
import { ImageCropperComponent } from '@/src/modules/content/components/imageCropper';
import { ManageFeatureComponent } from '@/src/modules/content/components/manageFeatureComponent';
import { PromotePageModal } from '@/src/modules/content/components/promotePageModal';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

export class ApplicationScreenPage extends BasePage {
  private sideNavBarComponent: SideNavBarComponent;
  private manageFeatureComponent: ManageFeatureComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_FEATURE);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.manageFeatureComponent = new ManageFeatureComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Implement the required abstract method
    // You can add page verification logic here if needed
  }

  async clickOnContentCard(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.manageFeatureComponent.clickOnContentCard);
    });
  }

  async clickOnSitesCard(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.manageFeatureComponent.clickOnSitesCard);
    });
  }
}
