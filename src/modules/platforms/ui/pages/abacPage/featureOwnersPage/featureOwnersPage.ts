import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/ui/pages/basePage';
import { UserCountPopupComponent } from '@platforms/ui/components/userCountPopupComponent';

import { FeatureOwnerModalComponent } from '../../../components/featureOwnerModal';

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
  readonly featureOwnerModal: FeatureOwnerModalComponent;

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
    this.featureOwnerModal = new FeatureOwnerModalComponent(page);
  }

  // To verify that the feature owners page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.userCountButton.first(), 'feature Owners page to load').toBeVisible({ timeout: 15000 });
  }

  /**
   * Searches for a particular feature.
   * @param featureName - Feature name for which the user count button need to be clicked.
   * @param expectResults - Optional. When passed: true = wait for feature names, false = wait for "No results found". When not passed: uses default behavior (wait for user count button).
   */
  async searchForFeature(featureName: string, expectResults?: boolean): Promise<void> {
    await test.step(`Searching for ${featureName} feature`, async () => {
      if (await this.clearButtonOnSearchInputBox.isVisible()) {
        await this.clickOnElement(this.clearButtonOnSearchInputBox);
      }
      await this.typeInElement(this.searchInputBox, featureName);
      await this.page.keyboard.press('Enter');

      if (expectResults !== undefined) {
        // Only use conditional logic when expectResults is explicitly passed
        if (expectResults) {
          // Wait for feature names when results are expected
          await this.page.waitForSelector("[class*='FeatureColumn-module-featureName'] p", {
            state: 'visible',
            timeout: 10000,
          });
        } else {
          // Wait for "No results found" message when no results are expected
          await this.page.waitForSelector('text="No results found"', {
            state: 'visible',
            timeout: 10000,
          });
        }
      } else {
        // Default behavior when expectResults is not passed (backward compatibility)
        await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT / 2);
        await this.userCountButton.first().waitFor({ state: 'visible', timeout: 10000 });
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
          expect(await this.featureOwnerModal.verifyTheFeatureOwnerModalIsVisible(featureName)).toBeTruthy();
        } catch {
          console.log(`Couldn't click on ${optionName} button`);
          await this.clickOnElement(this.foOptionButtons.filter({ hasText: optionName }), {
            timeout: options?.timeout ?? 10_000,
            force: true,
            // stepInfo: 'Clicking on the Edit button with force',
          });
        }
        expect(await this.featureOwnerModal.verifyTheFeatureOwnerModalIsVisible(featureName)).toBeTruthy();
      } else {
        await this.clickOnElement(this.foOptionButtons.filter({ hasText: optionName }));
      }
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
        await expect.poll(async () => await this.feature.count()).toBeGreaterThan(initialFeatureCount);
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
        // Find by feature name - using stable row selector instead of DOM traversal
        const featureRow = this.page.locator('[data-testid*="dataGridRow"]').filter({
          has: this.page
            .locator(`[class*='FeatureColumn-module-featureName'] p`)
            .filter({ hasText: featureNameOrIndex }),
        });
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
