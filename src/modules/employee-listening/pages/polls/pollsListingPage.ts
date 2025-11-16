import test, { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class PollsListeningPage extends BasePage {
  readonly userModeSideNav: Locator;
  readonly manageFeatureSideNav: Locator;
  readonly pollsSideNav: Locator;
  readonly pageNotFoundMessage: Locator;
  readonly createPollButton: Locator;
  readonly aiPollHeading: Locator;
  readonly pollsSection: Locator;
  readonly pollsTitle: Locator;
  readonly searchField: Locator;
  readonly searchIcon: Locator;
  readonly noPollsFoundMessage: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.POLLS_LISTING_PAGE);

    this.userModeSideNav = this.page.getByRole('menuitem', { name: 'User mode' });
    this.manageFeatureSideNav = this.page.getByRole('menuitem', { name: 'Manage features', exact: true });
    this.pollsSideNav = this.page.getByRole('menuitem', { name: 'Polls Polls' });
    this.pageNotFoundMessage = this.page.getByRole('heading', { name: 'Page not found' });
    this.createPollButton = this.page.getByRole('button', { name: 'Create Poll' });
    this.aiPollHeading = this.page.getByRole('heading', { name: 'Let AI generate your poll' });
    this.pollsSection = this.page.locator('section[data-testid="poll-participation-item"]');
    this.pollsTitle = this.page.locator('section[data-testid="poll-participation-item"] h2');
    this.searchField = this.page.getByRole('textbox', { name: 'Search poll' });
    this.searchIcon = this.page.getByTestId('my-polls-filters').getByRole('button', { name: 'Search' });
    this.noPollsFoundMessage = this.page.getByText('No polls found');
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

  async clickCreatePollButton(): Promise<void> {
    await test.step('Click on "Create Poll" button', async () => {
      await this.clickOnElement(this.createPollButton, {
        stepInfo: 'Click Create Poll button to start poll creation',
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

  async verifyNoPollWithPromptExists(pollPrompt: string): Promise<void> {
    await test.step(`Verify no poll exists with prompt: "${pollPrompt}"`, async () => {
      await this.searchField.fill(pollPrompt);
      await this.searchIcon.click({ timeout: TIMEOUTS.MEDIUM });

      await this.verifier.verifyTheElementIsVisible(this.noPollsFoundMessage, {
        assertionMessage: 'No polls found message should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      const pollsCount = await this.pollsSection.count();
      test.expect(pollsCount, `No poll should exist with the prompt: "${pollPrompt}"`).toBe(0);

      await this.searchField.clear();
    });
  }

  async verifyPollExistsInList(pollQuestion: string): Promise<void> {
    await test.step(`Verify poll exists in list with question: "${pollQuestion}"`, async () => {
      await this.searchField.fill(pollQuestion);
      await this.searchIcon.click({ timeout: TIMEOUTS.MEDIUM });

      await this.page.waitForTimeout(2000);

      const pollsCount = await this.pollsSection.count();
      test.expect(pollsCount, `Poll should exist with the question: "${pollQuestion}"`).toBeGreaterThan(0);

      const pollWithQuestion = this.pollsTitle.filter({ hasText: pollQuestion }).first();
      await this.verifier.verifyTheElementIsVisible(pollWithQuestion, {
        assertionMessage: `Poll with question "${pollQuestion}" should be visible in the polls list`,
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.searchField.clear();
    });
  }

  async clickOnManageFeaturesSideNav(): Promise<void> {
    await test.step('Navigate to Polls page via Manage Features side navigation', async () => {
      await this.clickOnElement(this.manageFeatureSideNav, {
        stepInfo: 'Click Manage Features side navigation to navigate to Manage Features page',
      });
    });
  }

  async clickOnUserModeSideNav(): Promise<void> {
    await test.step('Navigate to Polls page via User Mode side navigation', async () => {
      await this.clickOnElement(this.userModeSideNav, {
        stepInfo: 'Click User Mode side navigation to navigate to User Mode page',
      });
    });
  }

  async clickOnPollsSideNav(): Promise<void> {
    await test.step('Navigate to Polls page via Polls side navigation', async () => {
      await this.clickOnElement(this.pollsSideNav, {
        stepInfo: 'Click Polls side navigation to navigate to Polls page',
      });
    });
  }

  async verifyManageFeatureSideNavIsActive(): Promise<void> {
    await test.step('Verify Manage Features side navigation is active/selected', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageFeatureSideNav, {
        assertionMessage: 'Manage Features side navigation should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      // Check that the Manage Features button has the active class
      const classAttribute = await this.manageFeatureSideNav.getAttribute('class');
      test.expect(classAttribute, 'Manage Features should have active state class').toContain('active');
    });
  }

  async verifyUserModeSideNavIsActive(): Promise<void> {
    await test.step('Verify User Mode side navigation is active/selected', async () => {
      await this.verifier.verifyTheElementIsVisible(this.userModeSideNav, {
        assertionMessage: 'User Mode side navigation should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      // Check that the Manage Features button has the active class
      const classAttribute = await this.userModeSideNav.getAttribute('class');
      test.expect(classAttribute, 'User Mode should have active state class').toContain('active');
    });
  }
}
