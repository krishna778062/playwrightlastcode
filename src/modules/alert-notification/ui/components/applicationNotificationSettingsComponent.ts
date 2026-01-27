import { Locator, Page, test } from '@playwright/test';

import { GENERAL_APPLICATION_SETTINGS_MESSAGES } from '../../constants/descriptionTextRepo';

import { CommonActionsComponent } from './commonActionsComponent';

import { BaseActionUtil, BaseComponent } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class ApplicationNotificationSettingsComponent extends BaseComponent {
  readonly commonActionsComponent: CommonActionsComponent;
  readonly manageApplicationText: Locator;
  readonly smsNotificationText: Locator;
  readonly pushNotificationText: Locator;
  readonly smsDescriptionText: Locator;
  readonly pushDescriptionText: Locator;
  readonly smsCheckbox: Locator;
  readonly pushCheckbox: Locator;
  readonly baseActionUtil: BaseActionUtil;

  constructor(page: Page) {
    super(page);
    this.commonActionsComponent = new CommonActionsComponent(page);
    this.manageApplicationText = page.getByRole('heading', { name: 'Manage application' });
    this.smsNotificationText = page.getByRole('heading', { name: 'SMS notifications' });
    this.pushNotificationText = page.getByRole('heading', { name: 'Push notifications' });
    this.smsDescriptionText = page.getByText(GENERAL_APPLICATION_SETTINGS_MESSAGES.SMS_NOTIFICATION_TOGGLE_DESCRIPTION);
    this.pushDescriptionText = page.getByText(
      GENERAL_APPLICATION_SETTINGS_MESSAGES.PUSH_NOTIFICATION_TOGGLE_DESCRIPTION
    );
    this.smsCheckbox = page.locator('#enableSmsNotifications');
    this.pushCheckbox = page.locator('#enablePushNotificationMobile');
    this.baseActionUtil = new BaseActionUtil(page);
  }

  async verifySMSNotificatioTextIsDisplayed(): Promise<void> {
    await test.step('Verify SMS notification text is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.smsNotificationText, {
        assertionMessage: 'Verify SMS notification heading is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyPushNotificationTextIsDisplayed(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.pushNotificationText, {
      assertionMessage: 'Verify Push notification heading is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifySMSDescriptionTextIsDisplayed(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.smsDescriptionText, {
      assertionMessage: 'Verify SMS description text is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifyPushDescriptionTextIsDisplayed(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.pushDescriptionText, {
      assertionMessage: 'Verify Push description text is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifySMSCheckboxIsDisplayed(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.smsCheckbox, {
      assertionMessage: 'Verify SMS checkbox is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }
  async verifyPushCheckboxIsDisplayed(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.pushCheckbox, {
      assertionMessage: 'Verify Push checkbox is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }
  async verifySMSCheckboxIsChecked(): Promise<void> {
    await this.verifier.verifyTheElementIsChecked(this.smsCheckbox, {
      assertionMessage: 'Verify SMS checkbox is checked',
      timeout: TIMEOUTS.MEDIUM,
    });
  }
  async verifyPushCheckboxIsChecked(): Promise<void> {
    await this.verifier.verifyTheElementIsChecked(this.pushCheckbox, {
      assertionMessage: 'Verify Push checkbox is checked',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifySMSCheckboxIsUnhecked(): Promise<void> {
    await this.verifier.verifyTheElementIsNotChecked(this.smsCheckbox, {
      assertionMessage: 'Verify SMS checkbox is not checked',
      timeout: TIMEOUTS.MEDIUM,
    });
  }
  async verifyPushCheckboxIsUnhecked(): Promise<void> {
    await this.verifier.verifyTheElementIsNotChecked(this.pushCheckbox, {
      assertionMessage: 'Verify Push checkbox is not checked',
      timeout: TIMEOUTS.MEDIUM,
    });
  }
  async checkSMSNotificationsCheckbox(): Promise<void> {
    await this.baseActionUtil.checkElement(this.smsCheckbox, {
      stepInfo: 'Check SMS notifications checkbox',
    });
  }
  async checkPushNotificationsCheckbox(): Promise<void> {
    await this.baseActionUtil.checkElement(this.pushCheckbox, {
      stepInfo: 'Check Push notifications checkbox',
    });
  }
  async unCheckSMSNotificationsCheckbox(): Promise<void> {
    await this.baseActionUtil.unCheckElement(this.smsCheckbox, {
      stepInfo: 'UnCheck SMS notifications checkbox',
    });
  }
  async unCheckPushNotificationsCheckbox(): Promise<void> {
    await this.baseActionUtil.unCheckElement(this.pushCheckbox, {
      stepInfo: 'UnCheck Push notifications checkbox',
    });
  }
}
