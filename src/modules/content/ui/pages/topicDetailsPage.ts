import { faker } from '@faker-js/faker';
import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { ShareSocialCampaignComponent } from '@/src/modules/content/ui/components/shareComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
export interface ITopicDetailsPageActions {
  clickAndVerifyTheCreatedAlbum: (albumName: string) => Promise<void>;
  clickOnFeedTab: () => Promise<void>;
  clickingOnUsername: () => Promise<void>;
  hoveringOnFeed: () => Promise<void>;
  likingTheFeed: () => Promise<void>;
  replyingToTheFeed: () => Promise<void>;
  clickingOnShareButton: () => Promise<void>;
  clickingOnSharePostButton: () => Promise<void>;
}

export interface ITopicDetailsPageAssertions {
  verifyingCreatedContentInTopicDetailsPage: (
    albumName: string,
    eventName: string,
    randomPageName: string
  ) => Promise<void>;
  verifyingCreatedFeedInTopicDetailsPage: (feedText: string) => Promise<void>;
  verifyingEllipsesOptions: () => Promise<void>;
  verifyingFavoriteOption: () => Promise<void>;
  verifyingSharePostToastMessage: (message: string) => Promise<void>;
}
export class TopicDetailsPage extends BasePage implements ITopicDetailsPageActions, ITopicDetailsPageAssertions {
  private contentPreviewPage: ContentPreviewPage;
  private baseActionUtil: BaseActionUtil;
  private shareSocialCampaignComponent: ShareSocialCampaignComponent;
  readonly clickingOnFeedTab: Locator = this.page.getByRole('tab', { name: 'Feed' });
  readonly ellipsesButton: Locator = this.page.getByRole('button', { name: 'Show more' });
  readonly editOption: Locator = this.page.getByText('Edit');
  readonly deleteOption: Locator = this.page.getByText('Delete');
  readonly copyLinkOption: Locator = this.page.getByText('Copy link');
  readonly favoriteOption: Locator = this.page.getByRole('button', { name: 'Favorite this post' });
  readonly likePostButton: Locator = this.page.getByRole('button', { name: 'React to this post' });
  readonly replyField: Locator = this.page.getByRole('button', { name: 'Leave a reply…' });
  readonly replyButton: Locator = this.page.getByRole('button', { name: 'Reply', exact: true });
  readonly textField: Locator = this.page
    .getByRole('textbox', { name: 'You are in the content editor' })
    .getByRole('paragraph');
  readonly shareButton: Locator = this.page.getByRole('button', { name: 'Share this post' });
  readonly topicScreenContentAndFeedTabs: Locator = this.page.getByText('ContentFeed');

  constructor(page: Page, topicId: string) {
    super(page, PAGE_ENDPOINTS.getTopicDetailsPage(topicId));
    this.contentPreviewPage = new ContentPreviewPage(page);
    this.baseActionUtil = new BaseActionUtil(page);
    this.shareSocialCampaignComponent = new ShareSocialCampaignComponent(page);
  }

  get actions(): ITopicDetailsPageActions {
    return this;
  }

  get assertions(): ITopicDetailsPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify topic details page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.topicScreenContentAndFeedTabs, {
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

  async clickOnFeedTab(): Promise<void> {
    await test.step('Clicking on feed tab', async () => {
      await this.clickOnElement(this.clickingOnFeedTab);
    });
  }

  async verifyingCreatedFeedInTopicDetailsPage(feedText: string): Promise<void> {
    await test.step(`Verifying created feed "${feedText}" in topic details page feed tab`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByText(feedText), {
        assertionMessage: `Created feed "${feedText}" should be visible in topic details page feed tab`,
      });
    });
  }

  async clickingOnUsername(): Promise<void> {
    await test.step(`Clicking and verifying the username`, async () => {
      const loggedInUserName = await this.baseActionUtil.getCurrentLoggedInUserName();
      await this.clickOnElement(this.page.getByRole('link', { name: loggedInUserName }));
    });
  }

  async hoveringOnFeed(): Promise<void> {
    await test.step('Hovering on feed ', async () => {
      const loggedInUserName = await this.baseActionUtil.getCurrentLoggedInUserName();
      await this.baseActionUtil.hoverOverElementInJavaScript(this.page.getByRole('link', { name: loggedInUserName }));
    });
  }

  async verifyingEllipsesOptions(): Promise<void> {
    await test.step('Verifying ellipses options', async () => {
      await this.clickOnElement(this.ellipsesButton);
      await this.verifier.verifyTheElementIsVisible(this.editOption);
      await this.verifier.verifyTheElementIsVisible(this.deleteOption);
      await this.verifier.verifyTheElementIsVisible(this.copyLinkOption);
    });
  }

  async verifyingFavoriteOption(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.favoriteOption);
  }

  async likingTheFeed(): Promise<void> {
    await test.step('Liking the feed', async () => {
      await this.clickOnElement(this.likePostButton);
    });
  }

  async replyingToTheFeed(): Promise<void> {
    await this.clickOnElement(this.replyField);
    const randomText = faker.lorem.sentence();
    await this.baseActionUtil.fillInElement(this.textField, randomText);
    await this.clickOnElement(this.replyButton);
  }

  async clickingOnShareButton(): Promise<void> {
    await this.clickOnElement(this.shareButton);
  }

  async clickingOnSharePostButton(): Promise<void> {
    await this.shareSocialCampaignComponent.clickShareButton();
  }

  async verifyingSharePostToastMessage(message: string): Promise<void> {
    await this.baseActionUtil.verifyToastMessageIsVisibleWithText(message);
  }
}
