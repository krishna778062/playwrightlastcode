import test, { Locator, Page } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class SurveysListingPage extends BasePage {
  readonly pageNotFoundMessage: Locator;
  readonly createSurveyButton: Locator;
  readonly surveysSection: Locator;
  readonly surveysTitle: Locator;
  readonly searchField: Locator;
  readonly searchIcon: Locator;
  readonly manageSurveysHeader: Locator;
  readonly surveysTable: Locator;
  readonly noSurveysMessage: Locator;

  constructor(page: Page) {
    super(page, '/surveys/manage');

    this.pageNotFoundMessage = this.page.getByRole('heading', { name: 'Page not found' });
    this.createSurveyButton = this.page.getByRole('button', { name: 'Create Survey' });
    this.surveysSection = this.page
      .locator('section[data-testid="surveys-section"]')
      .or(this.page.locator('div').filter({ hasText: /surveys/i }));
    this.surveysTitle = this.page.getByRole('heading', { name: /surveys/i });
    this.searchField = this.page
      .getByRole('textbox', { name: 'Search survey' })
      .or(this.page.getByPlaceholder('Search surveys'));
    this.searchIcon = this.page
      .getByTestId('surveys-search')
      .getByRole('button', { name: 'Search' })
      .or(this.page.getByRole('button', { name: 'Search' }));
    this.manageSurveysHeader = this.page.getByRole('heading', { name: 'Manage Surveys' });
    this.surveysTable = this.page.getByRole('table').or(this.page.locator('[data-testid="surveys-table"]'));
    this.noSurveysMessage = this.page.getByText('No surveys found').or(this.page.getByText('No surveys available'));
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Surveys Listing page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createSurveyButton, {
        assertionMessage: 'Create Survey button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyPageNotFoundIsVisible(): Promise<void> {
    await test.step('Verify page not found message is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageNotFoundMessage, {
        assertionMessage: 'Page not found message should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickCreateSurveyButton(): Promise<void> {
    await test.step('Click Create Survey button', async () => {
      await this.clickOnElement(this.createSurveyButton, {
        stepInfo: 'Click Create Survey button',
      });
    });
  }

  async searchSurveys(searchTerm: string): Promise<void> {
    await test.step(`Search for surveys with term: ${searchTerm}`, async () => {
      await this.fillInElement(this.searchField, searchTerm, {
        stepInfo: `Enter search term: ${searchTerm}`,
      });
      await this.clickOnElement(this.searchIcon, {
        stepInfo: 'Click search icon',
      });
    });
  }

  async verifySurveysTableIsVisible(): Promise<void> {
    await test.step('Verify surveys table is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.surveysTable, {
        assertionMessage: 'Surveys table should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyNoSurveysMessage(): Promise<void> {
    await test.step('Verify no surveys message is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.noSurveysMessage, {
        assertionMessage: 'No surveys message should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifySurveyInList(surveyName: string): Promise<void> {
    await test.step(`Verify survey "${surveyName}" appears in the list`, async () => {
      const surveyElement = this.page.getByText(surveyName);
      await this.verifier.verifyTheElementIsVisible(surveyElement, {
        assertionMessage: `Survey "${surveyName}" should be visible in the list`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
