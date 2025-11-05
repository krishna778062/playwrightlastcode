import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestGroupType } from '@core/constants/testType';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestPriority } from '@/src/core/constants/testPriority';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { APPS_LINKS, formattedLinks } from '@/src/modules/integrations/test-data/gamma-data-file';
import { AppsLinksPage } from '@/src/modules/integrations/ui/pages/appsLinksPage';

test.describe(
  'feature: Apps and Links',
  {
    tag: [IntegrationsFeatureTags.APPS_LINKS, IntegrationsSuiteTags.GAMMA],
  },
  () => {
    let appsLinks: AppsLinksPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      appsLinks = new AppsLinksPage(appManagerFixture.page);
      await appsLinks.navigateTo(PAGE_ENDPOINTS.APPS_LINKS);
    });

    test(
      'add Apps & Links and mark them as favorite',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async () => {
        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON);

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
        await appsLinks.clickOnAppsIntegrationDropdown(APPS_LINKS.NONE);
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
      async () => {
        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON);

        //Add links
        await appsLinks.addLinks(formattedLinks);
        await appsLinks.verifyToastMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.verifyApps(APPS_LINKS.GOOGLE_DRIVE);
        await appsLinks.verifyApps(APPS_LINKS.MICROSOFT_365);
        await appsLinks.verifyURL(APPS_LINKS.APPS_CAPS_OFF, APPS_LINKS.GOOGLE_DRIVE, APPS_LINKS.GOOGLE_DRIVE_LINK);
        await appsLinks.verifyURL(APPS_LINKS.APPS_CAPS_OFF, APPS_LINKS.MICROSOFT_365, APPS_LINKS.MICROSOFT_LINK);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.LINKS_TEXT);
        await appsLinks.verifyOrgLinks(APPS_LINKS.GOOGLE);
        await appsLinks.verifyOrgLinks(APPS_LINKS.YOUTUBE);
        await appsLinks.verifyOrgLinks(APPS_LINKS.AMAZON);
        await appsLinks.verifyOrgLinks(APPS_LINKS.FLIPKART);
        await appsLinks.verifyOrgLinks(APPS_LINKS.SIMMPLR);
        await appsLinks.verifyURL(APPS_LINKS.LINKS_CAPS_OFF, APPS_LINKS.GOOGLE, APPS_LINKS.GOOGLE_LINK);
        await appsLinks.verifyURL(APPS_LINKS.LINKS_CAPS_OFF, APPS_LINKS.YOUTUBE, APPS_LINKS.YOUTUBE_LINK);
        await appsLinks.verifyURL(APPS_LINKS.LINKS_CAPS_OFF, APPS_LINKS.AMAZON, APPS_LINKS.AMAZON_LINK);
        await appsLinks.verifyURL(APPS_LINKS.LINKS_CAPS_OFF, APPS_LINKS.FLIPKART, APPS_LINKS.FLIPKART_LINK);
        await appsLinks.verifyURL(APPS_LINKS.LINKS_CAPS_OFF, APPS_LINKS.SIMMPLR, APPS_LINKS.SIMPPLR_LINK);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.clickOnAppsIntegrationDropdown(APPS_LINKS.NONE);
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
      async () => {
        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON);

        //Add links
        await appsLinks.addLinks(formattedLinks);
        //CheckBox Unchecked
        await appsLinks.customLinkCheckBox(APPS_LINKS.FALSE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.verifySubTabsInsideLinksVisibility(
          APPS_LINKS.LINKS_TEXT,
          APPS_LINKS.CUSTOM_LINKS,
          APPS_LINKS.FALSE
        );

        //CheckBox Checked
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.customLinkCheckBox(APPS_LINKS.TRUE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.verifySubTabsInsideLinksVisibility(
          APPS_LINKS.LINKS_TEXT,
          APPS_LINKS.CUSTOM_LINKS,
          APPS_LINKS.TRUE
        );
        await appsLinks.clickOnSubButtonsInsideLinksTab(APPS_LINKS.CUSTOM_LINKS);
        await appsLinks.addAndVerifyCustomLinks(APPS_LINKS.YOUTUBE, APPS_LINKS.YOUTUBE_LINK);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.markLinksFavorite(APPS_LINKS.YOUTUBE);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.FAVORITES);
        await appsLinks.clickOnSubButtonsInsideFavorite(APPS_LINKS.LINKS_TEXT);
        await appsLinks.verifyLinksAreMarkedAsFavorite(APPS_LINKS.YOUTUBE);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.LINKS_TEXT);
        await appsLinks.clickOnSubButtonsInsideLinksTab(APPS_LINKS.CUSTOM_LINKS);
        await appsLinks.deleteCustomLink(APPS_LINKS.YOUTUBE);
        await appsLinks.clickOnAppsIntegrationDropdown(APPS_LINKS.NONE);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
      }
    );

    test(
      'verify a user cannot save duplicate apps or links',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async () => {
        //Add Apps: custom JSON
        await appsLinks.clickOnAppsIntegrationDropdown('Custom JSON');
        await appsLinks.addDuplicateCustomApps();
        await appsLinks.verifyToastMessageIsVisibleWithText(MESSAGES.APPS_DUPLICATE_MESSAGE);

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
      async () => {
        //Add Apps: custom JSON
        await appsLinks.addAppsFromCustomJson(APPS_LINKS.CUSTOM_JSON);

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
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.appsLinksLaunchpadButtons(APPS_LINKS.FAVORITES);
        await appsLinks.verifyZeroStateMessageOfFavoritesTab(MESSAGES.NO_FAVORITES_APP, MESSAGES.SAVE_APPS_FAVORITE);
        await appsLinks.clickOnSubButtonsInsideFavorite(APPS_LINKS.LINKS_TEXT);
        await appsLinks.verifyZeroStateMessageOfFavoritesTab(MESSAGES.NO_FAVORITES_LINK, MESSAGES.SAVE_LINKS_FAVORITE);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.clickOnAppsIntegrationDropdown(APPS_LINKS.NONE);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
      }
    );

    test(
      'verify add button, edit button, sort by button, search box and count on custom links tab',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async () => {
        await appsLinks.addLinks(formattedLinks);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.clickOnSubButtonsInsideLinksTab(APPS_LINKS.CUSTOM_LINKS);
        await appsLinks.addAndVerifyCustomLinks(APPS_LINKS.YOUTUBE, APPS_LINKS.YOUTUBE_LINK);
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.verifyButtonInsideCustomLinks('Add links');
        await appsLinks.verifyButtonInsideCustomLinks('Edit links');
        await appsLinks.verifyButtonInsideCustomLinks('Sort by');
        await appsLinks.verifySearchBoxVisibilityAndCountInsideLaunchpad();
        await appsLinks.deleteCustomLink(APPS_LINKS.YOUTUBE);

        //RollBack
        await appsLinks.clickOnHomePageHeader(APPS_LINKS.APPS_LINKS);
        await appsLinks.cancelAllLinksPresent();
        await appsLinks.clickOnSaveButton();
      }
    );

    test(
      'verify when there are no apps and links added then the launchpad should not be visible',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestPriority.P1],
      },
      async () => {
        await appsLinks.customLinkCheckBox(APPS_LINKS.FALSE);
        await appsLinks.verifyThePageIsLoaded();
        await appsLinks.verifyHomePageHeaderNonVisibility(APPS_LINKS.APPS_LINKS);
        await appsLinks.customLinkCheckBox(APPS_LINKS.TRUE);
      }
    );
  }
);
