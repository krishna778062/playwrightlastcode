import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestGroupType } from '@core/constants/testType';

import { ACTION_LABELS } from '../../constants/common';
import { MESSAGES } from '../../constants/messageRepo';
import { APPS_LINKS } from '../../test-data/gamma-data-file';
import { formattedLinks } from '../../test-data/gamma-data-file';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestPriority } from '@/src/core/constants/testPriority';
import { AppsLinksPage } from '@/src/modules/integrations/ui/pages/appsLinksPage';

test.describe(
  'feature: Apps and Links',
  {
    tag: [IntegrationsFeatureTags.APPS_LINKS, IntegrationsSuiteTags.GAMMA],
  },
  () => {
    let appsLinks: AppsLinksPage;

    test(
      'add Apps & Links and mark them as favorite',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);

        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON, APPS_LINKS.CUSTOM_JSON);

        //Add links
        await appsLinks.addLinks(formattedLinks);

        await appsLinks.verifyToastMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);

        //apps and links launchpad verify
        await appsLinks.verifySubTabsInsideAppsLinksTabIsVisible(APPS_LINKS.APPS_TEXT);
        await appsLinks.verifySubTabsInsideAppsLinksTabIsVisible(APPS_LINKS.LINKS_TEXT);
        await appsLinks.markAppsFavorite(APPS_LINKS.GOOGLE_DRIVE);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.LINKS_TEXT);
        await appsLinks.clickOnSubButtonsInsideLinksTab(APPS_LINKS.ORG_LINKS);
        await appsLinks.markLinksFavorite(APPS_LINKS.YOUTUBE);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.FAVORITES);
        await appsLinks.verifyAppsAreMarkedAsFavorite(APPS_LINKS.GOOGLE_DRIVE);
        await appsLinks.clickOnSubButtonsInsideFavorite(APPS_LINKS.LINKS_TEXT);
        await appsLinks.verifyLinksAreMarkedAsFavorite(APPS_LINKS.YOUTUBE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.clickOnAppsIntegrationDropdown(ACTION_LABELS.NONE);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
        await appsLinks.verifyToastMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
      }
    );

    test(
      'verify apps and links URL in launchpad',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);

        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON, APPS_JSON);

        //Add links
        await appsLinks.addLinks(formattedLinks);
        await appsLinks.verifyToastMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.verifyApps(APPS_LINKS.GOOGLE_DRIVE);
        await appsLinks.verifyApps(APPS_LINKS.MICROSOFT_365);
        await appsLinks.verifyURL(APPS_LINKS.app, APPS_LINKS.GOOGLE_DRIVE, APPS_LINKS.GOOGLE_DRIVE_LINK);
        await appsLinks.verifyURL(APPS_LINKS.app, APPS_LINKS.MICROSOFT_365, APPS_LINKS.MICROSOFT_LINK);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.LINKS);
        await appsLinks.verifyOrgLinks(APPS_LINKS.GOOGLE);
        await appsLinks.verifyOrgLinks(APPS_LINKS.YOUTUBE);
        await appsLinks.verifyOrgLinks(APPS_LINKS.AMAZON);
        await appsLinks.verifyOrgLinks(APPS_LINKS.FLIPKART);
        await appsLinks.verifyOrgLinks(APPS_LINKS.SIMMPLR);
        await appsLinks.verifyURL(APPS_LINKS.link, APPS_LINKS.GOOGLE, APPS_LINKS.GOOGLE_LINK);
        await appsLinks.verifyURL(APPS_LINKS.link, APPS_LINKS.YOUTUBE, APPS_LINKS.YOUTUBE_LINK);
        await appsLinks.verifyURL(APPS_LINKS.link, APPS_LINKS.AMAZON, APPS_LINKS.AMAZON_LINK);
        await appsLinks.verifyURL(APPS_LINKS.link, APPS_LINKS.FLIPKART, APPS_LINKS.FLIPKART_LINK);
        await appsLinks.verifyURL(APPS_LINKS.link, APPS_LINKS.SIMMPLR, APPS_LINKS.SIMPPLR_LINK);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.clickOnAppsIntegrationDropdown(ACTION_LABELS.NONE);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
        await appsLinks.verifyToastMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
      }
    );

    test(
      'verify custom links: If Custom links checkbox is selected then user should be able to see add custom link options else not',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);

        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON, APPS_JSON);

        //Add links
        await appsLinks.addLinks(formattedLinks);
        //CheckBox Unchecked
        await appsLinks.customLinkCheckBox(ACTION_LABELS.FALSE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.verifySubTabsInsideLinksVisibility(
          APPS_LINKS.LINKS,
          APPS_LINKS.CUSTOM_LINKS,
          ACTION_LABELS.FALSE
        );

        //CheckBox Checked
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS);
        await appsLinks.customLinkCheckBox(ACTION_LABELS.TRUE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS);
        await appsLinks.verifySubTabsInsideLinksVisibility(
          APPS_LINKS.LINKS,
          APPS_LINKS.CUSTOM_LINKS,
          ACTION_LABELS.TRUE
        );
        await appsLinks.clickOnSubButtonsInsideLinksTab(APPS_LINKS.CUSTOM_LINKS);
        await appsLinks.addAndVerifyCustomLinks(APPS_LINKS.YOUTUBE, APPS_LINKS.YOUTUBE_LINK);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.markLinksFavorite(APPS_LINKS.YOUTUBE);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.FAVORITES);
        await appsLinks.clickOnSubButtonsInsideFavorite(APPS_LINKS.LINKS);
        await appsLinks.verifyLinksAreMarkedAsFavorite(APPS_LINKS.YOUTUBE);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.LINKS);
        await appsLinks.clickOnSubButtonsInsideLinksTab(APPS_LINKS.CUSTOM_LINKS);
        await appsLinks.deleteCustomLink(APPS_LINKS.YOUTUBE);
        await appsLinks.clickOnAppsIntegrationDropdown(ACTION_LABELS.NONE);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
      }
    );

    test(
      'login through end user and verify custom links and org links',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);
        await appsLinks.customLinkCheckBox(ACTION_LABELS.FALSE);
        await appsLinks.clickOnHomePageHeader('Profile settings');
        await appsLinks.clickOnSubButtonsInsideLinksTab('Log out');
        // multiUserTileFixture(
        //   'Multi-user - EndUser login',
        //   {
        //     tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
        //   },
        //   async ({ endUserPage }) => {
        //     tagTest(multiUserTileFixture.info(), {
        //       zephyrTestId: 'INT-27189',
        //       storyId: 'INT-23049',
        //   });
        const emailId: Locator = await page.locator('#inputOption');
        const password: Locator = await page.locator('#inputPassword');
        const continueBtn: Locator = await page.locator('text = Continue');
        const loginBtn: Locator = await page.locator('text = Sign in');
        await emailId.fill('priyanka.dubey@simpplr.com');
        await continueBtn.click();
        await password.fill('Test@123');
        await loginBtn.click();
        await appsLinks.verifyThePageIsLoaded();

        //If app manager has unchecked custom links
        await appsLinks.verifyHomePageHeaderNonVisibility(APPS_LINKS.APPS_LINKS);
        //If app manager has checked custom links
        await appsLinks.clickOnHomePageHeader('Profile settings');
        await appsLinks.clickOnSubButtonsInsideLinksTab('Log out');
        const appManagerEmailId: Locator = await page.locator('#inputOption');
        const appManagerPassword: Locator = await page.locator('#inputPassword');
        const continueButton: Locator = await page.locator('text = Continue');
        const loginButton: Locator = await page.locator('text = Sign in');
        await appManagerEmailId.fill('neha.manhas@simpplr.com');
        await continueButton.click();
        await appManagerPassword.fill('Simp@123456');
        await loginButton.click();
        await appsLinks.verifyThePageIsLoaded();
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);
        await appsLinks.customLinkCheckBox(ACTION_LABELS.TRUE);
        await appsLinks.clickOnHomePageHeader('Profile settings');
        await appsLinks.clickOnSubButtonsInsideLinksTab('Log out');
        const EndUserEmailId: Locator = page.locator('#inputOption');
        const EndUserPassword: Locator = page.locator('#inputPassword');
        const clickOnContinue: Locator = page.locator('text = Continue');
        const clickOnLogin: Locator = page.locator('text = Sign in');
        await EndUserEmailId.fill('priyanka.dubey@simpplr.com');
        await clickOnContinue.click();
        await EndUserPassword.fill('Test@123');
        await clickOnLogin.click();
        await appsLinks.verifyThePageIsLoaded();
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.verifyEndUserCustomLinks(
          'Get started by adding custom links. Add links of your own for quick access.'
        );
        await appsLinks.verifyOrgLinkVisibility(ACTION_LABELS.FALSE);
        await appsLinks.clickOnHomePageHeader('Profile settings');
        await appsLinks.clickOnSubButtonsInsideLinksTab('Log out');
      }
    );

    test(
      'verify a user cannot save duplicate apps or links',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);

        //Add Apps: custom JSON
        await appsLinks.clickOnAppsIntegrationDropdown('Custom JSON');
        await appsLinks.addDuplicateCustomApps();
        await appsLinks.verifyAppsDuplicate('App name and url in custom JSON should be unique');

        //Add links
        await appsLinks.addDuplicateLinks(APPS_LINKS.GOOGLE, APPS_LINKS.GOOGLE_LINK);
        await appsLinks.addDuplicateLinks(APPS_LINKS.GOOGLE, APPS_LINKS.GOOGLE_LINK);
        await appsLinks.verifyLinksDuplicate('This URL already exists', 'This label already exists');
      }
    );

    test(
      'verify zero state message of Favorites tab',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);

        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON, APPS_JSON);

        //Add links
        const links = [
          { url: APPS_LINKS.GOOGLE_LINK, label: APPS_LINKS.GOOGLE },
          { url: APPS_LINKS.YOUTUBE_LINK, label: APPS_LINKS.YOUTUBE },
        ];
        const formattedLinks = links.map(link => ({
          Link_URL: link.url,
          Link_Label: link.label,
        }));
        await appsLinks.addLinks(formattedLinks);
        await appsLinks.verifyToastMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.FAVORITES);
        await appsLinks.verifyZeroStateMessageOfFavoritesTab(MESSAGES.NO_FAVORITES_APP, MESSAGES.SAVE_APPS_FAVORITE);
        await appsLinks.clickOnSubButtonsInsideFavorite(APPS_LINKS.LINKS);
        await appsLinks.verifyZeroStateMessageOfFavoritesTab(MESSAGES.NO_FAVORITES_LINK, MESSAGES.SAVE_LINKS_FAVORITE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.clickOnAppsIntegrationDropdown(ACTION_LABELS.NONE);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
      }
    );

    test(
      'verify add button, edit button, sort by button, search box and count on custom links tab',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.clickOnSubButtonsInsideLinksTab(APPS_LINKS.CUSTOM_LINKS);
        await appsLinks.addAndVerifyCustomLinks(APPS_LINKS.YOUTUBE, APPS_LINKS.YOUTUBE_LINK);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.verifyButtonInsideCustomLinks('Add links');
        await appsLinks.verifyButtonInsideCustomLinks('Edit links');
        await appsLinks.verifyButtonInsideCustomLinks('Sort by');
        await appsLinks.verifySearchBoxVisibilityAndCountInsideLaunchpad();
        await appsLinks.deleteCustomLink(APPS_LINKS.YOUTUBE);

        //RollBack
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_AND_LINKS);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
      }
    );

    test(
      'verify when there are no apps and links added then the launchpad should not be visible',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        appsLinks = new AppsLinksPage(appManagerFixture.page);
        await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);
        await appsLinks.customLinkCheckBox(ACTION_LABELS.FALSE);
        await appsLinks.verifyThePageIsLoaded();
        await appsLinks.verifyHomePageHeaderNonVisibility(APPS_LINKS.APPS_LINKS);
        await appsLinks.customLinkCheckBox(ACTION_LABELS.TRUE);
      }
    );
  }
);
