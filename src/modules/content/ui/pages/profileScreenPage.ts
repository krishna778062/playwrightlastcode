import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { EditContactComponent } from '@/src/modules/content/ui/components/editContactComponent';

export class ProfileScreenPage extends BasePage {
  private baseActionUtil: BaseActionUtil;
  private editContactComponent: EditContactComponent;

  readonly copyProfileLinkOption: Locator;
  readonly ellipsesButton: Locator;
  readonly favoriteOption: Locator;
  readonly unfavoriteOption: Locator;
  readonly favoriteTextLocator: Locator;
  readonly editTimezoneButton: Locator;
  readonly manageTopicsLink: Locator;
  readonly editAboutButton: Locator;
  readonly editAboutDialog: Locator;
  readonly dateOfBirthMonthInput: Locator;
  readonly dateOfBirthDayInput: Locator;
  readonly saveButton: Locator;
  readonly followButton: Locator;

  constructor(page: Page, peopleId: string) {
    super(page, PAGE_ENDPOINTS.getProfileScreenPage(peopleId));
    this.baseActionUtil = new BaseActionUtil(page);
    this.editContactComponent = new EditContactComponent(page);

    this.copyProfileLinkOption = this.page.getByRole('button', { name: 'Copy profile link' });
    this.followButton = this.page.getByRole('button', { name: 'Follow' });
    this.ellipsesButton = this.page.getByRole('button', { name: 'Show more' });
    this.favoriteOption = this.page.getByRole('menuitem', { name: 'Favorite' }).nth(1);
    this.unfavoriteOption = this.page.getByRole('menuitem', { name: 'Unfavorite' }).nth(1);
    this.favoriteTextLocator = this.page.getByTestId('desktop-layout').getByText('Favorite');
    this.editTimezoneButton = this.page.getByRole('button', { name: 'Edit contact' });
    this.manageTopicsLink = this.page
      .getByRole('link', { name: 'Manage Topics' })
      .or(this.page.locator('a', { hasText: 'Manage Topics' }));
    this.editAboutButton = this.page.getByRole('button', { name: 'Edit about' });
    this.editAboutDialog = this.page.getByRole('dialog', { name: 'Edit about' });
    this.dateOfBirthMonthInput = this.editAboutDialog.getByTestId('field-Birthday month').getByTestId('SelectInput');
    this.dateOfBirthDayInput = this.editAboutDialog.getByTestId('field-Birthday day').getByTestId('SelectInput');
    this.saveButton = this.editAboutDialog.getByRole('button', { name: 'Save' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify profile screen page is visible', async () => {
      // Use "Show more" button as it's reliably present on profile pages
      await this.verifier.verifyTheElementIsVisible(this.followButton, {
        assertionMessage: 'Profile screen page should be visible',
      });
    });
  }

  async clickOnFavoriteOption(): Promise<boolean> {
    return await test.step('Clicking on favorite option', async () => {
      // Step 1: Click on "Show more" button (three dots) to open the menu
      await this.verifier.verifyTheElementIsVisible(this.ellipsesButton, {
        assertionMessage: 'Show more button should be visible',
      });
      await this.clickOnElement(this.ellipsesButton);

      // Step 2: Check if favoriteOption is visible (menu is open and Favorite option is available)
      const favoriteCount = await this.favoriteOption.count();

      if (favoriteCount > 0) {
        // If favoriteOption is found, click on it directly (user is NOT favorited)
        await this.clickOnElement(this.favoriteOption);
        // Wait for menu to close (indicates action completed)
        await this.favoriteOption.waitFor({ state: 'hidden' }).catch(() => {});
        return false; // User was not favorited, we just favorited them
      } else {
        // Check if unfavoriteOption is visible (user is already favorited)
        const unfavoriteCount = await this.unfavoriteOption.count();

        if (unfavoriteCount > 0) {
          // User is already favorited - unfavorite them
          await this.clickOnElement(this.unfavoriteOption);
          // Wait for menu to close (indicates action completed)
          await this.unfavoriteOption.waitFor({ state: 'hidden' }).catch(() => {});
          return true; // User was already favorited, we just unfavorited them
        } else {
          throw new Error('Neither favoriteOption nor unfavoriteOption locator found');
        }
      }
    });
  }

  async verifyingUserNameOnProfileScreenPage(): Promise<void> {
    await test.step('Verifying user name on profile screen page', async () => {
      const loggedInUserName = await this.baseActionUtil.getCurrentLoggedInUserName();
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('heading', { name: loggedInUserName }), {
        assertionMessage: `User name "${loggedInUserName}" should be visible on profile screen page`,
      });
    });
  }

  async clickOnManageTopics(): Promise<void> {
    await test.step('Clicking on Manage Topics from profile page', async () => {
      await this.clickOnElement(this.manageTopicsLink);
    });
  }

  async clickEditAbout(): Promise<void> {
    await test.step('Clicking on Edit about button', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editAboutButton, {
        assertionMessage: 'Edit about button should be visible',
      });
      await this.clickOnElement(this.editAboutButton);
      await this.verifier.verifyTheElementIsVisible(this.editAboutDialog, {
        assertionMessage: 'Edit about dialog should be visible',
      });
    });
  }

  async updateDateOfBirth(month: number, day: number): Promise<void> {
    await test.step(`Updating date of birth to month: ${month}, day: ${day}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.dateOfBirthMonthInput, {
        assertionMessage: 'Date of birth month input should be visible',
      });
      await this.clickOnElement(this.dateOfBirthMonthInput);
      await this.dateOfBirthMonthInput.selectOption({ value: month.toString() });

      await this.verifier.verifyTheElementIsVisible(this.dateOfBirthDayInput, {
        assertionMessage: 'Date of birth day input should be visible',
      });
      await this.clickOnElement(this.dateOfBirthDayInput);
      const dayValue = day.toString().padStart(2, '0');
      await this.dateOfBirthDayInput.selectOption({ value: dayValue });
    });
  }

  async saveProfileChanges(): Promise<void> {
    await test.step('Saving profile changes', async () => {
      await this.page.pause();
      await this.verifier.verifyTheElementIsVisible(this.saveButton, {
        assertionMessage: 'Save button should be visible',
      });
      await this.clickOnElement(this.saveButton, { force: true });
      //wait for the save button to be hidden
      await this.saveButton.waitFor({ state: 'hidden' });
    });
  }

  async openEditTimezone(): Promise<void> {
    await test.step('Opening edit timezone dialog', async () => {
      await this.clickOnElement(this.editTimezoneButton);
    });
  }

  async selectTimezone(value: string): Promise<void> {
    await test.step(`Selecting timezone with value: ${value}`, async () => {
      await this.editContactComponent.selectTimezone(value);
    });
  }

  async clickOnSaveTimezoneButton(): Promise<void> {
    await test.step('Clicking on save timezone button', async () => {
      await this.editContactComponent.clickOnSaveButton();
    });
  }
}
