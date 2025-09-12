import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { PeopleDirectoryPage } from '@platforms/pages/people/peopleDirectoryPage';

import { TestSuite } from '@/src/core/constants/testSuite';

test.describe(
  'People Directory Testcases',
  {
    tag: [TestSuite.PEOPLE_DIRECTORY],
  },
  () => {
    test(
      'Verify the presence of filter under filters field of people directory for custom user',
      {
        tag: [TestPriority.P0],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-17684'],
        });
        const peopleDirectoryPage = new PeopleDirectoryPage(appManagerPage);
        await peopleDirectoryPage.verifyThePageIsLoaded();
        await peopleDirectoryPage.navigatePeopleDirectory();
        await peopleDirectoryPage.validateFilters();
      }
    );
  }
);
