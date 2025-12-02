import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
export interface IProfileScreenPageActions {
  clickOnManageTopics: () => Promise<void>;
  clickOnFavoriteOption: () => Promise<boolean>; // Returns true if user was already favorited, false otherwise
  clickEditAbout: () => Promise<void>;
  updateDateOfBirth: (month: number, day: number) => Promise<void>;
  saveProfileChanges: () => Promise<void>;
}

export interface IProfileScreenPageAssertions {
  verifyingUserNameOnProfileScreenPage: () => Promise<void>;
}

export class ProfileScreenPage extends BasePage implements IProfileScreenPageActions, IProfileScreenPageAssertions {
  private baseActionUtil: BaseActionUtil;
  readonly copyProfileLinkOption: Locator = this.page.getByRole('button', { name: 'Copy profile link' });
  readonly ellipsesButton: Locator = this.page.getByRole('button', { name: 'Show more' });
  readonly favoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Favorite' }).nth(1);
  readonly unfavoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Unfavorite' }).nth(1);
  readonly favoriteTextLocator: Locator = this.page.getByTestId('desktop-layout').getByText('Favorite');

  readonly manageTopicsLink: Locator = this.page
    .getByRole('link', { name: 'Manage Topics' })
    .or(this.page.locator('a', { hasText: 'Manage Topics' }));

  readonly editAboutButton: Locator = this.page.getByRole('button', { name: 'Edit about' });
  readonly editAboutDialog: Locator = this.page.getByRole('dialog', { name: 'Edit about' });
  readonly dateOfBirthMonthInput: Locator = this.editAboutDialog
    .getByTestId('field-Birthday month')
    .getByTestId('SelectInput');
  readonly dateOfBirthDayInput: Locator = this.editAboutDialog
    .getByTestId('field-Birthday day')
    .getByTestId('SelectInput');
  readonly saveButton: Locator = this.editAboutDialog.getByRole('button', { name: 'Save' });

  constructor(page: Page, peopleId: string) {
    super(page, PAGE_ENDPOINTS.getProfileScreenPage(peopleId));
    this.baseActionUtil = new BaseActionUtil(page);
  }

  get actions(): IProfileScreenPageActions {
    return this;
  }

  get assertions(): IProfileScreenPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify profile screen page is visible', async () => {
      // Use "Show more" button as it's reliably present on profile pages
      await this.verifier.verifyTheElementIsVisible(this.ellipsesButton, {
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
      await this.verifier.verifyTheElementIsVisible(this.saveButton, {
        assertionMessage: 'Save button should be visible',
      });
      await this.clickOnElement(this.saveButton);
      await this.saveButton.waitFor({ state: 'hidden' }).catch(() => {});
    });
  }
}
