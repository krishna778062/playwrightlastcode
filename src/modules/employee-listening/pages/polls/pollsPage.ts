import test, { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class PollsListeningPage extends BasePage {
  readonly pageNotFoundMessage: Locator;
  readonly createPollButton: Locator;
  readonly aiPollHeading: Locator;
  readonly pollsSection: Locator;
  readonly pollsTitle: Locator;
  readonly searchField: Locator;
  readonly searchIcon: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.POLLS_LISTING_PAGE);

    this.pageNotFoundMessage = this.page.getByRole('heading', { name: 'Page not found' });
    this.createPollButton = this.page.getByRole('button', { name: 'Create Poll' });
    this.aiPollHeading = this.page.getByRole('heading', { name: 'Let AI generate your poll' });
    this.pollsSection = this.page.locator('section[data-testid="poll-participation-item"]');
    this.pollsTitle = this.page.locator('section[data-testid="poll-participation-item"] h2');
    this.searchField = this.page.getByRole('textbox', { name: 'Search poll' });
    this.searchIcon = this.page.getByTestId('my-polls-filters').getByRole('button', { name: 'Search' });
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Polls listing page is loaded', async () => {
      const url = this.page.url();
      test.expect(url, 'URL should contain polls listing page endpoint').toContain(PAGE_ENDPOINTS.POLLS_LISTING_PAGE);
      await this.verifier.verifyTheElementIsVisible(this.pollsSection.first(), { timeout: TIMEOUTS.MEDIUM });
    });
  }

  async verifyPageNotFoundIsVisible(): Promise<void> {
    await test.step('Verify Polls listing page shows Page not found', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageNotFoundMessage, {
        assertionMessage: 'Page not found',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async pollsPageValidation(): Promise<void> {
    await test.step('Verify Polls listing page has polls', async () => {
      const pollsCount = await this.pollsSection.count();
      test.expect(pollsCount, 'Poll count should be greater than 0').toBeGreaterThan(0);
    });
  }

  async verifyAIPollIsNotVisible(): Promise<void> {
    await test.step('Verify AI Polls creation page is not visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createPollButton, {
        assertionMessage: 'Create Poll',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsNotVisible(this.aiPollHeading, { timeout: TIMEOUTS.MEDIUM });
    });
  }

  async verifyAIPollIsVisible(): Promise<void> {
    await test.step('Verify AI Polls creation page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createPollButton, { timeout: TIMEOUTS.MEDIUM });
      await this.createPollButton.click({ timeout: TIMEOUTS.MEDIUM });
      await this.verifier.verifyTheElementIsVisible(this.aiPollHeading, {
        assertionMessage: 'Let AI generate your poll',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async searchPoll(): Promise<void> {
    await test.step('Search for a specific poll', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const pollName = ((await this.pollsTitle.allInnerTexts()) || [])[0].split('\t')[0];
      test.expect(pollName.length, 'Polls count should be greater than 2').toBeGreaterThan(2);

      await this.searchField.fill(String(pollName));
      await this.searchIcon.click({ timeout: TIMEOUTS.MEDIUM });

      await this.verifier.waitUntilElementIsVisible(this.pollsSection.first(), { timeout: 3000 });
      test
        .expect(
          await this.pollsSection.first().isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Searched poll should be visible in results'
        )
        .toBe(true);
      await this.searchField.clear();
    });
  }
}
