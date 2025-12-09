import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { TestSuite } from '@/src/core/constants/testSuite';
import { PeopleDirectoryPage } from '@/src/modules/platforms/ui/pages/people/peopleDirectoryPage';

test.describe(
  'people Directory Testcases',
  {
    tag: [TestSuite.PEOPLE_DIRECTORY],
  },
  () => {
    test(
      'verify the presence of filter under filters field of people directory for custom user',
      {
        tag: [TestPriority.P1, `@PEOPLE_DIRECTORY`, `@people-directory`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-17684'],
        });
        const peopleDirectoryPage = new PeopleDirectoryPage(appManagerFixture.page);
        await peopleDirectoryPage.loadPage();
        await peopleDirectoryPage.verifyThePageIsLoaded();
        await peopleDirectoryPage.navigatePeopleDirectory();
        await peopleDirectoryPage.validateFilters();
      }
    );
  }
);
