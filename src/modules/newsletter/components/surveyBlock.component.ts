import { Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class SurveyBlockComponent extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  // Block selection
  readonly surveyBlockButton: Locator;

  // Survey modal
  readonly selectSurveyText: Locator;

  // Search combobox (in editor)
  readonly searchCombobox: Locator;

  // Browse button in sidebar
  readonly browseButtonInSidebar: Locator;

  // Device buttons for preview (mobile/desktop view)
  readonly deviceButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    // Block selection - the Survey block in the blocks panel
    this.surveyBlockButton = this.page.locator('[data-chockablock-item-id="Survey"]');

    // Survey modal text
    this.selectSurveyText = this.page.getByText('Select a survey to add to newsletter');

    // Search combobox (in editor)
    this.searchCombobox = this.page.getByRole('combobox');

    // Browse button in sidebar
    this.browseButtonInSidebar = this.page
      .locator('div[class*="Sidebar_inner"] [type="button"]')
      .filter({ hasText: 'Browse' });

    // Device buttons for preview (mobile/desktop view)
    this.deviceButtons = this.page.locator('button[class*="Editor_deviceButton"]');
  }

  /**
   * Asserts that the survey block is visible
   */
  async assertSurveysBlock(): Promise<void> {
    await test.step('Assert survey block is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.surveyBlockButton, {
        timeout: TIMEOUTS.SHORT,
        assertionMessage: 'Survey block should be visible',
      });
    });
  }

  /**
   * Clicks to add the survey block
   */
  async clickToAddSurveysBlock(): Promise<void> {
    await test.step('Click to add survey block', async () => {
      await this.clickOnElement(this.surveyBlockButton, {
        stepInfo: 'Click survey block',
        force: true,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Asserts that the survey block was added successfully by checking for the modal text
   */
  async assertSurveysBlockAddedSuccussfully(): Promise<void> {
    await test.step('Assert survey block added successfully', async () => {
      await this.verifier.verifyTheElementIsVisible(this.selectSurveyText, {
        assertionMessage: 'Select a survey to add to newsletter text should be visible',
      });
    });
  }

  /**
   * Searches for a survey by typing in the combobox
   * @param searchText - The text to search for
   */
  async searchSurvey(searchText: string = 'a'): Promise<void> {
    await test.step(`Search survey: ${searchText}`, async () => {
      await this.fillInElement(this.searchCombobox, searchText, {
        stepInfo: 'Type in search combobox',
      });
    });
  }

  /**
   * Clicks the Browse button in the sidebar
   */
  async clickToBrowseSurvyeFromSideBar(): Promise<void> {
    await test.step('Click Browse button from sidebar', async () => {
      await this.clickOnElement(this.browseButtonInSidebar, {
        stepInfo: 'Click Browse button in sidebar',
      });
    });
  }

  /**
   * Clicks the last device button to switch to mobile view in preview
   */
  async previewMobileView(): Promise<void> {
    await test.step('Switch to mobile view in preview', async () => {
      await this.clickOnElement(this.deviceButtons.last(), {
        stepInfo: 'Click last device button (mobile view)',
        force: true,
      });
    });
  }
}
