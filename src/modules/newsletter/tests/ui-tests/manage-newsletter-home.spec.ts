import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { NewsletterHomePagePage } from '@newsletter/pages/NewsletterHomePage.page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';

test.describe('Newsletter Home page', () => {
  test.only(
    'Validate Newsletter Home page',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, REWARD_FEATURE_TAGS.ENABLE_REWARD, TestPriority.P0, TestGroupType.SMOKE],
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
      await newsletterHomePage.page.pause();
    }
  );
});
