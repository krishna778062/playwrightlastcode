import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudiencePage } from '@platforms/pages/abacPage/acgPage/audiencePage';

import { TestSuite } from '@/src/core/constants/testSuite';

test.describe(
  'Audience Testcases',
  {
    tag: [TestSuite.AUDIENCE],
  },
  () => {
    test(
      'Create category modal: validations and basic actions',
      { tag: [TestPriority.P0] },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: [
            'PS-35395',
            'PS-35396',
            'PS-35397',
            'PS-35398',
            'PS-35399',
            'PS-35400',
            'PS-35401',
            'PS-35403',
            'PS-35404',
            'PS-35406',
          ],
        });
        const audiencePage = new AudiencePage(appManagerPage);
        await audiencePage.loadPage();
        await audiencePage.openCreateCategoryModal();
        await audiencePage.verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial();
        await audiencePage.verifyNameFieldMaxLength();
        await audiencePage.verifyDescriptionFieldMaxLength();
        await audiencePage.clickAddDescriptionAndVerify();
        await audiencePage.removeDescriptionAndVerifyAbsence();
        await audiencePage.clickOnCloseButton();
      }
    );
  }
);
