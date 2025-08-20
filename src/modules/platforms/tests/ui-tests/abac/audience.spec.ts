import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AUDIENCE_PAGE } from '@platforms/pages/abacPage/acgPage/audiencePage';

import { TestSuite } from '@/src/core/constants/testSuite';

test.describe(
  'Audience Testcases',
  {
    tag: [TestSuite.AUDIENCE],
  },
  () => {
    test(
      'Verify audience create category flow with all possible cases',
      { tag: [TestPriority.P0] },
      async ({ appManagerPage }) => {
        tagTest(test.info(), { zephyrTestId: ['PS-35395', 'PS-35396'] });
        const audiencePage = new AUDIENCE_PAGE(appManagerPage);
        await audiencePage.loadPage();
        await audiencePage.openCreateCategoryModal();
        await audiencePage.clickOnCloseButton();
      }
    );
  }
);
