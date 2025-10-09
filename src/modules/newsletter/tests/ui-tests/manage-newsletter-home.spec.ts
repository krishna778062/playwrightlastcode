import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { NewsletterHomePagePage } from '@newsletter/pages/NewsletterHomePage.page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Newsletter Home page', { tag: [NEWSLETTER_SUITE_TAGS.NEWSLETTER] }, () => {
  test.only(
    'Validate Newsletter Home page',
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
      await newsletterHomePage.createNewsletter('Test Newsletter');
      //await newsletterHomePage.page.pause();
    }
  );
});
