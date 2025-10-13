import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';

test.describe('rewards store', { tag: [REWARD_SUITE_TAGS.REWARD_STORE] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const rewardsStore = new RewardsStore(appManagerPage);
    await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-2909] Verify Category and location dropdown for the gift-cards tab',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify Category and location dropdown for the gift-cards tab',
        zephyrTestId: 'RC-2909',
        storyId: 'RC-2909',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      // Verify the spending component is visible
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.giftCardsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.searchField);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardCountry);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardCategory);

      // Verify the country is not changing on tab change
      await rewardsStore.clickOnElement(rewardsStore.giftCardsTab, {
        stepInfo: 'Clicking on gift cards tab',
      });
      let selectedCountry = rewardsStore.rewardCountry.locator('option:checked');
      await expect(selectedCountry).toHaveText('United States');

      await rewardsStore.clickOnElement(rewardsStore.prepaidCardsTab, {
        stepInfo: 'Clicking on prepaid cards tab',
      });
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.prepaidCardsTab);
      selectedCountry = rewardsStore.rewardCountry.locator('option:checked');
      await expect(selectedCountry).toHaveText('United States');

      await rewardsStore.clickOnElement(rewardsStore.charityDonationsTab, {
        stepInfo: 'Clicking on charity donations tab',
      });
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.charityDonationsTab);
      selectedCountry = rewardsStore.rewardCountry.locator('option:checked');
      await expect(selectedCountry).toHaveText('United States');
    }
  );

  test(
    '[RC-2829] Validate the spending component for the rewards store',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate the spending component for the rewards store',
        zephyrTestId: 'RC-2829',
        storyId: 'RC-2829',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Verify the spending component is visible
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.giftCardsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.searchField);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardCountry);

      // Mock API and verify points balance
      await rewardsStore.mockTheAPIForElementChecks();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.giftCardsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.pointsBalanceContainer);

      const pointsBalanceText = await rewardsStore.pointToSpend.textContent();
      const pointsBalanceLabel = rewardsStore.pointToSpendText;
      const pendingPointsText = rewardsStore.pendingPoints;

      expect(pointsBalanceText).toMatch(/^\d{1,3}(?:,\d{3})*$/);
      await expect(pointsBalanceLabel).toHaveText('Points to spend');
      await expect(pendingPointsText).toHaveText('+100 pending');
    }
  );

  test(
    '[RC-3054] Verify if items are provided in ascending order, when user searching for rewards',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify if items are provided in ascending order, when user searching for rewards',
        zephyrTestId: 'RC-3054',
        storyId: 'RC-3054',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      const initialApiGiftList = await rewardsStore.getAllTheAPIGiftList();

      // Validate gift cards are shown in ascending order initially
      await rewardsStore.getAllTheGitCardAndValidateAllAreInAscendingOrder(initialApiGiftList);

      // Search for Amazon in the search field
      await rewardsStore.searchForGiftCard('Amazon');

      const filteredApiGiftList = await rewardsStore.getFilteredAPIGiftList('Amazon');

      // Validate gift cards are shown in ascending order after filtering with Amazon
      await rewardsStore.getAllTheGitCardAndValidateAllAreInAscendingOrder(filteredApiGiftList);
    }
  );

  test(
    '[RC-2976] Validate Legal terms in the footer on Rewards Page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Legal terms in the footer on Rewards Page',
        zephyrTestId: 'RC-2976',
        storyId: 'RC-2976',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Validate the legal terms in the footer if matching rewards are found
      await rewardsStore.searchForGiftCard('Amazon');
      const legalTermText =
        "The merchants represented are not sponsors of the rewards or otherwise affiliated with Simpplr Inc. The logos and other identifying marks attached are trademarks of and owned by each represented company and/or its affiliates. Please visit each company's website for additional terms and conditions.";
      await rewardsStore.legalTermText.scrollIntoViewIfNeeded();
      await rewardsStore.verifier.verifyElementHasText(rewardsStore.legalTermText, legalTermText);

      // Validate the legal terms in the footer if no matching rewards are found
      await rewardsStore.searchForGiftCard('No Reward Page');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundHeading);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundText);
    }
  );

  test(
    '[RC-3228] Validate corners of the Reward store images',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate corners of the Reward store images',
        zephyrTestId: 'RC-3228',
        storyId: 'RC-3228',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Check reward images corner
      await rewardsStore.validateTheImageRoundedCorners();

      // Click on Prepaid cards tab & verify images corner
      await rewardsStore.clickOnElement(rewardsStore.prepaidCardsTab, {
        stepInfo: 'Clicking on prepaid cards tab',
      });
      await rewardsStore.validateTheImageRoundedCorners();

      // Click on Charity donations tab & verify image corners
      await rewardsStore.clickOnElement(rewardsStore.charityDonationsTab, {
        stepInfo: 'Clicking on charity donations tab',
      });
      await rewardsStore.validateTheImageRoundedCorners();
    }
  );

  test(
    '[RC-2857] Validate search Rewards on reward store page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate search Rewards on reward store page',
        zephyrTestId: 'RC-2857',
        storyId: 'RC-2857',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Verify search box and tabs are visible
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.searchField);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.giftCardsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.prepaidCardsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.charityDonationsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.orderHistoryTab);

      // Search with available rewards and verify search box
      await rewardsStore.searchField.fill('Amazon');
      await rewardsStore.searchField.press('Enter');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.cards('Amazon'));

      // Search with numeric and verify search box
      await rewardsStore.searchField.fill('123456');
      await rewardsStore.searchField.press('Enter');
      await rewardsStore.verifier.verifyTheElementIsNotVisible(rewardsStore.cards('123456'));
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundHeading);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundText);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.resetButton);

      // Search with special characters and verify search box
      await rewardsStore.searchField.fill('!@#$%^&*()');
      await rewardsStore.searchField.press('Enter');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundHeading);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundText);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.resetButton);

      // Search with unavailable rewards and verify search box
      await rewardsStore.searchField.fill('Unavailable');
      await rewardsStore.searchField.press('Enter');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundHeading);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundText);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.resetButton);

      // Search with random numbers and verify search box
      await rewardsStore.searchField.fill('Test_' + Math.floor(Math.random() * 19000 + 1000));
      await rewardsStore.searchField.press('Enter');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundHeading);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundText);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.resetButton);

      // Click on reset button and verify search box
      await rewardsStore.resetButton.click();
      await expect(rewardsStore.searchField).toHaveValue('');
      await rewardsStore.cards('').first().waitFor({ state: 'visible' });
      const cardsCount = await rewardsStore.cards('').count();
      expect(cardsCount).toBeGreaterThan(1);
    }
  );

  test(
    '[RC-2833] Verify the link to rewards store',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify the link to rewards store',
        zephyrTestId: 'RC-2833',
        storyId: 'RC-2833',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.giftCardNames.last());
      const currentUrl = rewardsStore.page.url();
      expect(currentUrl).toContain('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
    }
  );

  test(
    '[RC-3224] Validate Country selector dropdown for the rewards store',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Country selector dropdown for the rewards store',
        zephyrTestId: 'RC-3224',
        storyId: 'RC-3224',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      function extractGiftCardCount(text: string | null): number {
        const match = text?.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }

      const testData = [
        { country: 'United States', giftCardName: 'Amazon.com' },
        { country: 'India', giftCardName: 'Amazon.in' },
        { country: 'United Kingdom', giftCardName: 'Amazon.co.uk Ireland' },
        { country: 'Canada', giftCardName: 'Amazon.ca' },
      ];

      for (const { country, giftCardName } of testData) {
        // Select country
        await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, country);

        // Get initial gift card count
        await rewardsStore.giftCardCount.waitFor({ state: 'visible' });
        const initialCountText = await rewardsStore.giftCardCount.textContent();
        const initialCount = extractGiftCardCount(initialCountText);

        // Search for gift card
        await rewardsStore.searchForGiftCard(giftCardName);

        // Get new count
        await rewardsStore.giftCardCount.waitFor({ state: 'visible' });
        const availableCountText = await rewardsStore.giftCardCount.textContent();
        const availableCount = extractGiftCardCount(availableCountText);

        // Validate
        expect(availableCount).toBe(1);
        expect(initialCount).not.toBe(availableCount);

        // Reset
        await rewardsStore.resetButton.last().click({ force: true });
      }
    }
  );

  test(
    '[RC-3121] Verify the country drop down when user visits rewards store for first time',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify the country drop down when user visits rewards store for first time',
        zephyrTestId: 'RC-3121',
        storyId: 'RC-3121',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      // Mock the Reward API to set the User is new to Reward Store page
      await rewardsStore.mockTheRewardAPIForNewUser();

      // Verify the country selection dropdown is displayed
      await rewardsStore.header.last().waitFor({ state: 'visible' });
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.firstTimeCountrySelectDropdown);
    }
  );

  test(
    '[RC-2921] Verify total count for each category on reward store page along with Reset button',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify total count for each category on reward store page along with Reset button',
        zephyrTestId: 'RC-2921',
        storyId: 'RC-2921',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Verify tabs and elements are visible
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.giftCardsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.prepaidCardsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.charityDonationsTab);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.searchField);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardCategory);

      // Click on 'All Categories' dropdown and verify total count for each category
      const initialGiftCardCount = await rewardsStore.giftCardCount.textContent();
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCategory, 'Fashion');
      const newGiftCardCount = await rewardsStore.giftCardCount.textContent();
      expect(initialGiftCardCount).not.toMatch(newGiftCardCount || '');

      // Click on Reset link and verify it
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.resetButton);
      await rewardsStore.resetButton.click();
      const resetGiftCardCount = await rewardsStore.giftCardCount.textContent();
      console.log(resetGiftCardCount);

      // Verify total count for category has no/zero gift cards
      const selectedCountry = await rewardsStore.rewardCountry.inputValue();
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'Canada');
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCategory, 'Specialty');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.resetButton);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundHeading);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.noRewardsFoundText);
      await rewardsStore.resetButton.click();
      const zeroGiftCardCount = await rewardsStore.giftCardCount.textContent();
      console.log(zeroGiftCardCount);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, selectedCountry);
    }
  );

  test(
    '[RC-3122] Verify default value of user location in searching rewards',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify default value of user location in searching rewards',
        zephyrTestId: 'RC-3122',
        storyId: 'RC-3122',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      const giftCardProductName = 'Amazon';

      // Login as User A and set the location to Canada
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'Canada');

      // Search the Amazon for User A, validate the Gift card and copy the url
      await rewardsStore.searchForGiftCard(giftCardProductName);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.giftCardNames.first(), giftCardProductName);
      const copiedUrl = rewardsStore.page.url();
      expect(copiedUrl).toContain('reward');

      // Login as User B and set the default location is United States
      const contextB = rewardsStore.page.context();
      const pageB = await contextB.newPage();
      const rewardStoreB = new RewardsStore(pageB);

      await rewardStoreB.loginAsStandardUserAndNavigateToRewardsStore();
      await rewardStoreB.selectDropdownByLabel(rewardStoreB.rewardCountry, 'United States');

      // Switch to User B and navigate to the copiedUrl and check the gift card
      await pageB.goto(copiedUrl);
      await rewardStoreB.verifier.verifyElementContainsText(rewardStoreB.giftCardNames.first(), giftCardProductName);

      // Cleanup
      await rewardsStore.page.close();
      await contextB.close();
    }
  );
});
