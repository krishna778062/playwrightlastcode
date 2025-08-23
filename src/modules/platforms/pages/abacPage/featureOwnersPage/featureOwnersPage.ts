import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class FeatureOwnersPage extends BasePage {
  readonly userCountButton: Locator;
  readonly feature: Locator;
  readonly searchInputBox: Locator;
  readonly clearButtonOnSearchInputBox: Locator;
  readonly foMenuOptionsButton: Locator;
  readonly foUserCountPopupModule: Locator;
  readonly foUserNamesOnUserCountPopup: Locator;
  readonly foAppManagerTag: Locator;
  readonly plusIconOnEditFeaturePopup: Locator;
  readonly foOptionButtons: Locator;
  readonly addFeatureOnwersInput: Locator;
  readonly doneButtonOnAddFeatureOnwers: Locator;
  readonly editFOTiles: Locator;
  readonly showMoreButtonForEditFO: Locator;
  readonly foCrossButton: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.FEATURE_OWNERS) {
    super(page, pageUrl);
    this.userCountButton = page.locator("[class*='Cell-module'] button p");
    this.feature = page.locator("[class*='FeatureColumn-module-featureName'] p");
    this.searchInputBox = page.getByPlaceholder('Search…');
    this.foMenuOptionsButton = page.locator('[aria-haspopup="menu"]');
    this.foUserNamesOnUserCountPopup = page.locator("[class*='Spacing-module'] p a");
    this.foAppManagerTag = page.locator("[class*='AccessControlListItem-module-appManagerContainer'] p");
    this.foUserCountPopupModule = page.locator("[class*='AccessControlListItem-module-listItemContainer']");
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
  }

  // To verify that the feature owners page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.userCountButton.first(), 'feature Owners page to load').toBeVisible({ timeout: 15000 });
  }

  /**
   * Searches for a particular feature.
   * @param featureName - Feature name for which the user count button need to be clicked.
   */
  async searchForFeature(featureName: string): Promise<void> {
    await test.step(`Searching for ${featureName} feature`, async () => {
      if (await this.clearButtonOnSearchInputBox.isVisible()) {
        await this.clickOnElement(this.clearButtonOnSearchInputBox);
      }
      await this.typeInElement(this.searchInputBox, featureName);
      await this.page.keyboard.press('Enter');
      await this.sleep(1000);
      await expect(this.userCountButton.first()).toBeVisible();
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
      for (let i = 0; i < (await this.feature.count()); i++) {
        if ((await this.feature.nth(i).textContent()) == featureName) {
          await this.clickOnElement(this.foMenuOptionsButton.nth(i));
          break;
        }
      }
      if (optionName == 'Edit') {
        try {
          await this.clickOnElementWithCoordinates(this.foOptionButtons.filter({ hasText: optionName }));
          await expect(this.plusIconOnEditFeaturePopup.nth(0)).toBeVisible({ timeout: 5_000 });
        } catch (e) {
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
    let userNamesWithAppManagerTag: string[] = [];
    return await test.step(`Getting all visible usernames with app manager tag from user count popup`, async () => {
      for (let i = 0; i < (await this.foUserCountPopupModule.count()); i++) {
        const appManagerElement = this.foUserCountPopupModule
          .nth(i)
          .locator("div [class*='AccessControlListItem-module-appManagerContainer'] p");

        if (await appManagerElement.isVisible()) {
          const userNameElement = this.foUserCountPopupModule
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
    });
  }

  /**
   * Adds different users as feature owner for the feature which has it's edit popup opened.
   * @param userNames - Users who need to be added as feature onwers.
   */
  async addUserAsFeatureOnwer(userNames: string[], options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Add users: ${userNames} as feature owners`, async () => {
      await this.clickOnElement(this.plusIconOnEditFeaturePopup);
      while (userNames.length > 0) {
        await this.typeInElement(this.addFeatureOnwersInput, userNames.pop() || '');
        await this.sleep(2000);
        await this.page.keyboard.press('Enter');
      }
      // await this.clickOnElement(this.doneButtonOnAddFeatureOnwers);
      await this.clickOnButtonWithName('Done');
      await this.clickOnButtonWithName('Update');
    });
  }

  /**
   * Adds different users as feature owner for the feature which has it's edit popup opened.
   * @param userNames - Users who need to be added as feature onwers.
   */
  async removeUserAsFeatureOnwer(
    userNames: string[],
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Add users: ${userNames} as feature owners`, async () => {
      let userName: string;
      while (userNames.length > 0) {
        userName = userNames.pop();
        for (let i = 0; i < (await this.editFOTiles.count()); i++) {
          if ((await this.editFOTiles.nth(i).locator('p a').textContent()) == userName) {
            await this.clickOnElement(this.editFOTiles.nth(i).locator('[aria-label="Remove user"]'));
            break;
          }
        }
      }
      await this.clickOnButtonWithName('Update');
    });
  }

  /**
   * Verifies whether the given user is added as feature owner.
   * @param userName - Username of user who need to be checked.
   */
  async verifyUserAsFeatureOnwerForFeature(
    userName: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<boolean> {
    return await test.step(
      options?.stepInfo ?? `Check the presence of user with username: ${userName} as feature owner`,
      async () => {
        for (let i = 0; i < (await this.editFOTiles.count()); i++) {
          const userText = await this.editFOTiles.nth(i).locator('p a').textContent();
          if (userText === userName) {
            console.log(`User ${userName} found as feature owner`);
            return true;
          }
        }
        if (await this.showMoreButtonForEditFO.isVisible()) {
          console.log('User not found in current view, clicking Show More button');
          await this.clickOnElement(this.showMoreButtonForEditFO);
          return await this.verifyUserAsFeatureOnwerForFeature(userName, options);
        }
        console.log(`User ${userName} not found as feature owner`);
        return false;
      }
    );
  }

  /**
   * Verifies whether the given feature onwers are displayed with app manager tag.
   * @param userName - Username of user who need to be checked for app manager tag.
   */
  async verifyFODisplayedAsAppManager(
    userName: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<boolean> {
    let flag: boolean = false;
    let usersWithoutCrossButton: string[];
    await test.step(options?.stepInfo ?? `Check that ${userName} are displayed with App Manager tag`, async () => {
      usersWithoutCrossButton = await this.getUsersWithAppManagerTag();
      console.log(usersWithoutCrossButton);
      if ((usersWithoutCrossButton.filter(userWithoutCrossButton => userWithoutCrossButton === userName).length = 1)) {
        flag = true;
      } else if ((await this.showMoreButtonForEditFO.isVisible()) && !flag) {
        await this.clickOnElement(this.showMoreButtonForEditFO);
        await this.verifyUserAsFeatureOnwerForFeature(userName);
      } else {
        flag = false;
      }
    });
    return flag;
  }
}
