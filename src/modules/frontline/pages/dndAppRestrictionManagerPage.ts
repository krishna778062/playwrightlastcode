import { DND_MESSAGES } from '@frontline/constants/dndConstants';
import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

export class DNDAppRestriction extends BasePage {
  // Main page elements
  readonly apprestrictionOptionTab: Locator;
  readonly dndAndApprestrictionPageHeading: Locator;
  readonly descriptionOnDndPage: Locator;
  readonly allOrgToggle: Locator;
  readonly allOrgLabel: Locator;
  readonly audienceToggle: Locator;
  readonly audienceLabel: Locator;
  readonly allOrgDescription: Locator;
  readonly audienceDescription: Locator;
  readonly managePreferencesButton: Locator;

  // Audience DND Settings elements
  readonly addAudienceButton: Locator;
  readonly audienceDNDHeading: Locator;
  readonly browseButton: Locator;
  readonly audienceDropdown: Locator;
  readonly doneButton: Locator;
  readonly manualSourceButton: Locator;
  readonly nextButton: Locator;
  readonly chooseSettingsHeading: Locator;
  readonly enableDNDCheckbox: Locator;
  readonly enableRestrictionCheckbox: Locator;
  readonly dndDescription: Locator;
  readonly restrictionDescription: Locator;
  readonly showReminderRadio: Locator;
  readonly blockAccessRadio: Locator;
  readonly showReminderHelpText: Locator;
  readonly blockAccessHelpText: Locator;
  readonly saveButton: Locator;

  // Working days and hours configuration elements
  readonly audienceWorkingDayCheckbox: (day: string) => Locator;
  readonly workHoursStartTime: Locator;
  readonly workHoursEndTime: Locator;
  readonly userEditableCheckbox: Locator;

  // User settings elements
  readonly mysettingsDNDMenu: Locator;
  readonly workingDayMonday: Locator;
  readonly workingDayStartTime: Locator;
  readonly workingDayEndTime: Locator;
  readonly profileSettingsButton: Locator;
  readonly mySettingsMenuItem: Locator;
  readonly mySettingsPageHeading: Locator;
  readonly workingDayCheckbox: (day: string) => Locator;

  // All organization DND settings elements
  readonly manageButton: Locator;
  readonly allOrgSettingHeader: Locator;
  readonly orgSettingSourceText: Locator;
  readonly ukgButton: Locator;
  readonly manualButton: Locator;
  readonly textUnderUKGSelection: Locator;
  readonly nextButtonOnSourcePage: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_QR_PAGE);

    this.apprestrictionOptionTab = page.getByRole('tab', { name: 'DND and app restrictions' });
    this.dndAndApprestrictionPageHeading = page.locator(
      "//h3[contains(text(),'Do not disturb')]/following-sibling::h4"
    );
    this.descriptionOnDndPage = page.locator("//h3[contains(text(),'Do not disturb')]/following-sibling::h4");
    this.allOrgToggle = page.getByRole('heading', { name: 'All organization' }).locator('..').getByRole('switch');
    this.allOrgLabel = page.getByRole('heading', { name: 'All organization' });
    this.audienceToggle = page
      .locator('div')
      .filter({ hasText: /^Audience$/ })
      .getByRole('switch');
    this.audienceLabel = page
      .locator('div')
      .filter({ hasText: /^Audience$/ })
      .getByRole('heading', { name: 'Audience' });
    this.allOrgDescription = page.getByText(
      'Apply these settings to everyone in your organization, except for users with manually defined working hours.'
    );
    this.audienceDescription = page.getByText(
      'Apply these settings to specific groups of users. Set working hours manually or sync them using HRIS integrations.'
    );

    this.addAudienceButton = page.getByRole('button', { name: 'Add audience' });
    this.audienceDNDHeading = page.getByRole('heading', { name: 'Audience DND and app' });
    this.browseButton = page.getByRole('button', { name: 'Browse' });
    this.audienceDropdown = page.locator('.css-19bb58m');
    this.doneButton = page.getByRole('button', { name: 'Done' });
    this.manualSourceButton = page.getByTestId('Manual');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.chooseSettingsHeading = page.getByRole('heading', {
      name: 'Choose the settings you want to apply for your organization',
    });
    this.enableDNDCheckbox = page.getByRole('checkbox', { name: 'Enable DND outside working hours' });
    this.enableRestrictionCheckbox = page.getByRole('checkbox', { name: 'Enable restrictions outside working hours' });
    this.dndDescription = page.getByText('Limit notifications to essential updates only outside working hours');
    this.restrictionDescription = page.getByText(
      'Limit access to the app outside working hours to help maintain compliance'
    );
    this.showReminderRadio = page.getByRole('radio', { name: 'Show a reminder (Warning only)' });
    this.blockAccessRadio = page.getByRole('radio', { name: 'Block access (Complete block)' });
    this.showReminderHelpText = page.locator('h5').filter({ hasText: /Display a message reminding users/ });
    this.blockAccessHelpText = page.locator('h5').filter({ hasText: /Prevent users from accessing the app/ });
    this.saveButton = page.getByRole('button', { name: 'Save' });

    this.audienceWorkingDayCheckbox = (day: string) =>
      page.getByRole('checkbox', { name: `Only app managers can change work days & work hours ${day}` });
    this.workHoursStartTime = page.getByTestId('field-Work hours start time').getByTestId('SelectInput');
    this.workHoursEndTime = page.getByTestId('field-Work hours end time').getByTestId('SelectInput');
    this.userEditableCheckbox = page.getByRole('checkbox', { name: 'User editable' });
    this.managePreferencesButton = page.getByRole('link', { name: 'Manage preferences' });

    // User settings elements
    this.mysettingsDNDMenu = page.getByRole('link', { name: 'Do not disturb' });
    this.workingDayMonday = page.getByRole('checkbox', { name: /Monday/ });
    this.workingDayStartTime = page.locator('#workingHoursStartTime');
    this.workingDayEndTime = page.locator('#workingHoursEndTime');
    this.profileSettingsButton = page.getByRole('button', { name: 'Profile settings' });
    this.mySettingsMenuItem = page.getByRole('menuitem', { name: 'My settings My settings' });
    this.mySettingsPageHeading = page.getByText('My settings');
    this.workingDayCheckbox = (day: string) => page.locator(`//label[contains(., '${day}')]//input[@type='checkbox']`);

    // All organization DND settings elements
    this.manageButton = page.getByRole('button', { name: 'Manage' });
    this.allOrgSettingHeader = page.getByRole('heading', { name: 'Organization DND and app restrictions settings' });
    this.orgSettingSourceText = page.getByRole('heading', {
      name: "Select how you would like to set your organization's working hours",
    });
    this.ukgButton = page.getByRole('button', { name: 'UKG' });
    this.manualButton = page.getByRole('button', { name: 'Manual' });
    this.textUnderUKGSelection = page.getByText('Automatically sync working');
    this.nextButtonOnSourcePage = page.getByRole('button', { name: 'Next' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify DND App Restriction page is loaded', async () => {
      await this.verifier.waitUntilElementIsVisible(this.apprestrictionOptionTab);
    });
  }

  async navigateToDNDAppRestriction(): Promise<void> {
    await test.step('Navigate to DND App Restriction page', async () => {
      await this.goToUrl((process.env.BASEURL || '') + 'manage/app/defaults/do-not-disturb');
    });
  }

  async verifySelectedOptionDND(expectedText: string): Promise<void> {
    await test.step(`Verify selected DND option displays text: ${expectedText}`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.apprestrictionOptionTab);
      await this.verifier.verifyElementHasText(this.apprestrictionOptionTab, expectedText);
    });
  }

  async clickAddAudienceButton(): Promise<void> {
    await this.clickOnElement(this.addAudienceButton, { stepInfo: 'Click Add audience button' });
  }

  async verifyAudienceDNDHeading(expectedHeading: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.audienceDNDHeading);
    await this.verifier.verifyElementHasText(this.audienceDNDHeading, expectedHeading);
  }

  async selectAudience(audienceName: string): Promise<void> {
    await this.clickOnElement(this.browseButton, { stepInfo: 'Click Browse button' });
    await this.clickOnElement(this.audienceDropdown, { stepInfo: 'Click audience dropdown' });
    await this.clickOnElement(this.page.getByText(audienceName), { stepInfo: `Select ${audienceName}` });
    await this.clickOnElement(this.doneButton, { stepInfo: 'Click Done button' });
  }

  async selectManualSource(): Promise<void> {
    await this.clickOnElement(this.manualSourceButton, { stepInfo: 'Select Manual source' });
  }

  async configureWorkingDaysAndHours(workingDays?: string[], startTime?: string, endTime?: string): Promise<void> {
    const { DND_MESSAGES } = await import('@frontline/constants/dndConstants');

    const days = workingDays || DND_MESSAGES.DEFAULT_WORKING_DAYS;
    const start = startTime || DND_MESSAGES.DEFAULT_START_TIME;
    const end = endTime || DND_MESSAGES.DEFAULT_END_TIME;

    for (const day of days) {
      await this.clickOnElement(this.audienceWorkingDayCheckbox(day), { stepInfo: `Select ${day}` });
    }

    await this.workHoursStartTime.selectOption(start);
    await this.workHoursEndTime.selectOption(end);
    await this.clickOnElement(this.userEditableCheckbox, { stepInfo: 'Enable user editable option' });
  }

  async clickNextButton(): Promise<void> {
    await this.clickOnElement(this.nextButton, { stepInfo: 'Click Next button' });
  }

  async verifyChooseSettingsHeading(expectedHeading: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.chooseSettingsHeading);
    await this.verifier.verifyElementHasText(this.chooseSettingsHeading, expectedHeading);
  }

  async verifyDNDCheckboxAndDescription(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.enableDNDCheckbox);
    await this.verifier.verifyTheElementIsVisible(this.enableDNDCheckbox);
    await this.verifier.waitUntilElementIsVisible(this.dndDescription);
    await this.verifier.verifyTheElementIsVisible(this.dndDescription);
  }

  async verifyRestrictionCheckboxAndDescription(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.enableRestrictionCheckbox);
    await this.verifier.verifyTheElementIsVisible(this.restrictionDescription);
  }

  async checkRestrictionCheckbox(): Promise<void> {
    await this.clickOnElement(this.enableRestrictionCheckbox, { stepInfo: 'Check restriction checkbox' });
  }

  async verifyRadioButtonsAndHelpText(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.showReminderRadio);
    await this.verifier.verifyTheElementIsVisible(this.blockAccessRadio);
    await this.verifier.waitUntilElementIsVisible(this.showReminderHelpText);
    await this.verifier.verifyTheElementIsVisible(this.blockAccessHelpText);
  }

  async verifySaveButtonDisabled(): Promise<void> {
    await this.verifier.verifyTheElementIsDisabled(this.saveButton);
  }

  async verifyDndAndAppRestrictionPageHeading(pageHeading: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.dndAndApprestrictionPageHeading);
    await this.verifier.verifyElementHasText(this.dndAndApprestrictionPageHeading, pageHeading);
  }

  async verifyDescriptionText(): Promise<void> {
    await test.step('Verify description text based on manage preferences button visibility', async () => {
      const managePreferencesButtonVisible = await this.verifier.isTheElementVisible(this.managePreferencesButton, {
        timeout: 5_000,
      });

      if (managePreferencesButtonVisible) {
        await this.verifier.verifyElementHasText(
          this.descriptionOnDndPage,
          DND_MESSAGES.DND_APP_RESTRICTIONS_PAGE_DESCRIPTION
        );
      } else {
        await this.verifier.verifyElementHasText(this.descriptionOnDndPage, DND_MESSAGES.DND_PAGE_DESCRIPTION);
      }
    });
  }

  async verifyAllOrgToogleAndLabel(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.allOrgLabel);
    await this.verifier.verifyTheElementIsVisible(this.allOrgToggle);
    await this.verifier.verifyElementHasText(this.allOrgLabel, 'All organization');
  }

  async verifyAudienceToogleAndLabel(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.audienceToggle);
    await this.verifier.verifyTheElementIsVisible(this.audienceToggle);
    await this.verifier.verifyElementHasText(this.audienceLabel, 'Audience');
  }

  async verifyDescriptionAllOrg(visibleDesc: string): Promise<void> {
    await this.verifier.verifyElementHasText(this.allOrgDescription, visibleDesc);
  }

  async verifyDescriptionAudience(visibleDesc: string): Promise<void> {
    await this.verifier.verifyElementHasText(this.audienceDescription, visibleDesc);
  }

  async navigateToMySettings(): Promise<void> {
    await this.clickOnElement(this.profileSettingsButton, { stepInfo: 'Click on Profile Settings button' });
    await this.clickOnElement(this.mySettingsMenuItem, { stepInfo: 'Click on My Settings menu item' });
    await this.verifier.waitUntilElementIsVisible(this.mySettingsPageHeading);
    await this.clickOnElement(this.mysettingsDNDMenu, { stepInfo: 'Click on DND menu under My Settings' });
  }

  async verifyDNDMenuUnderMysettings(menuText: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.mysettingsDNDMenu);
    await this.verifier.verifyTheElementIsVisible(this.mysettingsDNDMenu);
    await this.verifier.verifyElementHasText(this.mysettingsDNDMenu, menuText);
  }

  async verifyWorkingDaysAreChecked(days: string[]): Promise<void> {
    for (const day of days) {
      const checkbox = this.workingDayCheckbox(day);
      await this.verifier.waitUntilElementIsVisible(checkbox);
      await this.verifier.verifyCheckboxIsChecked(checkbox);
    }
  }

  async verifyWorkingHours(): Promise<void> {
    await this.verifier.verifyElementHasText(this.workingDayStartTime.locator('option:checked'), '7:00 AM');
    await this.verifier.verifyElementHasText(this.workingDayEndTime.locator('option:checked'), ' 11:30 PM');
  }

  async verifyWorkingDaysAndHoursEditable(): Promise<void> {
    await this.verifier.verifyTheElementIsEnabled(this.workingDayMonday);
    await this.verifier.verifyTheElementIsEnabled(this.workingDayStartTime);
    await this.verifier.verifyTheElementIsEnabled(this.workingDayEndTime);
  }

  // All organization DND settings methods
  async clickManageButton(): Promise<void> {
    await this.clickOnElement(this.manageButton, { stepInfo: 'Click Manage button' });
  }

  async verifyAllOrgSettingHeader(expectedHeader: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.allOrgSettingHeader);
    await this.verifier.verifyElementHasText(this.allOrgSettingHeader, expectedHeader);
  }

  async verifyOrgSettingSourceText(expectedText: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.orgSettingSourceText);
    await this.verifier.verifyElementHasText(this.orgSettingSourceText, expectedText);
  }

  async verifyUKGAndManualOptions(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.ukgButton);
    await this.verifier.waitUntilElementIsVisible(this.manualButton);
    await this.verifier.verifyTheElementIsVisible(this.ukgButton);
    await this.verifier.verifyTheElementIsVisible(this.manualButton);
  }

  async selectUKGSource(): Promise<void> {
    await this.clickOnElement(this.ukgButton, { stepInfo: 'Select UKG as source' });
  }

  async selectManualSourceForAllOrg(): Promise<void> {
    await this.clickOnElement(this.manualButton, { stepInfo: 'Select Manual as source for All Organization' });
  }

  async verifyUKGSelected(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.ukgButton);
  }

  async verifyTextUnderUKGSelection(expectedText: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.textUnderUKGSelection);
    await this.verifier.verifyElementHasText(this.textUnderUKGSelection, expectedText);
  }

  async verifyNextButtonEnabled(): Promise<void> {
    await this.verifier.verifyTheElementIsEnabled(this.nextButtonOnSourcePage);
  }
}
