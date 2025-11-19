import { Locator, Page, test } from '@playwright/test';

import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { AddCoverImageComponent } from '@content/ui/components/addCoverImageComponent';
import { ContentStudioToolbarComponent } from '@content/ui/components/contentStudioToolbarComponent';
import { MediaManagerComponent } from '@content/ui/components/mediaManagerComponent';
import { IPageCreationActions, IPageCreationAssertions, PageCreationPage } from '@content/ui/pages/pageCreationPage';

export interface IContentStudioPageCreationActions extends IPageCreationActions {
  clickAddCoverImageIcon: () => Promise<void>;
  clickOnOptionsButtonAndSelectAddCoverImageTab: (
    tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash' | 'Select color'
  ) => Promise<void>;
  clickOnopenMediaManagerDialog: () => Promise<void>;
  selectAndAttachImageFromMediaManager: () => Promise<void>;
  clickEditCover: () => Promise<void>;
  clickAddImage: () => Promise<void>;
  clickCoverLayoutSection: () => Promise<void>;
  selectBackgroundOverlayLayout: () => Promise<void>;
  clickSelectColorTab: () => Promise<void>;
  selectColorFromPalette: (colorIndex?: number) => Promise<void>;
  selectBrandColor: (brandColorIndex?: number) => Promise<void>;
}

export interface IContentStudioPageCreationAssertions extends IPageCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyCoverImageModalTabIsVisible: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash' | 'Select color') => Promise<void>;
  verifyopenMediaManagerDialogIsVisible: () => Promise<void>;
  verifyToolbarIsVisible: () => Promise<void>;
  verifyEditPageCoverPanelIsVisible: () => Promise<void>;
  verifyLayoutOptionsAreVisible: () => Promise<void>;
  verifyColorPaletteIsVisible: () => Promise<void>;
  verifyCoverColorIsApplied: () => Promise<void>;
  verifyPageTitleOverCoverIsVisible: () => Promise<void>;
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
  readonly toolbarComponent: ContentStudioToolbarComponent;
  readonly uploadedCoverImagePreviewContainerForContentStudio: Locator;
  readonly uploadedCoverImagePreviewImageForContentStudio: Locator;
  // Edit cover panel locators
  readonly editPageCoverPanel: Locator;
  readonly coverLayoutSection: Locator;
  readonly coverLayoutCard: Locator;
  readonly backgroundOverlayLayoutButton: Locator;
  readonly coverAreaWithColor: Locator;
  readonly pageTitleOverCover: Locator;

  constructor(page: Page, siteId?: string) {
    super(page, siteId);
    // Cover image modal locators
    // Use exact match to avoid strict-mode ambiguity with wrapper elements
    this.addCoverImageIcon = page.getByRole('button', { name: 'Add cover image', exact: true });
    this.coverTitleInput = page.locator("textarea[name='cover-title']");
    this.addCoverImageComponent = new AddCoverImageComponent(page);
    this.mediaManagerComponent = new MediaManagerComponent(page);
    this.toolbarComponent = new ContentStudioToolbarComponent(page);
    // Content Studio specific locator for uploaded cover image preview
    this.uploadedCoverImagePreviewContainerForContentStudio = page.locator('.flex.h-full.w-full.items-center');
    this.uploadedCoverImagePreviewImageForContentStudio =
      this.uploadedCoverImagePreviewContainerForContentStudio.locator('img');
    // Edit cover panel locators
    this.editPageCoverPanel = page.getByText('Edit page cover');
    this.coverLayoutSection = page.getByRole('button', { name: 'Cover layout Default' });
    this.coverLayoutCard = page.getByText('DefaultBackground overlaySplit viewNo cover');
    this.backgroundOverlayLayoutButton = page.getByRole('button', { name: 'Background overlay' });
    this.coverAreaWithColor = page.locator('.flex.h-full.w-full.items-center');
    this.pageTitleOverCover = page.getByRole('textbox', { name: 'Untitled page' });
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
   * @param tab - The tab name to verify ('Upload', 'Browse', 'URL', 'Unsplash', or 'Select color')
   */
  async verifyCoverImageModalTabIsVisible(
    tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash' | 'Select color'
  ): Promise<void> {
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
  async clickOnOptionsButtonAndSelectAddCoverImageTab(
    tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash' | 'Select color'
  ): Promise<void> {
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
   * Clicks on the "Edit cover" button in the toolbar
   */
  async clickEditCover(): Promise<void> {
    await this.toolbarComponent.actions.clickEditCover();
  }

  /**
   * Clicks on the "Add image" button in the toolbar
   */
  async clickAddImage(): Promise<void> {
    await this.toolbarComponent.actions.clickAddImage();
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
        await this.uploadedCoverImagePreviewImageForContentStudio.waitFor({ state: 'attached' }).catch(() => {});
      }

      await this.page
        .waitForFunction(imgSelector => {
          const img = document.querySelector(imgSelector) as HTMLImageElement | null;
          return img !== null && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 && img.src.length > 0;
        }, `.flex.h-full.w-full.items-center img`)
        .catch(() => {});

      await this.verifier.verifyTheElementIsVisible(this.uploadedCoverImagePreviewImageForContentStudio, {
        assertionMessage: 'expected uploaded cover image preview element to be visible',
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      });
    });
  }

  /**
   * Clicks on the Cover layout section to open layout options
   */
  async clickCoverLayoutSection(): Promise<void> {
    await test.step('Click on Cover layout section', async () => {
      await this.verifier.verifyTheElementIsVisible(this.coverLayoutSection, {
        assertionMessage: 'Cover layout section should be visible',
      });
      await this.clickOnElement(this.coverLayoutSection);
    });
  }

  /**
   * Selects the "Background overlay" layout option
   * Note: Selecting this layout enables the "Select color" tab in the cover image modal
   */
  async selectBackgroundOverlayLayout(): Promise<void> {
    await test.step('Select Background overlay layout', async () => {
      await this.verifier.verifyTheElementIsVisible(this.backgroundOverlayLayoutButton, {
        assertionMessage: 'Background overlay layout button should be visible',
      });
      await this.clickOnElement(this.backgroundOverlayLayoutButton);
    });
  }

  /**
   * Clicks on the "Select color" tab in the cover image modal
   * Note: This tab is only visible when "Background overlay" layout is selected
   */
  async clickSelectColorTab(): Promise<void> {
    await test.step('Click on Select color tab', async () => {
      await this.addCoverImageComponent.clickSelectColorTab();
    });
  }

  /**
   * Selects a color from the color palette
   * @param colorIndex - The index of the color to select (default: 1 for first color)
   */
  async selectColorFromPalette(colorIndex: number = 1): Promise<void> {
    await test.step(`Select color from palette at index ${colorIndex}`, async () => {
      await this.addCoverImageComponent.selectColorFromPalette(colorIndex);
    });
  }

  /**
   * Selects a brand color from the brand colors section
   * @param brandColorIndex - The index of the brand color to select (default: 0 for first brand color)
   */
  async selectBrandColor(brandColorIndex: number = 0): Promise<void> {
    await test.step(`Select brand color at index ${brandColorIndex}`, async () => {
      await this.addCoverImageComponent.selectBrandColor(brandColorIndex);
    });
  }

  /**
   * Verifies that the Content Studio toolbar is visible
   */
  async verifyToolbarIsVisible(): Promise<void> {
    await this.toolbarComponent.assertions.verifyToolbarIsVisible();
  }

  /**
   * Verifies that the Edit page cover panel is visible
   */
  async verifyEditPageCoverPanelIsVisible(): Promise<void> {
    await test.step('Verify Edit page cover panel is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editPageCoverPanel, {
        assertionMessage: 'Edit page cover panel should be visible',
      });
    });
  }

  /**
   * Verifies that the layout options are visible
   */
  async verifyLayoutOptionsAreVisible(): Promise<void> {
    await test.step('Verify layout options are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.coverLayoutCard, {
        assertionMessage: 'Layout options should be visible',
      });
    });
  }

  /**
   * Verifies that the color palette is visible
   */
  async verifyColorPaletteIsVisible(): Promise<void> {
    await this.addCoverImageComponent.verifyColorPaletteIsVisible();
  }

  /**
   * Verifies that the selected color is applied to the cover area
   */
  async verifyCoverColorIsApplied(): Promise<void> {
    await test.step('Verify cover color is applied', async () => {
      await this.verifier.verifyTheElementIsVisible(this.coverAreaWithColor, {
        assertionMessage: 'Cover area with applied color should be visible',
      });
    });
  }

  /**
   * Verifies that the page title appears over the cover background
   */
  async verifyPageTitleOverCoverIsVisible(): Promise<void> {
    await test.step('Verify page title over cover is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageTitleOverCover, {
        assertionMessage: 'Page title over cover should be visible',
      });
    });
  }
}
