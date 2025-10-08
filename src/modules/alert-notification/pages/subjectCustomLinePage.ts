import { NotificationCustomizationComponent } from '@alert-notification-components/notificationCustomizationComponent';
import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

/**
 * Page Object for Subject Custom Line notification customization
 * Handles navigation and delegates UI interactions to components
 * Following integrations team pattern
 */
export class SubjectCustomLinePage extends BasePage {
  readonly notificationCustomizationComponent: NotificationCustomizationComponent;
  private static hasNavigatedBefore = false;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
    this.notificationCustomizationComponent = new NotificationCustomizationComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.notificationCustomizationComponent.expectAddCustomizationVisible();
    });
  }

  async navigateToNotificationCustomization(): Promise<void> {
    await test.step('Navigate to notification customization', async () => {
      if (!SubjectCustomLinePage.hasNavigatedBefore) {
        // First time - use menu navigation to test navigation functionality
        await this.page.waitForLoadState('domcontentloaded');
        await this.notificationCustomizationComponent.navigateToApplicationSettings();
        await this.notificationCustomizationComponent.navigateToApplicationTab();
        await this.notificationCustomizationComponent.navigateToDefaultsTab();
        await this.notificationCustomizationComponent.navigateToNotificationCustomizationTab();
        await this.verifyThePageIsLoaded();
        SubjectCustomLinePage.hasNavigatedBefore = true;
      } else {
        // use direct endpoint for efficiency from 2nd test case onwards
        await this.loadPage();
        await this.verifyThePageIsLoaded();
      }
    });
  }
  //Delegated to component for all UI interactions
  async startAddCustomization(): Promise<void> {
    return this.notificationCustomizationComponent.startAddCustomization();
  }

  async expectAddCustomizationVisible(): Promise<void> {
    return this.notificationCustomizationComponent.expectAddCustomizationVisible();
  }

  async expectOnListPage(): Promise<void> {
    return this.notificationCustomizationComponent.expectOnListPage();
  }

  async selectMustReadSingle(): Promise<void> {
    return this.notificationCustomizationComponent.selectMustReadSingle();
  }

  async selectFollowSingle(): Promise<void> {
    return this.notificationCustomizationComponent.selectFollowSingle();
  }

  async selectAlertsSingle(): Promise<void> {
    return this.notificationCustomizationComponent.selectAlertsSingle();
  }

  async clickNext(): Promise<void> {
    return this.notificationCustomizationComponent.clickNext();
  }

  async cancel(): Promise<void> {
    return this.notificationCustomizationComponent.cancel();
  }

  async chooseCustomSubject(): Promise<void> {
    return this.notificationCustomizationComponent.chooseCustomSubject();
  }

  async typeCustomSubjectOnStep2(subject: string): Promise<void> {
    return this.notificationCustomizationComponent.typeCustomSubjectOnStep2(subject);
  }

  async clearCustomSubject(): Promise<void> {
    return this.notificationCustomizationComponent.clearCustomSubject();
  }

  async expectNextButtonDisabled(): Promise<void> {
    return this.notificationCustomizationComponent.expectNextButtonDisabled();
  }

  async selectLanguage(language: string): Promise<void> {
    return this.notificationCustomizationComponent.selectLanguage(language);
  }

  async save(): Promise<void> {
    return this.notificationCustomizationComponent.save();
  }

  async chooseDifferentTestEmail(): Promise<void> {
    return this.notificationCustomizationComponent.chooseDifferentTestEmail();
  }

  async typeTestEmail(email: string): Promise<void> {
    return this.notificationCustomizationComponent.typeTestEmail(email);
  }

  async blurTestEmailInput(): Promise<void> {
    return this.notificationCustomizationComponent.blurTestEmailInput();
  }

  async sendTestEmail(): Promise<void> {
    return this.notificationCustomizationComponent.sendTestEmail();
  }

  async expectSendTestDisabled(): Promise<void> {
    return this.notificationCustomizationComponent.expectSendTestDisabled();
  }

  async expectSendTestEnabled(): Promise<void> {
    return this.notificationCustomizationComponent.expectSendTestEnabled();
  }

  async expectSavedToast(): Promise<void> {
    return this.notificationCustomizationComponent.expectSavedToast();
  }

  async expectDeletedToast(): Promise<void> {
    return this.notificationCustomizationComponent.expectDeletedToast();
  }

  async expectTestEmailSuccess(): Promise<void> {
    return this.notificationCustomizationComponent.expectTestEmailSuccess();
  }

  async expectInvalidEmailError(): Promise<void> {
    return this.notificationCustomizationComponent.expectInvalidEmailError();
  }

  async expectCellVisible(subject: string): Promise<void> {
    return this.notificationCustomizationComponent.expectCellVisible(subject);
  }

  async expectMoreButtonReady(): Promise<void> {
    return this.notificationCustomizationComponent.expectMoreButtonReady();
  }

  async deleteBySubject(subject: string): Promise<void> {
    return this.notificationCustomizationComponent.deleteBySubject(subject);
  }

  async expectStepperAt(step: string): Promise<void> {
    return this.notificationCustomizationComponent.expectStepperAt(step);
  }

  async verifyText(text: string): Promise<void> {
    return this.notificationCustomizationComponent.verifyText(text);
  }

  async clearSearch(): Promise<void> {
    return this.notificationCustomizationComponent.clearSearch();
  }

  async countItems(): Promise<number> {
    return this.notificationCustomizationComponent.countItems();
  }

  async verifyToastMessage(message: string): Promise<void> {
    return this.notificationCustomizationComponent.verifyToastMessage(message);
  }
}
