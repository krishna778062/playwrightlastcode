import { Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageTopicsComponent } from '@/src/modules/content/ui/components/manageTopicsComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';

export interface ITopicDetailsPageActions {
  clickAndVerifyTheCreatedAlbum: (albumName: string) => Promise<void>;
}

export interface ITopicDetailsPageAssertions {
  verifyingCreatedContentInTopicDetailsPage: (
    albumName: string,
    eventName: string,
    randomPageName: string
  ) => Promise<void>;
}
export class TopicDetailsPage extends BasePage implements ITopicDetailsPageActions, ITopicDetailsPageAssertions {
  private manageTopicsComponent: ManageTopicsComponent;
  private contentPreviewPage: ContentPreviewPage;

  constructor(page: Page, topicId: string) {
    super(page, PAGE_ENDPOINTS.getTopicDetailsPage(topicId));
    this.manageTopicsComponent = new ManageTopicsComponent(page);
    this.contentPreviewPage = new ContentPreviewPage(page);
  }

  get actions(): ITopicDetailsPageActions {
    return this;
  }

  get assertions(): ITopicDetailsPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify topic details page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageTopicsComponent.manageTopicsHeading, {
        assertionMessage: 'Topic details page should be visible',
      });
    });
  }

  async verifyingCreatedContentInTopicDetailsPage(
    albumName: string,
    eventName: string,
    randomPageName: string
  ): Promise<void> {
    await test.step(`Verifying created content in topic details page`, async () => {
      // Verify each content item individually
      const contentItems = [
        { name: albumName, type: 'album' },
        { name: eventName, type: 'event' },
        { name: randomPageName, type: 'page' },
      ];

      for (const item of contentItems) {
        await this.verifier.verifyTheElementIsVisible(this.page.getByRole('listitem').filter({ hasText: item.name }), {
          assertionMessage: `Created ${item.type} "${item.name}" should be visible in topic details page`,
        });
      }
    });
  }

  async clickAndVerifyTheCreatedAlbum(contentName: string): Promise<void> {
    await test.step(`Clicking on created content "${contentName}"`, async () => {
      await this.clickOnElement(this.page.getByRole('link', { name: contentName }));
    });
    await this.contentPreviewPage.assertions.verifyingAlbumHeadingOnContentPreviewPage();
  }
}
