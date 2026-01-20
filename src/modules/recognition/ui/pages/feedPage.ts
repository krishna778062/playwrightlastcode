import { expect, Locator, Page, test } from '@playwright/test';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class FeedPage extends BasePage {
  readonly shareThoughtsButton: Locator;
  readonly viewRecognitionLink: Locator;
  readonly feedPostCards: Locator;
  readonly recognitionTab: Locator;
  readonly peerRecognitionButton: Locator;
  readonly spotAwardButton: Locator;
  readonly recognitionForm: Locator;
  readonly recognitionRecipientsInput: Locator;
  readonly selectAwardInput: Locator;
  readonly selectPeerRecognitionInput: Locator;
  readonly selectedAwardInRecognition: Locator;
  readonly suggesterContainer: Locator;
  readonly selectOptions: Locator;
  readonly recipientsInput: Locator;
  readonly descriptionTextArea: Locator;
  readonly companyValues: Locator;
  readonly companyValuesField: Locator;
  readonly loadingIndicator: Locator;
  readonly recognizeButton: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.HOME_PAGE) {
    super(page, pageUrl);
    this.shareThoughtsButton = page.getByText('Share your thoughts', { exact: false });
    this.feedPostCards = page.locator('[class^=Recognition_panelInner]');
    this.viewRecognitionLink = page.getByRole('link', { name: /View recognition/i }).first();
    this.recognitionTab = page.locator('[role="tablist"] button[name="recognition"]');
    this.peerRecognitionButton = page.getByRole('button', { name: 'Peer recognition' });
    this.spotAwardButton = page.getByRole('button', { name: 'Spot award' });
    this.loadingIndicator = page.locator('div[class*="LoadingIndicator-module__wrapper"]');

    //Recognition form locators
    this.recognitionForm = page.locator('div[class*="_PostForm"]');
    this.recognitionRecipientsInput = this.recognitionForm.locator('[aria-label="Who do you want to recognize?"]');
    this.selectAwardInput = this.recognitionForm.getByTestId('field-Select award').locator('input[type="text"]');
    this.selectPeerRecognitionInput = this.recognitionForm.locator(
      'input[aria-label="Select an award for the recognition"]'
    );
    this.selectedAwardInRecognition = this.recognitionForm.locator('div[class*="AwardSelect_singleValueWrapper"] p');
    this.suggesterContainer = this.recognitionForm.getByRole('listbox');
    this.selectOptions = this.recognitionForm.getByRole('menuitem');
    this.recipientsInput = this.recognitionForm.locator('[data-testid*="awarding this"] input[type="text"]');
    this.descriptionTextArea = this.recognitionForm.locator('[class*="tiptap ProseMirror"]');
    this.companyValues = this.recognitionForm.getByTestId('field-Company values');
    this.companyValuesField = this.recognitionForm.getByTestId('field-Company values');
    this.recognizeButton = this.recognitionForm.getByRole('button', { name: 'Recognize' });
  }

  /**
   * Verify that the feed page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the feed page is loaded', async () => {
      await expect(this.shareThoughtsButton, 'expecting share thoughts button to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  /**
   * Navigate to feed page via endpoint
   */
  async navigateFeedPageViaEndpoint(
    endpoint: string,
    feedType?: 'home feed' | 'site feed',
    siteName?: string
  ): Promise<void> {
    await test.step(`Navigating to ${endpoint} via endpoint`, async () => {
      const url = getRecognitionTenantConfigFromCache().frontendBaseUrl + endpoint;
      await this.page.goto(url);
      if (feedType === 'site feed') {
        const targetSite = siteName ?? (getRecognitionTenantConfigFromCache() as any).siteName ?? '';
        const siteLink = this.page.getByRole('link', { name: new RegExp(targetSite, 'i') }).first();
        await expect(siteLink, 'Target site link should be visible').toBeVisible({ timeout: TIMEOUTS.LONG });
        await siteLink.click({ timeout: TIMEOUTS.MEDIUM });
        await this.page.waitForURL(/\/site\/[^/]+\/dashboard/, { timeout: TIMEOUTS.LONG });
      }
      await this.verifyThePageIsLoaded();
    });
  }

  async clickViewRecognitionLinkOnFeedPage(
    postIndex: number,
    _feedType: 'home feed' | 'site feed',
    _siteName?: string
  ): Promise<void> {
    await test.step('Click on View Recognition link on feed page', async () => {
      const feedPostCard = this.feedPostCards.nth(postIndex);
      await feedPostCard.scrollIntoViewIfNeeded();
      const viewRecognitionLink = feedPostCard.getByRole('link', { name: /View recognition/i });
      await expect(
        viewRecognitionLink,
        'View recognition link should be visible for the specific shared recognition post'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(
        viewRecognitionLink,
        'View recognition link should be visible for the specific shared recognition post'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(viewRecognitionLink, {
        timeout: TIMEOUTS.MEDIUM,
        stepInfo: 'Clicking on View recognition link for the specific shared recognition post',
      });
    });
  }

  async clickRecognitionTabFromFeedPage() {
    await test.step('Click on Recognition tab from feed page', async () => {
      await this.shareThoughtsButton.waitFor({ state: 'visible' });
      await this.clickOnElement(this.shareThoughtsButton, { stepInfo: 'Clicking on Share thoughts button' });
      await this.recognitionTab.waitFor({ state: 'visible' });
      await expect(this.recognitionTab, 'Recognition tab should be visible').toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.recognitionTab, { stepInfo: 'Clicking on Recognition tab' });
      await this.recognizeButton.waitFor({ state: 'visible' });
    });
  }

  /**
   * Select the user for recognition
   */
  async selectUserForRecognitionFeedPage(userName: string | number): Promise<void> {
    await this.loadingIndicator.first().waitFor({ state: 'detached' });
    if (typeof userName === 'string') {
      await this.recognitionRecipientsInput.click();
      await this.suggesterContainer.last().waitFor({ state: 'visible' });
      await this.page.waitForTimeout(200);
      await this.recognitionRecipientsInput.fill(userName);
      await this.suggesterContainer.last().waitFor({ state: 'visible' });
      await this.getOption(userName).first().click();
    } else {
      await this.recognitionRecipientsInput.click();
      await this.suggesterContainer.last().waitFor({ state: 'visible' });
      await this.getOption(userName).first().click();
    }
  }

  /**
   * Select the peer recognition award for recognition
   */
  async selectAwardForRecognitionFeedPage(awardName: string | number): Promise<string> {
    if (typeof awardName === 'string') {
      await this.selectPeerRecognitionInput.click();
      await this.selectPeerRecognitionInput.fill(awardName);
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(awardName).click();
    } else {
      await this.selectPeerRecognitionInput.click();
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(awardName).first().click();
    }
    const text = await this.selectedAwardInRecognition.textContent();
    return text || '';
  }

  /**
   * Enter the recognition message
   */
  async enterDescriptionMessageFeedPage(message: string): Promise<string | void> {
    await this.descriptionTextArea.fill(message);
    return message;
  }

  /**
   * This method returns a locator for the suggested item.
   * @param identifier - The identifier can be a string or a number.
   * @returns {Locator} - The locator for the option.
   */
  getOption(identifier: string | number): Locator {
    void this.page.waitForTimeout(500);
    if (typeof identifier === 'string') {
      return this.suggesterContainer.getByText(identifier).first();
    } else {
      return this.suggesterContainer.locator('[role="option"]').nth(identifier).first();
    }
  }
}
