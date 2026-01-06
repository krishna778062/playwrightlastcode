import { NewsletterFiltersComponent } from '@newsletter/components/newsletterFilters.component';
import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
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
      });
      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
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
      });
      const newsletterHomePage = new NewsletterHomePagePage(appManagerPage);
      await newsletterHomePage.loadPage();
      await newsletterHomePage.verifyThePageIsLoaded();
      await newsletterHomePage.verifier.waitUntilPageHasNavigatedTo('/employee-newsletter');
      //const newsletterName = `Test_Newsletter_${Date.now()}`;
      //await newsletterHomePage.createNewsletter(newsletterName);
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
    'display name and email are shown in From address filter options',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate sender details visibility in From address filter',
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
