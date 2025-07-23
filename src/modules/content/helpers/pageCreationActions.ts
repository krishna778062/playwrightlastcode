import { PageCreationPage } from '../pages/pageCreationPage';
import { request, test, Response } from '@playwright/test';
import { FileUtil } from '@core/utils/fileUtil';
import { PageContentType } from '../constants/pageContentType';
import { PageCreationResponse } from '../apis/types/pageCreationResponse';

interface PageCreationOptions {
  // Required fields
  title: string;
  description: string;
  category: string;
  contentType: PageContentType;

  // Optional fields
  coverImage?: {
    fileName: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
}

export class PageCreationActions {
  constructor(private readonly pageCreationPage: PageCreationPage) {}

  async uploadCoverImage(
    fileName: string,
    options?: {
      widescreenCropOption?: boolean;
      squareCropOption?: boolean;
    }
  ) {
    await test.step(`Upload cover image: ${fileName}`, async () => {
      const reqPromises = [];
      for (let i = 0; i < 3; i++) {
        reqPromises.push(
          this.pageCreationPage.page.waitForResponse(
            (response: Response) => response.url().includes('Content-Type=image%2Fpng') && response.request().method() === 'PUT'
          ),
          35_000
        );
      }
      const imagePath = FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', 'images', fileName);
      await this.pageCreationPage.coverImageUploader.uploadAttachment(imagePath);
      
      if (options?.widescreenCropOption) {
        await this.pageCreationPage.imageCropper.selectCropOption('Widescreen');
      }
      await this.pageCreationPage.imageCropper.clickOnNextButton();
      
      if (options?.squareCropOption) {
        await this.pageCreationPage.imageCropper.selectCropOption('Square');
      }
      await this.pageCreationPage.imageCropper.clickOnNextButton();
      await this.pageCreationPage.imageCropper.clickOnNextButton();
      await this.pageCreationPage.imageCropper.clickOnAddButton();

      await Promise.all(reqPromises);
    });
  }

  // ... rest of the file content remains the same ...
}

 