import { NewsletterFiltersComponent } from '@newsletter/components/newsletterFilters.component';
import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { NewsletterHomePagePage } from '@newsletter/pages/NewsletterHomePage.page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('newsletter Home page', { tag: [NEWSLETTER_SUITE_TAGS.NEWSLETTER] }, () => {
  let newsletterHomePage: NewsletterHomePagePage;

  test.beforeEach(async ({ appManagerPage }) => {
    newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
    await newsletterHomePage.loadPage();
    await newsletterHomePage.verifyThePageIsLoaded();
    await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
  });

  test(
    'validate the Manage Newsletter page UI',
    {
      tag: [
        NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SMOKE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Newsletter Home page',
      });

      await newsletterHomePage.assertPageTitleIsVisible();
    }
  );

  test(
    'verify newsletter filters can be reset from Filters panel',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Reset newsletter filters via Filters menu',
      });

      const filtersComponent = new NewsletterFiltersComponent(newsletterHomePage.page);
      await filtersComponent.openFiltersPanel();
      const initialFilterState = await filtersComponent.captureCurrentState();

      const currentUserName = await newsletterHomePage.getCurrentLoggedInUserName();
      const selectedCreatorLabel = await filtersComponent.selectCreator(currentUserName);
      const selectedStatusValue = await filtersComponent.selectStatus('Draft');
      const selectedRecipientsValue = await filtersComponent.selectRecipients('All org');
      const selectedDateValue = await filtersComponent.selectDateModified('Last 24 hours');

      await filtersComponent.verifyFilterSelections({
        creatorLabel: selectedCreatorLabel,
        statusValue: selectedStatusValue,
        recipientsValue: selectedRecipientsValue,
        dateModifiedValue: selectedDateValue,
      });

      await filtersComponent.resetFilters();
      await filtersComponent.expectStateToMatch(initialFilterState);
    }
  );

  test(
    'display name and email are shown in From address filter options',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Validate sender details visibility in From address filter',
      });

      const filtersComponent = new NewsletterFiltersComponent(newsletterHomePage.page);
      await filtersComponent.openFiltersPanel();
      await filtersComponent.verifyFromAddressFilterIsVisible();
    }
  );

  test(
    'verify From address column is present in newsletters table',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Validate From address column visibility in newsletter table',
      });

      await newsletterHomePage.assertFromAddressColumnVisible();
    }
  );

  test(
    'verify Resend option only available for Failed to send newsletters',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Validate Resend option visibility for Failed to send newsletters',
      });

      const filtersComponent = new NewsletterFiltersComponent(newsletterHomePage.page);
      await filtersComponent.openFiltersPanel();
      await filtersComponent.selectStatus('Failed to send');
      await filtersComponent.selectRecipients('All org');
      await filtersComponent.assertStatusOptionExists('Failed to send');
    }
  );

  test(
    'access newsletters should show past newsletters filtered by status',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P2, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify past newsletters can be viewed via filters',
      });

      const filtersComponent = new NewsletterFiltersComponent(newsletterHomePage.page);
      await filtersComponent.openFiltersPanel();
      await filtersComponent.selectStatus('Failed to send');
      await filtersComponent.assertStatusOptionExists('Failed to send');

      await newsletterHomePage.assertTableHasResults();
    }
  );
});
