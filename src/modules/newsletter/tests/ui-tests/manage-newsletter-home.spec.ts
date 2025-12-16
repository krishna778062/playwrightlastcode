import { DateSelection } from '@newsletter/components/datePicker.component';
import { NewsletterFiltersComponent } from '@newsletter/components/newsletterFilters.component';
import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { NewsletterActivityTabPage } from '@newsletter/pages/NewsletterActivityTab.page';
import { NewsletterHomePagePage } from '@newsletter/pages/NewsletterHomePage.page';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

test.describe('newsletter Home page', { tag: [NEWSLETTER_SUITE_TAGS.NEWSLETTER] }, () => {
  test(
    'validate the Manage Newslettter page UI',
    {
      tag: [
        NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Newsletter Home page',
        zephyrTestId: 'RC-3014',
        storyId: 'RC-3014',
      });
      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
      await newsletterHomePage.validateHeaders();
    }
  );

  test(
    'validate Newsletter Home page',
    {
      tag: [
        NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Newsletter Home page',
        zephyrTestId: 'RC-3014',
        storyId: 'RC-3014',
      });
      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
      const newsletterName = `Test_Newsletter_${Date.now()}`;
      await newsletterHomePage.createNewsletter(newsletterName);
    }
  );

  test(
    'verify newsletter results list respects Activity tab date filter',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Activity tab date filter validation',
        zephyrTestId: 'RC-3016',
        storyId: 'RC-3016',
      });
      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');

      const activityTabPage = new NewsletterActivityTabPage(appManagerPage);
      await activityTabPage.openActivityTab();

      const fromDate: DateSelection = { month: 'Aug', day: '10', year: '2024' };
      const toDate: DateSelection = { month: 'Nov', day: '12', year: '2024' };
      await activityTabPage.applyActivityDateFilter(fromDate, toDate);

      const dateRange = `${fromDate.month} ${fromDate.day}, ${fromDate.year}`;
      await activityTabPage.assertNewsletterBasedOnTheFilter(dateRange);
    }
  );

  test(
    'verify newsletter results list respects Activity tab period filter',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Activity tab period filter validation',
        zephyrTestId: 'RC-3016',
        storyId: 'RC-3016',
      });

      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');

      const activityTabPage = new NewsletterActivityTabPage(appManagerPage);
      await activityTabPage.openActivityTab();

      // NEW UI — open the Period dropdown
      await activityTabPage.openPeriodFilter();

      // NEW UI — select the period option (example: "Last 30 days")
      await activityTabPage.selectPeriod('Last 30 days');

      // NEW UI — apply the selection
      await activityTabPage.applyPeriod();

      // Assertion based on selected period
      await activityTabPage.assertNewsletterBasedOnPeriod('Last 30 days');
    }
  );

  test(
    'verify newsletter filters can be reset from Filters panel',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Reset newsletter filters via Filters menu',
        zephyrTestId: 'RC-3017',
        storyId: 'RC-3017',
      });

      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');

      const filtersComponent = new NewsletterFiltersComponent(appManagerPage);
      await filtersComponent.openFiltersPanel();
      const initialFilterState = await filtersComponent.captureCurrentState();

      const currentUserName = await newsletterHomePage.getCurrentLoggedInUserName('Determine creator filter option');
      const selectedCreatorLabel = await filtersComponent.selectCreator(currentUserName);
      const selectedStatusValue = await filtersComponent.selectStatus('Draft');
      const selectedRecipientsValue = await filtersComponent.selectRecipients('All org');
      const selectedDateValue = await filtersComponent.selectDateModified('Last 24 hours');

      const updatedFilterState = await filtersComponent.captureCurrentState();
      expect(updatedFilterState.creatorText).toContain(selectedCreatorLabel);
      expect(updatedFilterState.statusValue).toBe(selectedStatusValue);
      expect(updatedFilterState.recipientsValue).toBe(selectedRecipientsValue);
      expect(updatedFilterState.dateModifiedValue).toBe(selectedDateValue);

      await filtersComponent.resetFilters();
      await filtersComponent.expectStateToMatch(initialFilterState);
    }
  );

  test(
    'apply custom modified date range filter on newsletters list',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Set custom modified date range filter',
        zephyrTestId: 'RC-3018',
        storyId: 'RC-3018',
      });

      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');

      const filtersComponent = new NewsletterFiltersComponent(appManagerPage);
      await filtersComponent.openFiltersPanel();
      await filtersComponent.selectDateModified('Custom');

      const endDate = new Date();
      const customEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), 15);
      const customStartDate = new Date(customEndDate.getFullYear(), customEndDate.getMonth() - 1, 15);

      const fromDate: DateSelection = {
        month: customStartDate.toLocaleString('en-US', { month: 'short' }),
        day: `${customStartDate.getDate()}`,
        year: `${customStartDate.getFullYear()}`,
      };
      const toDate: DateSelection = {
        month: customEndDate.toLocaleString('en-US', { month: 'short' }),
        day: `${customEndDate.getDate()}`,
        year: `${customEndDate.getFullYear()}`,
      };

      await filtersComponent.selectCustomDateRange(fromDate, toDate);

      const { from: fromLabel, to: toLabel } = await filtersComponent.getCustomDateRangeLabels();

      const expectedFromLabel = customStartDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const expectedToLabel = customEndDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      expect(fromLabel).toContain(expectedFromLabel);
      expect(toLabel).toContain(expectedToLabel);
    }
  );

  test(
    'display name and email are shown in From address filter options',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate sender details visibility in From address filter',
        zephyrTestId: 'RC-3019',
        storyId: 'RC-3019',
      });

      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');

      const filtersComponent = new NewsletterFiltersComponent(appManagerPage);
      await filtersComponent.openFiltersPanel();
      await filtersComponent.verifyFromAddressFilterIsVisible();

      const senderEmail = process.env['NEWSLETTER_SENDER_EMAIL'] ?? getEnvConfig().appManagerEmail;
      await filtersComponent.assertDisplayNameAndEmailVisible(senderEmail);
    }
  );

  test(
    'verify From address column is present in newsletters table',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate From address column visibility in newsletter table',
        zephyrTestId: 'RC-3020',
        storyId: 'RC-3020',
      });

      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
      await newsletterHomePage.assertFromAddressColumnVisible();
    }
  );

  test(
    'verify Resend option only available for Failed to send newsletters',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Resend option visibility for Failed to send newsletters',
        zephyrTestId: 'RC-3021',
        storyId: 'RC-3021',
      });

      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
      await newsletterHomePage.clearSearchInput();

      const filtersComponent = new NewsletterFiltersComponent(appManagerPage);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify past newsletters can be viewed via filters',
        zephyrTestId: 'RC-3022',
        storyId: 'RC-3022',
      });

      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
      await newsletterHomePage.clearSearchInput();

      const filtersComponent = new NewsletterFiltersComponent(appManagerPage);
      await filtersComponent.openFiltersPanel();
      await filtersComponent.selectStatus('Failed to send');
      //await filtersComponent.selectRecipients('All org');
      await filtersComponent.assertStatusOptionExists('Failed to send');

      await newsletterHomePage.assertTableHasResults();
    }
  );
});
