import { expect, Locator, Page, test } from '@playwright/test';

import { AddTileComponent } from '@content/ui/components/addTileComponent';
import { BaseSitePage } from '@content/ui/pages/sitePages/baseSite';

import { CreateFeedPostComponent } from '../../components/createFeedPostComponent';
import { CreateQuestionComponent, QuestionOptions, QuestionResult } from '../../components/createQuestionComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { CarouselComponent } from '@/src/modules/content/ui/components/carouselComponent';
import { EditBarComponent } from '@/src/modules/content/ui/components/editBarComponent';
import { ListFeedComponent } from '@/src/modules/content/ui/components/listFeedComponent';

export interface ISiteDashboardActions {
  navigateToManageSite: () => Promise<void>;
  clickOnFeedLink: () => Promise<void>;
  clickOnOptionsMenu: (commentText: string) => Promise<void>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  deletePost: (postText: string) => Promise<void>;
  clickOnEditCarousel: () => Promise<void>;
  clickOnAddTile: () => Promise<void>;
  clickOnEditDashboard: () => Promise<void>;
  enterSearchCarouselInput: (text: string) => Promise<void>;
  selectCarouselItem: (text: string) => Promise<void>;
  clickDoneButton: () => Promise<void>;
  clickOnSocialCampaignTile: () => Promise<void>;
  clickOnCustomSCTile: () => Promise<void>;
  enterTileTitle: (tileTitle: string) => Promise<void>;
  setCustomSCTitle: (title: string) => Promise<void>;
  clickAddToHomeButton: () => Promise<string>;
  clickAddToSiteButton: (siteId: string) => Promise<string>;
  clickShareThoughtsButton: () => Promise<void>;
  clickQuestionButton: () => Promise<void>;
  createAndPostQuestion: (options: QuestionOptions) => Promise<QuestionResult>;
  editQuestion: (questionTitle: string, newTitle: string) => Promise<void>;
}

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyDashboardUrl: (siteId: string) => Promise<void>;
  verifySiteCreatedSuccessfully: (siteName: string) => Promise<void>;
  verifyCategoryCreatedSuccessfully: (categoryName: string) => Promise<void>;
  verifyCampaignLinkDisplayed: (linkText: string, description: string) => Promise<void>;
  verifyAddContentButtonIsNotVisible: () => Promise<void>;
  verifyAddContentButtonIsVisible: () => Promise<void>;
  verifySocalCampaignInCarouselModal: (text: string) => Promise<void>;
  verifySocalCampaignInCarouselItem: (text: string) => Promise<void>;
  verifySocalCampaignIsNotInCarouselItem: (text: string) => Promise<void>;
  verifySocialCampaignShareButtonIsNotVisible: (description: string) => Promise<void>;
  verifyTileIsDisplayed: (tileTitle: string) => Promise<void>;
  verifySocialCampaignNameInTheDisplayed: (socialCampaignName: string) => Promise<void>;
  verifySocialCampaignNameNotDisplayed: (socialCampaignName: string) => Promise<void>;
  verifyQuestionCreatedSuccessfully: (questionTitle: string) => Promise<void>;
  verifyFeedSectionIsVisible: () => Promise<void>;
  verifyFeedSectionIsNotVisible: () => Promise<void>;
  verifyEditAndDeleteOptionsVisible: (commentText: string) => Promise<void>;
  validatePostText: (postText: string) => Promise<void>;
  validatePostNotVisible: (postText: string) => Promise<void>;
  verifyFeedRestrictionMessageVisible: (expectedText: string) => Promise<void>;
  verifyFeedPlaceholderText: (expectedPlaceholder: string) => Promise<void>;
  verifyTimestampFormat: (postText: string) => Promise<void>;
}

export class SiteDashboardPage extends BaseSitePage implements ISiteDashboardAssertions {
  // Locators for site and category verification
  readonly categoryLink: (categoryName: string) => Locator;
  readonly categoryHeading: (categoryName: string) => Locator;
  readonly siteLink: (siteName: string) => Locator;
  readonly feedLink: Locator;
  readonly editDashboardButton = this.page.locator('div[data-title="Edit dashboard"]');
  readonly carouselItemText = (text: string) => this.page.locator('div').filter({ hasText: text });
  readonly tileListComponent = (tileTitle: string) => this.page.getByRole('heading', { name: tileTitle });
  readonly socialCampaignNameInTileList = (socialCampaignName: string) =>
    this.page.getByRole('button', { name: socialCampaignName }).first();
  readonly addContentButton = this.page.getByRole('button', { name: 'Add content' });
  readonly shareThoughtsButton: Locator;

  // Components
  readonly listFeedComponent: ListFeedComponent;
  private carouselComponent: CarouselComponent;
  private editbarComponent: EditBarComponent;
  private addTileComponent: AddTileComponent;
  private createQuestionComponent: CreateQuestionComponent;
  private createFeedPostComponent: CreateFeedPostComponent;
  // Actions
  get actions(): ISiteDashboardActions {
    return this;
  }

  constructor(page: Page, siteId: string) {
    super(page, siteId);
    this.listFeedComponent = new ListFeedComponent(page);
    this.carouselComponent = new CarouselComponent(page);
    this.editbarComponent = new EditBarComponent(page);
    this.addTileComponent = new AddTileComponent(page);
    this.createFeedPostComponent = new CreateFeedPostComponent(page);
    this.createQuestionComponent = new CreateQuestionComponent(page);
    this.feedLink = this.page.locator('a#dashboard:has-text("eed")');
    this.categoryLink = (categoryName: string) => this.page.getByRole('link', { name: categoryName });
    this.categoryHeading = (categoryName: string) => this.page.getByRole('heading', { name: categoryName });
    this.siteLink = (siteName: string) => this.page.getByRole('link', { name: siteName });
    this.shareThoughtsButton = this.page.locator('span', { hasText: 'Share your thought' });
  }
  /**
   * Verifies that site was created successfully by checking if site link is visible
   * @param siteName - The site name to verify
   */
  async verifySiteCreatedSuccessfully(siteName: string): Promise<void> {
    await test.step(`Verify site "${siteName}" was created successfully`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteLink(siteName), {
        assertionMessage: `Site link "${siteName}" should be visible after creation`,
        timeout: 15000,
      });
    });
  }
  /**
   * Verifies that category was created successfully by checking if category link is visible
   * @param categoryName - The category name to verify
   */
  async verifyCategoryCreatedSuccessfully(categoryName: string): Promise<void> {
    await test.step(`Verify category "${categoryName}" was created successfully`, async () => {
      // First verify category link is visible (means category was created)
      const categoryLink = this.categoryLink(categoryName);
      await this.verifier.verifyTheElementIsVisible(categoryLink, {
        assertionMessage: `Category link "${categoryName}" should be visible`,
        timeout: 18000,
      });

      // Click on category link to navigate to category page
      await this.clickOnElement(categoryLink);

      // Then verify the heading is visible on category page
      const categoryHeading = this.categoryHeading(categoryName);
      await this.verifier.verifyTheElementIsVisible(categoryHeading, {
        assertionMessage: `Category heading "${categoryName}" should be visible`,
        timeout: 15000,
      });
    });
  }

  // Assertions
  get assertions(): ISiteDashboardAssertions {
    return this;
  }

  /**
   * Verifies that the site dashboard page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verifies that the current URL matches the expected site dashboard URL
   * @param siteId - The site ID to verify in the URL
   */
  async verifyDashboardUrl(siteId: string): Promise<void> {
    await test.step(`Verify dashboard URL matches expected URL for site ID: ${siteId}`, async () => {
      const expectedUrl = PAGE_ENDPOINTS.getSiteDashboardPage(siteId);
      await expect(this.page, `should match expected URL: ${expectedUrl}`).toHaveURL(expectedUrl);
    });
  }

  async clickOnFeedLink(): Promise<void> {
    await test.step('Click on feed link', async () => {
      await this.clickOnElement(this.feedLink);
    });
  }

  async verifyCampaignLinkDisplayed(linkText: string, description: string): Promise<void> {
    await this.listFeedComponent.verifyCampaignLinkDisplayed(linkText, description);
  }

  async verifyAddContentButtonIsNotVisible(): Promise<void> {
    await test.step('Verify add content button is not visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.addContentButton, {
        assertionMessage: 'Add content button should not be visible',
      });
    });
  }

  async verifySocialCampaignShareButtonIsNotVisible(description: string): Promise<void> {
    await this.listFeedComponent.verifySocialCampaignShareButtonIsNotVisible(description);
  }

  async clickOnEditCarousel(): Promise<void> {
    return this.editbarComponent.clickEditCarousel();
  }

  async clickOnEditDashboard(): Promise<void> {
    await test.step('Click on edit dashboard', async () => {
      await this.clickOnElement(this.editDashboardButton);
    });
  }

  async clickOnAddTile(): Promise<void> {
    return this.editbarComponent.clickOnAddTile();
  }

  async verifySocalCampaignInCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.carouselItemText(text));
  }

  async verifySocalCampaignIsNotInCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.carouselItemText(text));
  }

  async verifySocalCampaignInCarouselModal(text: string): Promise<void> {
    return this.carouselComponent.verifyCarouselItem(text);
  }

  async clickDoneButton(): Promise<void> {
    return this.carouselComponent.clickDoneButton();
  }

  async enterSearchCarouselInput(text: string): Promise<void> {
    return this.carouselComponent.getSearchCarouselInput(text);
  }

  async selectCarouselItem(text: string): Promise<void> {
    return this.carouselComponent.selectCarouselItem(text);
  }

  async clickOnSocialCampaignTile(): Promise<void> {
    return this.addTileComponent.clickSocialCampaignsButton();
  }

  async clickOnCustomSCTile(): Promise<void> {
    return this.addTileComponent.clickCustomTab();
  }

  async enterTileTitle(tileTitle: string): Promise<void> {
    return this.addTileComponent.setTileTitle(tileTitle);
  }

  async setCustomSCTitle(title: string): Promise<void> {
    return this.addTileComponent.setCustomSCTitle(title);
  }

  async clickAddToHomeButton(): Promise<string> {
    return this.addTileComponent.clickAddToHomeButton();
  }

  async verifyTileIsDisplayed(tileTitle: string): Promise<void> {
    await test.step('Verifying tile is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.tileListComponent(tileTitle), {
        timeout: 20000,
        assertionMessage: `Tile title '${tileTitle}' should be displayed`,
      });
    });
  }

  async verifyAddContentButtonIsVisible(): Promise<void> {
    await test.step('Verify add content button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addContentButton, {
        assertionMessage: 'Add content button should not be visible',
      });
    });
  }
  async verifySocialCampaignNameInTheDisplayed(socialCampaignName: string): Promise<void> {
    await test.step('Verifying social campaign name is displayed in the displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.socialCampaignNameInTileList(socialCampaignName), {
        timeout: 20000,
        assertionMessage: `Social campaign name '${socialCampaignName}' should be displayed`,
      });
    });
  }

  async verifySocialCampaignNameNotDisplayed(socialCampaignName: string): Promise<void> {
    await test.step('Verifying social campaign name is displayed in the displayed', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.socialCampaignNameInTileList(socialCampaignName), {
        timeout: 20000,
        assertionMessage: `Social campaign name '${socialCampaignName}' should be displayed`,
      });
    });
  }

  /**
   * Clicks the share thoughts button to open post editor
   */
  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
      await this.clickOnElement(this.shareThoughtsButton);
    });
  }

  async clickQuestionButton(): Promise<void> {
    await this.createFeedPostComponent.clickQuestionButton();
  }

  async createAndPostQuestion(options: QuestionOptions): Promise<QuestionResult> {
    return this.createQuestionComponent.createAndPostQuestion(options);
  }

  async clickOnOptionsMenu(commentText: string): Promise<void> {
    await this.listFeedComponent.openPostOptionsMenu(commentText);
  }

  async editQuestion(questionTitle: string, newTitle: string): Promise<void> {
    await this.createQuestionComponent.editQuestion(questionTitle, newTitle);
  }

  async verifyQuestionCreatedSuccessfully(questionTitle: string): Promise<void> {
    await this.createQuestionComponent.verifyQuestionCreatedSuccessfully(questionTitle);
  }

  async clickAddToSiteButton(siteId: string): Promise<string> {
    return this.addTileComponent.clickAddToSiteButton(siteId);
  }

  async verifyFeedSectionIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should be visible',
    });
  }

  async verifyFeedSectionIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should not be visible',
    });
  }

  async verifyEditAndDeleteOptionsVisible(commentText: string): Promise<void> {
    await this.createFeedPostComponent.verifyEditAndDeleteOptionsVisible(commentText);
  }

  async editPost(currentText: string, newText: string): Promise<void> {
    await this.createFeedPostComponent.editPost(currentText, newText);
  }

  async deletePost(postText: string): Promise<void> {
    await test.step(`Deleting post with text: ${postText}`, async () => {
      await this.listFeedComponent.openPostOptionsMenu(postText);
      await this.listFeedComponent.clickDeleteOption();
      await this.listFeedComponent.confirmDelete();
    });
  }

  async validatePostText(postText: string): Promise<void> {
    await this.listFeedComponent.validatePostText(postText);
  }

  async validatePostNotVisible(postText: string): Promise<void> {
    await this.listFeedComponent.validatePostNotVisible(postText);
  }

  async verifyFeedRestrictionMessageVisible(expectedText: string): Promise<void> {
    await this.createFeedPostComponent.verifyFeedRestrictionMessageVisible(expectedText);
  }
  async verifyFeedPlaceholderText(expectedPlaceholder: string): Promise<void> {
    await this.createFeedPostComponent.verifyFeedPlaceholderText(expectedPlaceholder);
  }

  async verifyTimestampFormat(postText: string): Promise<void> {
    await this.listFeedComponent.verifyTimestampFormat(postText);
  }
}
