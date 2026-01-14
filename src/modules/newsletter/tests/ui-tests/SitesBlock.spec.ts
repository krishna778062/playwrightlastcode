import { SelectTemplateModal } from '@newsletter/components/selectTemplateModal.component';
import { SitesBlockComponent } from '@newsletter/components/sitesBlock.component';
import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { BrowseSitesModal } from '@newsletter/Modals/browseSitesModal';
import { NewsletterEditorPage } from '@newsletter/pages/NewsletterEditorPage.page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

// Test data
const TEMPLATE_NAME = 'Blank template';
const LOCATIONS: [string][] = [['London'], ['San Francisco'], ['Paris']];

test.describe('Newsletter Sites Block - Smart Blocks', { tag: [NEWSLETTER_SUITE_TAGS.NEWSLETTER] }, () => {
  let newsletterEditorPage: NewsletterEditorPage;
  let selectTemplateModal: SelectTemplateModal;
  let sitesBlockComponent: SitesBlockComponent;
  let browseSitesModal: BrowseSitesModal;

  test.beforeEach(async ({ appManagerPage }) => {
    // Initialize components for all tests
    newsletterEditorPage = new NewsletterEditorPage(appManagerPage);
    selectTemplateModal = new SelectTemplateModal(appManagerPage);
    sitesBlockComponent = new SitesBlockComponent(appManagerPage);
    browseSitesModal = new BrowseSitesModal(appManagerPage);

    // Create a newsletter for each test (each test needs a fresh newsletter)
    const newsletterName = `Sites_Block_Test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await newsletterEditorPage.loadPage();
    await newsletterEditorPage.verifyThePageIsLoaded();
    await newsletterEditorPage.clickCreateButton();
    await newsletterEditorPage.enterNewsletterName(newsletterName);
    await newsletterEditorPage.clickNextButtonOnNameModal();
    await selectTemplateModal.selectTemplateByName(TEMPLATE_NAME);
    await selectTemplateModal.clickNextButton();
    await newsletterEditorPage.verifyEditorIsLoaded();
  });

  test(
    'Add Sites to newsletter',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add Sites to newsletter using smart blocks',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      await sitesBlockComponent.clickSitesBlock();
      await sitesBlockComponent.checkCustom();
      await sitesBlockComponent.clickBrowse();
      await sitesBlockComponent.assertSitesModalIsDisplayed();
      await browseSitesModal.filterSitesByOptions('Location');
      await browseSitesModal.selectSiteByName('London');
      await browseSitesModal.selectSiteByName('Paris');
      await browseSitesModal.searchAndSelectSiteByName('San Francisco');

      // Verify all sites are selected
      await browseSitesModal.assertThatAllOptionsAreSelected();

      await browseSitesModal.clickAdd();

      // Verify all locations are displayed in newsletter
      for (const [location] of LOCATIONS) {
        await sitesBlockComponent.assertSelectedLocationOptionsAreDisplayedInNewsletter(location);
      }
    }
  );

  test(
    'Adjust number of sites featured',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Adjust the number of featured sites displayed in newsletter',
        zephyrTestId: 'NL-2',
        storyId: 'NL-2',
      });

      await sitesBlockComponent.clickSitesBlock();

      await sitesBlockComponent.assertFeaturedSitesAreDisplayedInNewsletter();

      // Increase featured sites by 1 (from 5 to 6)
      await sitesBlockComponent.clickPlusButtonOnNumberOfItems();
      await sitesBlockComponent.assertNumberOfItemsValueIsCorrect('6');

      // Confirm six sites are displayed
      await sitesBlockComponent.assertCorrectNumberOfFeaturedSitesAreDisplayedInNewsletter(6);

      // Decrease featured sites by three (from 6 to 3)
      await sitesBlockComponent.clickMinusButtonOnNumberOfItems();
      await sitesBlockComponent.clickMinusButtonOnNumberOfItems();
      await sitesBlockComponent.clickMinusButtonOnNumberOfItems();

      // Confirm three sites are displayed
      await sitesBlockComponent.assertNumberOfItemsValueIsCorrect('3');
      await sitesBlockComponent.assertCorrectNumberOfFeaturedSitesAreDisplayedInNewsletter(3);

      // Type in a number of sites (4)
      await sitesBlockComponent.typeNumberOfItems('4');
      await sitesBlockComponent.assertNumberOfItemsValueIsCorrect('4');
      await sitesBlockComponent.assertCorrectNumberOfFeaturedSitesAreDisplayedInNewsletter(4);
    }
  );

  test(
    'Sites Featured, show as list',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Display featured sites as a list instead of cards',
        zephyrTestId: 'NL-3',
        storyId: 'NL-3',
      });

      await sitesBlockComponent.clickSitesBlock();
      await sitesBlockComponent.assertFeaturedSitesAreDisplayedInNewsletter();
      await sitesBlockComponent.checkList();

      // Assert at least one site is displayed as a list
      await sitesBlockComponent.assertCorrectNumberOfFeaturedSitesAreDisplayedInNewsletterAsList(1);
    }
  );

  test(
    'Sites, Search for sites',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Search for a site and add it to the newsletter',
        zephyrTestId: 'NL-4',
        storyId: 'NL-4',
      });

      await sitesBlockComponent.clickSitesBlock();
      await sitesBlockComponent.checkCustom();
      await sitesBlockComponent.clickBrowse();
      await sitesBlockComponent.assertSitesModalIsDisplayed();
      await browseSitesModal.searchForSiteInSiteModal('Dev Test');
      await browseSitesModal.selectSiteByName('Dev Test');
      await browseSitesModal.clickAdd();

      // Verify the site is displayed in the newsletter
      await sitesBlockComponent.assertSelectedSiteIsDisplayed('Dev Test');
    }
  );
});
