import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { PageCreationPage } from '../pages/pageCreationPage';
import { AlbumCreationPage } from '../pages/albumCreationPage';
import { EventCreationPage } from '../pages/eventCreationPage';
import { AddContentModalComponent } from './addContentModal';

export class CreateComponent extends BaseComponent {
  readonly pageOption: Locator;
  readonly albumOption: Locator;
  readonly eventOption: Locator;
  constructor(page: Page) {
    super(page);
    this.pageOption = this.page.locator("p", { hasText: "Page" });
    this.albumOption = this.page.locator("p", { hasText: "Album" });
    this.eventOption = this.page.locator("p", { hasText: "Event" });
  }

  /**
   * Selects the content type and returns the appropriate creation page
   * @param contentType - The content type to select
   * @param options - The options for the step
   * @returns The corresponding creation page
   */
  async selectContentTypeAndCreateContent(
    contentType: 'Page' | 'Album' | 'Event',
    options?: { stepInfo?: string }
  ): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Selecting content type: ${contentType}`, async () => {
      // Select the content type
      await this.selectContentType(contentType);
      
      let addContentModal = new AddContentModalComponent(this.page);
      return addContentModal;
    });
  }

  /**
   * Selects a content type option
   * @param contentType - The content type to select
   * @param options - The options for the step
   */
  async selectContentType(contentType: 'Page' | 'Album' | 'Event', options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Selecting content type: ${contentType}`, async () => {
      switch (contentType) {
        case 'Page':
          await this.clickOnElement(this.pageOption);
          break;
        case 'Album':
          await this.clickOnElement(this.albumOption);
          break;
        case 'Event':
          await this.clickOnElement(this.eventOption);
          break;
      }
    });
  }


} 