import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { WorkdaySyncComponent } from '@/src/modules/integrations/ui/components/workdaySyncComponent';

export class WorkdaySyncPage extends BasePage {
  readonly workdaySyncComponent: WorkdaySyncComponent;
  readonly scheduledSources: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    this.scheduledSources = page.getByRole('heading', { name: 'Scheduled sources' });
    this.workdaySyncComponent = new WorkdaySyncComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledSources, {
        timeout: 30_000,
        assertionMessage: 'Verifying the page is loaded',
      });
    });
  }

  async clickOnWorkdayCheckbox(): Promise<void> {
    return this.workdaySyncComponent.checkWorkdayCheckbox();
  }

  async clickOnSaveButton(): Promise<void> {
    return this.workdaySyncComponent.clickOnSaveButton();
  }

  async verifyWorkdayFieldIsVisible(fieldName: string): Promise<void> {
    return this.workdaySyncComponent.verifyWorkdayFieldIsVisible(fieldName);
  }

  async verifyFieldRequiredError(fieldName: string, errorMessage: string): Promise<void> {
    return this.workdaySyncComponent.verifyFieldRequiredError(fieldName, errorMessage);
  }

  async fillAllWorkdayFields(fieldName: string, text: string): Promise<void> {
    return this.workdaySyncComponent.fillAllWorkdayFields(fieldName, text);
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    return this.workdaySyncComponent.verifyErrorMessage(expectedMessage);
  }

  async clickOnTab(text: string): Promise<void> {
    return this.workdaySyncComponent.clickOnTab(text);
  }

  async selectWorkdayAsSyncSource(source: string): Promise<void> {
    return this.workdaySyncComponent.selectWorkdayAsSyncSource(source);
  }

  async clickUserSyncingRunNow(action: string): Promise<void> {
    return this.workdaySyncComponent.clickUserSyncingRunNow(action);
  }

  async refreshUntilSchedulerButtonEnabled(action: string, maxAttempts: number = 10): Promise<void> {
    return this.workdaySyncComponent.refreshUntilSchedulerButtonEnabled(action, maxAttempts);
  }

  async verifyLastRunStatus(action: string, expectedStatus: string): Promise<void> {
    return this.workdaySyncComponent.verifyLastRunStatus(action, expectedStatus);
  }
}
