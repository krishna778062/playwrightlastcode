import { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/pages/basePage';
import { PageCreationAssertions } from '../helpers/pageCreationAssertions';
import { AddContentModalComponent } from '../components/addContentModal';
import { PageCreationActions } from '../helpers/pageCreationActions';
import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { AttachementUploaderComponent } from '../components/attachementUploader';
import { ImageCropperComponent } from '../components/imageCropper';

export enum PageContentType {
  NEWS = 'News',
  KNOWLEDGE = 'Knowledge'
}

export class PageCreationPage extends BasePage<PageCreationActions, PageCreationAssertions> {
  //root locators of some components
  readonly coverImageUploaderContainer: Locator;
  readonly fileAttachmentUploaderContainer: Locator;
  readonly imageCaptionInputBox: Locator;
  readonly uploadedCoverImagePreviewContainer: Locator;
  readonly uploadedCoverImagePreviewImage: Locator;
  readonly categoryDropdown: Locator;
  readonly contentTypeCheckbox: (type: string) => Locator;
  readonly publishButton: Locator;
  readonly skipStepButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly contentTitleHeading: (title: string) => Locator;
  readonly successMessage: (message: string) => Locator;

  // Page components
  readonly addContentModal: AddContentModalComponent;
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly fileAttachmentUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;
  readonly sideNavBarComponent: SideNavBarComponent;

  constructor(page: Page) {
    super(page);
    //root locators of some components
    this.coverImageUploaderContainer = page.locator("[class*='AddFromContainer']").filter({ hasText: "Select from computer" }).nth(0);
    this.fileAttachmentUploaderContainer = page.locator("[class*='AddFromContainer']").filter({ hasText: "Select from computer" }).nth(1);
    this.imageCaptionInputBox = page.getByPlaceholder("Add image caption here");
    this.uploadedCoverImagePreviewContainer = page.locator("[class*='Banner-imageContainer']");
    this.uploadedCoverImagePreviewImage = this.uploadedCoverImagePreviewContainer.locator("img");
    this.categoryDropdown = page.locator('label[for="category"] + div input');
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.skipStepButton = page.locator('button', { hasText: 'Skip this step' });
    this.titleInput = page.locator("textarea[placeholder='Page title']");
    this.descriptionInput = page.locator("div[contenteditable='true']");
    this.contentTitleHeading = (title: string) => page.locator('h1', { hasText: title });
    this.successMessage = (message: string) => page.locator('div[class*="Toast-module"] p', { hasText: message });
    this.contentTypeCheckbox = (type: string) =>
      page.locator('label:has(span)', { hasText: type });
    // Page components
    this.addContentModal = new AddContentModalComponent(page);
    this.coverImageUploader = new AttachementUploaderComponent(page,this.coverImageUploaderContainer);
    this.fileAttachmentUploader = new AttachementUploaderComponent(page,this.fileAttachmentUploaderContainer);
    this.imageCropper = new ImageCropperComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.titleInput.waitFor({ state: 'visible' });
  }

  get actions() {
    return new PageCreationActions(this);
  }

  get assertions() {
    return new PageCreationAssertions(this);
  }

}