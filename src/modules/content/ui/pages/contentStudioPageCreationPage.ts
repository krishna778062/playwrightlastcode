import { Locator, Page, test } from '@playwright/test';

import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { AddCoverImageComponent } from '@content/ui/components/addCoverImageComponent';
import { MediaManagerComponent } from '@content/ui/components/mediaManagerComponent';
import { IPageCreationActions, IPageCreationAssertions, PageCreationPage } from '@content/ui/pages/pageCreationPage';

export interface IContentStudioPageCreationActions extends IPageCreationActions {
  clickAddCoverImageIcon: () => Promise<void>;
  clickOnOptionsButtonAndSelectAddCoverImageTab: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Promise<void>;
  clickOnopenMediaManagerDialog: () => Promise<void>;
  selectAndAttachImageFromMediaManager: () => Promise<void>;
}

export interface IContentStudioPageCreationAssertions extends IPageCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyCoverImageModalTabIsVisible: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Promise<void>;
  verifyopenMediaManagerDialogIsVisible: () => Promise<void>;
}

export class ContentStudioPageCreationPage
  extends PageCreationPage
  implements IContentStudioPageCreationActions, IContentStudioPageCreationAssertions
{
  // Cover image modal locators
  readonly addCoverImageIcon: Locator;
  readonly coverTitleInput: Locator;
  readonly addCoverImageComponent: AddCoverImageComponent;
  readonly mediaManagerComponent: MediaManagerComponent;
  readonly uploadedCoverImagePreviewContainerForContentStudio: Locator;
  readonly uploadedCoverImagePreviewImageForContentStudio: Locator;

  constructor(page: Page, siteId?: string) {
    super(page, siteId);
    // Cover image modal locators
    // Use exact match to avoid strict-mode ambiguity with wrapper elements
    this.addCoverImageIcon = page.getByRole('button', { name: /^Add cover image$/ });
    this.coverTitleInput = page.locator("textarea[name='cover-title']");
    this.addCoverImageComponent = new AddCoverImageComponent(page);
    this.mediaManagerComponent = new MediaManagerComponent(page);
    // Content Studio specific locator for uploaded cover image preview
    this.uploadedCoverImagePreviewContainerForContentStudio = page.locator('.flex.h-full.w-full.items-center');
    this.uploadedCoverImagePreviewImageForContentStudio =
      this.uploadedCoverImagePreviewContainerForContentStudio.locator('img');
  }

  get actions(): IContentStudioPageCreationActions {
    return this;
  }

  get assertions(): IContentStudioPageCreationAssertions {
    return this;
  }

  /**
   * Clicks on the "Add cover image" icon to open the cover image modal
   */
  async clickAddCoverImageIcon(): Promise<void> {
    await test.step('Click on Add cover image icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addCoverImageIcon, {
        assertionMessage: 'Add cover image icon should be visible',
      });
      await this.clickOnElement(this.addCoverImageIcon);
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.coverTitleInput, {
        assertionMessage: 'Cover title input should be visible',
      });
    });
  }

  /**
   * Verifies that the specified tab is visible in the cover image modal
   * @param tab - The tab name to verify ('Upload', 'Browse', 'URL', or 'Unsplash')
   */
  async verifyCoverImageModalTabIsVisible(tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash'): Promise<void> {
    await this.addCoverImageComponent.verifyCoverImageModalTabIsVisible(tab);
  }
  async verifyopenMediaManagerDialogIsVisible(): Promise<void> {
    await test.step('Verify open media manager dialog is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addCoverImageComponent.openMediaManagerDialog, {
        assertionMessage: 'Open media manager dialog should be visible',
      });
    });
  }
  async clickOnopenMediaManagerDialog(): Promise<void> {
    await test.step('Click on open media manager dialog', async () => {
      await this.clickOnElement(this.addCoverImageComponent.openMediaManagerDialog);
    });
  }
  /**
   * Clicks the options (tab) button and selects the provided tab in the Add Cover Image modal
   */
  async clickOnOptionsButtonAndSelectAddCoverImageTab(tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash'): Promise<void> {
    await test.step(`Select '${tab}' tab in Add cover image modal`, async () => {
      await this.clickOnElement(this.addCoverImageComponent.tabsOptions(tab));
    });
  }

  /**
   * Selects and attaches an image from the media manager
   * This method combines: clearing search, selecting first image, clicking attach, and waiting for modals to close
   */
  async selectAndAttachImageFromMediaManager(): Promise<void> {
    await test.step('Select and attach image from media manager', async () => {
      await this.mediaManagerComponent.clickOnCrossIcon();
      await this.mediaManagerComponent.selectFirstImage();
      await this.mediaManagerComponent.clickOnAttachButton();
      await this.mediaManagerComponent.waitForModalsToClose();
    });
  }

  /**
   * Verifies that the uploaded cover image preview is visible (Content Studio specific)
   * Overrides the base class method to use Content Studio specific locator
   */
  async verifyUploadedCoverImagePreviewIsVisible(options?: { timeout?: number }): Promise<void> {
    await test.step(`Verifying that the uploaded cover image preview is visible`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.mediaManagerDialogAndIntranet, {
        assertionMessage: 'Media Manager dialog and Intranet file manager dialog should not be visible',
      });

      const imageCount = await this.uploadedCoverImagePreviewImageForContentStudio.count();
      if (imageCount === 0) {
        await this.uploadedCoverImagePreviewImageForContentStudio
          .waitFor({ state: 'attached', timeout: 5000 })
          .catch(() => {});
      }

      await this.page
        .waitForFunction(
          imgSelector => {
            const img = document.querySelector(imgSelector) as HTMLImageElement | null;
            return img !== null && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 && img.src.length > 0;
          },
          `.flex.h-full.w-full.items-center img`,
          { timeout: 10000 }
        )
        .catch(() => {});

      await this.verifier.verifyTheElementIsVisible(this.uploadedCoverImagePreviewImageForContentStudio, {
        assertionMessage: 'expected uploaded cover image preview element to be visible',
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      });
    });
  }
}
