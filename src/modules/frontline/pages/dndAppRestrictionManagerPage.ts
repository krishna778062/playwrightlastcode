import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

export class DNDAppRestriction extends BasePage {
  readonly apprestrictionOptionTab: Locator;
  readonly dndAndApprestrictionPageHeading: Locator;
  readonly descriptionOnDndPage: Locator;
  readonly allOrgToogle: Locator;
  readonly allOrgLabel: Locator;
  readonly audienceToggle: Locator;
  readonly audienceLabel: Locator;
  readonly allOrgDescription: Locator;
  readonly audiendeDescription: Locator;
  readonly mysettingsDNDMenu: Locator;
  readonly workingDayMonday: Locator;
  readonly workingDayStartTime: Locator;
  readonly workingDayEndTime: Locator;
  readonly profileSettingsButton: Locator;
  readonly mySettingsMenuItem: Locator;
  readonly mySettingsPageHeading: Locator;
  readonly workingDayCheckbox: (day: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_QR_PAGE);

    this.apprestrictionOptionTab = page.getByRole('tab', { name: 'DND and app restrictions' });
    this.dndAndApprestrictionPageHeading = page.getByRole('heading', {
      name: 'Do not disturb and app restrictions outside work hours',
    });
    this.descriptionOnDndPage = page.getByText(
      'Notifications including email, browser, SMS, and mobile push notifications will not be sent outside your work hours'
    );

    this.allOrgToogle = page.getByRole('heading', { name: 'All organization' }).locator('..').getByRole('switch');
    this.allOrgLabel = page.getByRole('heading', { name: 'All organization' });
    this.audienceToggle = page.getByRole('switch').nth(1);
    this.audienceLabel = page.getByRole('heading', { name: 'Audience' });
    this.allOrgDescription = page.getByText(
      'Apply these settings to everyone in your organization, except for users with manually defined working hours.'
    );
    this.audiendeDescription = page.getByText(
      'Apply these settings to specific groups of users. Set working hours manually or sync them using HRIS integrations.'
    );

    // User settings elements
    this.mysettingsDNDMenu = page.getByRole('link', { name: 'Do not disturb' });

    // Working hours elements
    this.workingDayMonday = page.getByRole('checkbox', { name: /Monday/ });
    this.workingDayStartTime = page.locator('#workingHoursStartTime');
    this.workingDayEndTime = page.locator('#workingHoursEndTime');
    this.workingDayCheckbox = (day: string) => page.locator(`//label[contains(., '${day}')]//input[@type='checkbox']`);

    // Profile and settings navigation
    this.profileSettingsButton = page.getByRole('button', { name: 'Profile settings' });
    this.mySettingsMenuItem = page.getByRole('menuitem', { name: 'My settings My settings' });
    this.mySettingsPageHeading = page.getByText('My settings');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify DND App Restriction page is loaded', async () => {
      await this.apprestrictionOptionTab.waitFor({ state: 'visible' });
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

  async verifyDndAndAppRestrictionPageHeading(pageHeading: string): Promise<void> {
    await test.step(`Verify DND and App Restriction page heading: ${pageHeading}`, async () => {
      await this.verifier.verifyElementHasText(this.dndAndApprestrictionPageHeading, pageHeading);
    });
  }

  async verifyDescriptionText(descriptionText: string): Promise<void> {
    await test.step(`Verify description text: ${descriptionText}`, async () => {
      const actualText = await this.descriptionOnDndPage.textContent();
      const normalizedActual = actualText?.replace(/\s+/g, ' ').trim();
      const normalizedExpected = descriptionText.replace(/\s+/g, ' ').trim();
      console.log('Actual:', normalizedActual);
      console.log('Expected:', normalizedExpected);
      await this.verifier.verifyElementContainsText(this.descriptionOnDndPage, normalizedExpected);
    });
  }

  async verifyAllOrgToogleAndLabel(): Promise<void> {
    await test.step('Verify All Organization toggle and label are visible', async () => {
      await this.verifier.waitUntilElementIsVisible(this.allOrgLabel);
      await this.verifier.verifyTheElementIsVisible(this.allOrgToogle);
      await this.verifier.verifyElementHasText(this.allOrgLabel, 'All organization');
    });
  }

  async verifyAudienceToogleAndLabel(): Promise<void> {
    await test.step('Verify Audience toggle and label are visible', async () => {
      await this.verifier.waitUntilElementIsVisible(this.audienceToggle);
      await this.verifier.verifyTheElementIsVisible(this.audienceToggle);
      await this.verifier.verifyElementHasText(this.audienceLabel, 'Audience');
    });
  }

  async verifyDescriptionAllOrg(visibleDesc: string): Promise<void> {
    await test.step(`Verify All Organization description: ${visibleDesc}`, async () => {
      const text = await this.allOrgDescription.textContent();
      console.log(text);
      await this.verifier.verifyElementHasText(this.allOrgDescription, visibleDesc);
    });
  }

  async verifyDescriptionAudience(visibleDesc: string): Promise<void> {
    await test.step(`Verify Audience description: ${visibleDesc}`, async () => {
      const text = await this.audiendeDescription.textContent();
      console.log(text);
      await this.verifier.verifyElementHasText(this.audiendeDescription, visibleDesc);
    });
  }

  async navigateToMySettings(): Promise<void> {
    await test.step('Navigate to My Settings DND page', async () => {
      await this.clickOnElement(this.profileSettingsButton, { stepInfo: 'Click on Profile Settings button' });
      await this.clickOnElement(this.mySettingsMenuItem, { stepInfo: 'Click on My Settings menu item' });
      await this.verifier.waitUntilElementIsVisible(this.mySettingsPageHeading); // Verify the my settings page is loaded
      await this.clickOnElement(this.mysettingsDNDMenu, { stepInfo: 'Click on DND menu under My Settings' });
    });
  }

  async verifyDNDMenuUnderMysettings(menuText: string): Promise<void> {
    await test.step(`Verify DND menu under My Settings displays: ${menuText}`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.mysettingsDNDMenu);
      await this.verifier.verifyTheElementIsVisible(this.mysettingsDNDMenu);
      await this.verifier.verifyElementHasText(this.mysettingsDNDMenu, menuText);
    });
  }

  async verifyWorkingDaysAreChecked(days: string[]): Promise<void> {
    await test.step(`Verify working days are checked: ${days.join(', ')}`, async () => {
      for (const day of days) {
        const checkbox = this.workingDayCheckbox(day);
        await this.verifier.waitUntilElementIsVisible(checkbox);
        await this.verifier.verifyCheckboxIsChecked(checkbox);
      }
    });
  }

  async verifyWorkingHours(): Promise<void> {
    await test.step('Verify working hours are set correctly', async () => {
      const workingStartTime = await this.workingDayStartTime.locator('option:checked').textContent();
      await this.verifier.verifyElementHasText(this.workingDayStartTime.locator('option:checked'), '7:00 AM');
      const workingEndTime = await this.workingDayEndTime.locator('option:checked').textContent();
      await this.verifier.verifyElementHasText(this.workingDayEndTime.locator('option:checked'), ' 9:30 PM');
    });
  }

  async verifyWorkingDaysAndHoursEditable(): Promise<void> {
    await test.step('Verify working days and hours are editable', async () => {
      await this.verifier.verifyTheElementIsEnabled(this.workingDayMonday);
      await this.verifier.verifyTheElementIsEnabled(this.workingDayStartTime);
      await this.verifier.verifyTheElementIsEnabled(this.workingDayEndTime);
    });
  }
}
