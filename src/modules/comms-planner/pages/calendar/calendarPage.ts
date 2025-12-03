import test, { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class CalendarPage extends BasePage {
  /**
   * Calendar page
   */
  readonly titleCalendar: Locator;
  readonly addActivityButton: Locator;

  /**
   * Create activity modal
   */
  readonly createActivityModalTitle: Locator;
  readonly customFieldsCreateActivityModalTitle: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.COMMS_PLANNER_PLANNER);

    /**
     * Customization page
     */
    this.titleCalendar = this.page.getByRole('heading', { name: 'Calendar' });
    this.addActivityButton = this.page.getByTestId('add-activity-button');

    /**
     * Create activity modal
     */
    this.createActivityModalTitle = this.page.getByRole('heading', { name: 'Create new activity' });
    this.customFieldsCreateActivityModalTitle = this.page.getByRole('heading', { name: 'Custom fields' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify | Calendar page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.titleCalendar, {
        assertionMessage: 'Calendar title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickAddActivityButton(): Promise<void> {
    await test.step('Click on "Add" activity button', async () => {
      await this.clickOnElement(this.addActivityButton, {
        stepInfo: 'Click "Add" button to create activity',
      });
    });
  }

  async verifyOpenedActivityModal(): Promise<void> {
    await test.step('Verify | Create activity modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createActivityModalTitle, {
        assertionMessage: 'Create new activity modal title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyCustomFields(): Promise<void> {
    await test.step('Verify | Custom fields', async () => {
      await this.verifier.verifyTheElementIsVisible(this.customFieldsCreateActivityModalTitle, {
        assertionMessage: 'Custom fields title should be visible in create activity modal',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
