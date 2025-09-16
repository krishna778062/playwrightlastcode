import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  '@AddContent - Add Content Tests',
  {
    tag: [ContentTestSuite.SITE_APP_MANAGER],
  },
  () => {
    test.beforeEach('Setup test environment', async ({ appManagerHomePage }) => {
      // Navigate to home page
      await appManagerHomePage.verifyThePageIsLoaded();
    });

    test(
      'Verify the App Manager is able to add content from home dashboard on any unlisted site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-30521'],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify Unlisted site manager Add content scenarios',
          zephyrTestId: 'CONT-30521',
          storyId: 'CONT-30521',
        });
      }
    );
  }
);
