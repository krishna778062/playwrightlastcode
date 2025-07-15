import { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/pages/basePage';
import { PageCreationAssertions } from '../helpers/pageCreationAssertions';
import { AddContentModalComponent } from '../components/addContentModal';
import { PageCreationActions } from '../helpers/pageCreationActions';
import { ContentEditorComponent } from '../components/contentEditor';
import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { AttachementUploaderComponent } from '../components/attachementUploader';
import { ImageCropperComponent } from '../components/imageCropper';

export class PageCreationPage extends BasePage<PageCreationActions, PageCreationAssertions> {

  //root locators of some components
  readonly coverImageUploaderContainer: Locator;
  readonly fileAttachmentUploaderContainer: Locator;
  readonly imageCaptionInputBox: Locator;
  readonly uploadedCoverImagePreviewContainer: Locator;
  readonly uploadedCoverImagePreviewImage: Locator;
  // Page components
  readonly addContentModal: AddContentModalComponent;
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly fileAttachmentUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;
  readonly contentEditor: ContentEditorComponent;
  readonly sideNavBarComponent: SideNavBarComponent;

  constructor(page: Page) {
    super(page);
    //root locators of some components
    this.coverImageUploaderContainer = page.locator("[class*='AddFromContainer']").filter({ hasText: "Select from computer" }).nth(0);
    this.fileAttachmentUploaderContainer = page.locator("[class*='AddFromContainer']").filter({ hasText: "Select from computer" }).nth(1);
    this.imageCaptionInputBox = page.getByPlaceholder("Add image caption here");
    this.uploadedCoverImagePreviewContainer = page.locator("[class*='Banner-imageContainer']");
    this.uploadedCoverImagePreviewImage = this.uploadedCoverImagePreviewContainer.locator("img");
    // Page components
    this.addContentModal = new AddContentModalComponent(page);
    this.coverImageUploader = new AttachementUploaderComponent(page,this.coverImageUploaderContainer);
    this.fileAttachmentUploader = new AttachementUploaderComponent(page,this.fileAttachmentUploaderContainer);
    this.imageCropper = new ImageCropperComponent(page);
    this.contentEditor = new ContentEditorComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    }

  async verifyThePageIsLoaded(): Promise<void> {
    // Implementation removed - abstract method requirement satisfied
  }

  get actions() {
    return new PageCreationActions(this);
  }

  get assertions() {
    return new PageCreationAssertions(this);
  }

}