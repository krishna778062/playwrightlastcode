import { Page, expect } from '@playwright/test';
import { BasePage } from '@core/pages/basePage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';
import { ContentCreationAssertions } from '../helpers/contentAssertionHelper';
import { AddContentModalComponent } from '../components/addContentModal';
import { PageCreationActions } from '../helpers/contentCreationPageActions';
import { PageCreationFormComponent } from '../components/pageCreationForm';
import { ContentEditorComponent } from '../components/contentEditor';
import { ImageUploaderComponent } from '../components/imageUploader';

export class PageCreationPage extends BasePage<PageCreationActions, ContentCreationAssertions> {
  // Page elements
  readonly addContentModal: AddContentModalComponent;
  readonly pageCreationForm: PageCreationFormComponent;
  readonly imageUploader: ImageUploaderComponent;
  readonly contentEditor: ContentEditorComponent;

  constructor(page: Page) {
    super(page);
    this.addContentModal = new AddContentModalComponent(page);
    this.pageCreationForm = new PageCreationFormComponent(page);
    this.imageUploader = new ImageUploaderComponent(page);
    this.contentEditor = new ContentEditorComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.addContentModal.createSection, 'Create section should be visible').toBeVisible({
      timeout: CONTENT_TEST_DATA.TIMEOUTS.DEFAULT,
    });
  }

  get actions() {
    return new PageCreationActions(this);
  }

  get assertions() {
    return new ContentCreationAssertions(this);
  }

}