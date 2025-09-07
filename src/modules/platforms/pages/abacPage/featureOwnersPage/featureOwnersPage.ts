import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';
import { UserCountPopupComponent } from '@platforms/components/userCountPopupComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class FeatureOwnersPage extends BasePage {
  readonly userCountButton: Locator;
  readonly feature: Locator;
  readonly searchInputBox: Locator;
  readonly clearButtonOnSearchInputBox: Locator;
  readonly plusIconOnEditFeaturePopup: Locator;
  readonly foOptionButtons: Locator;
  readonly addFeatureOnwersInput: Locator;
  readonly doneButtonOnAddFeatureOnwers: Locator;
  readonly editFOTiles: Locator;
  readonly showMoreButtonForEditFO: Locator;
  readonly foCrossButton: Locator;
  readonly featureOwnerMenuOptionButton: Locator;
  readonly showMoreButton: Locator;
  readonly noResultsFoundHeading: Locator;
  readonly noResultsFoundDescription: Locator;

  // Component
  readonly userCountPopup: UserCountPopupComponent;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.FEATURE_OWNERS) {
    super(page, pageUrl);
    this.userCountButton = page.locator("[class*='Cell-module'] button p");
    this.feature = page.locator("[class*='FeatureColumn-module-featureName'] p");
    this.searchInputBox = page.getByPlaceholder('Search…');
    this.plusIconOnEditFeaturePopup = page.locator("[class*='IconButton-module__iconbutton-overlay']");
    this.foOptionButtons = page.locator('[class*="DropdownMenu-module__DropdownMenuItemLabel"]');
    this.addFeatureOnwersInput = page.getByRole('combobox');
    this.doneButtonOnAddFeatureOnwers = page.getByRole('button', { name: 'Done' });
    this.editFOTiles = page.locator('[class*="AccessControlListItem-module-listItemContainer"]');
    this.clearButtonOnSearchInputBox = page.locator('[aria-label="Clear"]');
    this.showMoreButtonForEditFO = page.locator(
      '[class*="AccessControlSelectionItems-module-showMoreButtonContainer"] button'
    );
    this.foCrossButton = page.locator('[aria-label="Remove user"]');
    this.featureOwnerMenuOptionButton = page.locator('[data-testid*="dataGridRow"]');
    this.showMoreButton = page.getByRole('button', { name: 'Show more' });
    this.noResultsFoundHeading = page.getByText('No results found');
    this.noResultsFoundDescription = page.getByText('Try adjusting search terms or filters');

    // Initialize component
    this.userCountPopup = new UserCountPopupComponent(page);
  }

  // To verify that the feature owners page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.userCountButton.first(), 'feature Owners page to load').toBeVisible({ timeout: 15000 });
  }

  /**
   * Searches for a particular feature.
   * @param featureName - Feature name for which the user count button need to be clicked.
   * @param expectResults - Whether to expect search results (default: true). Set false for testing "no results" scenarios.
   */
  async searchForFeature(featureName: string, expectResults: boolean = true): Promise<void> {
    await test.step(`Searching for ${featureName} feature`, async () => {
      if (await this.clearButtonOnSearchInputBox.isVisible()) {
        await this.clickOnElement(this.clearButtonOnSearchInputBox);
      }
      await this.typeInElement(this.searchInputBox, featureName);
      await this.page.keyboard.press('Enter');

      if (expectResults) {
        // Wait for search results to show feature count buttons (state-based wait)
        await this.userCountButton.first().waitFor({ state: 'visible', timeout: 10000 });
      } else {
        // Wait for search completion - either feature names display or "No results found" message appears
        await Promise.race([
          this.page.waitForSelector("[class*='FeatureColumn-module-featureName'] p", {
            state: 'visible',
            timeout: 10000,
          }),
          this.page.waitForSelector('text="No results found"', { state: 'visible', timeout: 10000 }),
        ]);
      }
    });
  }

  /**
   * Clicks on user count button for a particular feature.
   * @param featureName - Feature name for which the user count button need to be clicked.
   */
  async clickOnUserCountButton(featureName: string): Promise<void> {
    await test.step(`Click on the user count button for ${featureName} feature`, async () => {
      for (let i = 0; i < (await this.feature.count()); i++) {
        if ((await this.feature.nth(i).textContent()) == featureName) {
          await this.clickOnElement(this.userCountButton.nth(i));
          break;
        }
      }
    });
  }

  /**
   * Clicks on menu options button for a particular feature.
   * @param featureName - Feature name for which the user count button need to be clicked.
   * @param optionName - ex. Edit and Audit history. Option that needs to be selected after clicking on menu option button
   */
  async clickOnButtonForFeature(
    featureName: string,
    optionName: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on the Edit button for ${featureName} feature`, async () => {
      const selectedFeature: Locator = this.featureOwnerMenuOptionButton.filter({ hasText: featureName });
      await this.clickOnElement(selectedFeature.locator('[aria-label="More"]'));
      if (optionName == 'Edit') {
        try {
          await this.clickOnElementWithCoordinates(this.foOptionButtons.filter({ hasText: optionName }));
          await expect(this.plusIconOnEditFeaturePopup.nth(0)).toBeVisible({ timeout: 5_000 });
        } catch {
          console.log(`Couldn't click on ${optionName} button`);
          await this.clickOnElement(this.foOptionButtons.filter({ hasText: optionName }), {
            timeout: options?.timeout ?? 10_000,
            force: true,
            // stepInfo: 'Clicking on the Edit button with force',
          });
        }
        await expect(this.plusIconOnEditFeaturePopup.nth(0)).toBeVisible();
      } else {
        await this.clickOnElement(this.foOptionButtons.filter({ hasText: optionName }));
      }
    });
  }

  /**
   * Gets list of usernames of users having app manager tag from edit popup of feature owners.
   */
  async getUsersWithAppManagerTag(): Promise<string[]> {
    const userNamesWithAppManagerTag: string[] = [];
    return await test.step(`Getting all visible usernames with app manager tag from user count popup`, async () => {
      for (let i = 0; i < (await this.userCountPopup.foUserCountPopupModal.count()); i++) {
        const appManagerElement = this.userCountPopup.foUserCountPopupModal
          .nth(i)
          .locator("div [class*='AccessControlListItem-module-appManagerContainer'] p");

        if (await appManagerElement.isVisible()) {
          const userNameElement = this.userCountPopup.foUserCountPopupModal
            .nth(i)
            .locator("[class*='Typography-module__paragraph'] a");

          const userName = await userNameElement.textContent();
          if (userName) {
            userNamesWithAppManagerTag.push(userName.trim());
          }
        }
      }
      if (userNamesWithAppManagerTag.length > 0) {
        return userNamesWithAppManagerTag;
      } else if (await this.showMoreButtonForEditFO.isVisible()) {
        await this.clickOnElement(this.showMoreButtonForEditFO);
        return await this.getUsersWithAppManagerTag();
      } else {
        expect(`Couldn't find any users with app manaage tag`).toBeFalsy();
      }
      return userNamesWithAppManagerTag;
    });
  }

  /**
   * Adds different users as feature owner for the feature which has it's edit popup opened.
   * @param userNames - Users who need to be added as feature onwers.
   */
  async addUserAsFeatureOnwer(userNames: string[], options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Add users: ${userNames} as feature owners`, async () => {
      await this.clickOnElement(this.plusIconOnEditFeaturePopup, {
        stepInfo: 'Click on plus icon to add feature owners',
      });
      while (userNames.length > 0) {
        await this.typeInElement(this.addFeatureOnwersInput, userNames.pop() || '');
        await this.sleep(2000);
        await this.page.keyboard.press('Enter');
      }
      await this.clickOnButtonWithName('Done');
      await this.clickOnButtonWithName('Update');
    });
  }

  /**
   * Finds user and remove the user from feature owners list.
   * @param userName - User who need find in visible list of feature owners.
   * @return true if user is found and removed in list of feature owners, otherwise false.
   */
  async removeUserFromFeatureOwnersList(
    userName: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Removing ${userName} from feature owners list`, async () => {
      const userToBeRemoved = await this.getFeatureOwnerRecordItem(userName, true);
      await this.clickOnElement(userToBeRemoved.locator('[aria-label="Remove user"]'));
      await this.clickOnButtonWithName('Update');
    });
  }

  /**
   * Verifies whether the given feature onwers are displayed with app manager tag.
   * @param userName - Username of user who need to be checked for app manager tag.
   */
  async verifyFeatureOwnerIsDisplayedWithAppManagerTag(userName: string): Promise<void> {
    await test.step(`Verifying ${userName} is displayed with app manager tag`, async () => {
      const featureOwnerRecordItem = await this.getFeatureOwnerRecordItem(userName, true);
      //verify this record has app manager tag
      const appManagerTag = featureOwnerRecordItem.locator(
        "[class*='AccessControlListItem-module-appManagerContainer'] p"
      );
      await expect(appManagerTag).toBeVisible();
    });
  }

  /**
   * Gets the locator of feature owner record item having the given username. Doesn't return anything if user is not found.
   * @param userName - Username of user who need to be checked for feature owner.
   * @param visiblility - Whether the user record should be visible or not.
   * @returns The feature owner record item.
   */
  async getFeatureOwnerRecordItem(userName: string, visiblility: boolean): Promise<any> {
    let featureOwnerRecordItem: any = this.page
      .locator("[class*='AccessControlListItem-module-listItemContainer']")
      .filter({ hasText: userName });
    let isShowMoreButtonVisible = await this.verifier.isTheElementVisible(this.showMoreButtonForEditFO, {
      timeout: 1000,
    });
    let isUserVisible = await this.verifier.isTheElementVisible(featureOwnerRecordItem, { timeout: 1000 });
    //iterate until show more button is visible and feature owner record item is not visible
    while (isShowMoreButtonVisible && !isUserVisible) {
      await this.clickOnElement(this.showMoreButtonForEditFO, {
        stepInfo:
          'Since the user record is not visible but the show more button is visible hence clicking on show more button',
      });
      isUserVisible = await this.verifier.isTheElementVisible(featureOwnerRecordItem, {
        timeout: 1000,
      });
      isShowMoreButtonVisible = await this.verifier.isTheElementVisible(this.showMoreButtonForEditFO, {
        timeout: 1000,
      });
    }
    if (visiblility) {
      expect(isUserVisible, `expecting  ${userName} to be visible`).toBeTruthy();
    } else {
      expect(isUserVisible, `expecting ${userName} not to be visible`).toBeFalsy();
      featureOwnerRecordItem = null;
    }
    return featureOwnerRecordItem;
  }

  /**
   * Verifies given user is not displayed as feature owner.
   * @param userName - Username of user who need to be checked for feature owner.
   */
  async verifyUserIsNotDisplayedAsFeatureOwner(userName: string): Promise<void> {
    await test.step(`Verifying ${userName} is not displayed in the feature owners list`, async () => {
      await this.getFeatureOwnerRecordItem(userName, false);
    });
  }

  /**
   * Clicks "Show more" button to load additional features for testing purposes
   */
  async clickShowMore(): Promise<void> {
    await test.step('Click "Show more" button to load additional features for testing', async () => {
      if (await this.showMoreButton.isVisible()) {
        const initialFeatureCount = await this.feature.count();
        await this.clickOnElement(this.showMoreButton);

        // Wait for new features to load by checking if count has increased
        await this.page.waitForFunction(
          count => document.querySelectorAll("[class*='FeatureColumn-module-featureName'] p").length > count,
          initialFeatureCount,
          { timeout: 10000 }
        );
      }
    });
  }

  async getAllFeatureNames(): Promise<string[]> {
    return await test.step('Get all feature names from Feature Owners page', async () => {
      const featureTextContents = await this.feature.allTextContents();
      return featureTextContents.map(name => name.trim()).filter(name => name.length > 0);
    });
  }

  async verifyNoResultsFoundMessages(): Promise<void> {
    await test.step('Verify "No results found" messages are displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.noResultsFoundHeading, {
        assertionMessage: 'No results found heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.noResultsFoundDescription, {
        assertionMessage: 'No results found description should be visible',
      });
    });
  }

  /**
   * Clicks on user count button for a specific feature or by index
   * @param featureNameOrIndex - Name of the feature or index number (for fallback)
   */
  async clickOnCountButton(featureNameOrIndex: string | number = 0): Promise<string> {
    return await test.step(`Click on user count button for ${typeof featureNameOrIndex === 'string' ? `feature: ${featureNameOrIndex}` : `index ${featureNameOrIndex}`}`, async () => {
      let userCountButton;

      if (typeof featureNameOrIndex === 'string') {
        // Find by feature name
        const featureRow = this.page
          .locator(`[class*='FeatureColumn-module-featureName'] p`)
          .filter({ hasText: featureNameOrIndex })
          .locator('../../..');
        userCountButton = featureRow.locator('[class*="OwnerColumn-module-userCount"]');
      } else {
        // Find by index (fallback)
        userCountButton = this.userCountButton.nth(featureNameOrIndex);
      }

      await this.verifier.verifyTheElementIsVisible(userCountButton, {
        assertionMessage: `User count button should be visible`,
      });
      const countText = await userCountButton.textContent();
      await this.clickOnElement(userCountButton);
      return countText?.trim() || '';
    });
  }

  /**
   * Verifies that the user count popup is opened with correct count using dedicated component
   * @param expectedCount - Expected user count to verify
   */
  async verifyUserCountPopupOpened(expectedCount: string): Promise<void> {
    await this.userCountPopup.verifyPopupOpenedWithCount(expectedCount);
  }
}
