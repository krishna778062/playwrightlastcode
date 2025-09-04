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

import { FileUtil } from '@/src/core/utils/fileUtil';

export class ApplicationScreenPage extends BasePage {
  private sideNavBarComponent: SideNavBarComponent;

  constructor(page: Page) {
    super(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Implement the required abstract method
    // You can add page verification logic here if needed
  }

  async clickOnApplication(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.sideNavBarComponent.clickOnApplication.click();
    });
  }
}
