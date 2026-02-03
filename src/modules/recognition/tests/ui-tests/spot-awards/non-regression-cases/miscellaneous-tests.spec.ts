import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';
import { GiveRecognitionDialogBox } from '@recognition-components/give-recognition-dialog-box';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Spot Awards Miscellaneous Tests', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
      'manage',
      PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
    );
    await manageRecognitionPage.spotAwardTab.click();
  });

  const companyValue = 'Creativity';

  test(
    '[RC-5367] Validate API error message when changing any Spot Award name to any existing name in the Manage Spot award page',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5367',
        storyId: 'RC-5290',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const awardName = `Auto_QA Spot Award ${faker.string.alphanumeric(8)}`;

      await spotAwardPage.createAwardAndVerifyDuplicateErrorFlow(manageRecognitionPage, awardName);
    }
  );

  test(
    '[RC-5452] Validate company values clearance when user change award name or clear the award name field',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5452',
        storyId: 'RC-4336',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
      const awardName = `Auto_QA SpotAwardWithCompValue ${faker.string.alphanumeric(8)}`;

      await spotAwardPage.createAwardWithCompanyValueAndVerifyFlow(
        manageRecognitionPage,
        giveRecognitionDialogBox,
        awardName,
        companyValue
      );
    }
  );

  test(
    '[RC-5193 RC-5192] Validate changes when spot award is disable',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.SANITY,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5193,RC-5192',
        storyId: 'RC-5172',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
      const awardName = `Auto_QA SpotDisableAward ${faker.string.alphanumeric(8)}`;

      await spotAwardPage.createAwardWithLimitedTimesAndVerifyDisabledFlow(
        manageRecognitionPage,
        giveRecognitionDialogBox,
        awardName
      );
    }
  );

  test(
    '[RC-5200] Validate share window post publishing spot award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.SANITY,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5200',
        storyId: 'RC-4336',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
      const awardName = `Auto_QA ShareSpotAward ${faker.string.alphanumeric(8)}`;

      await spotAwardPage.createAwardPublishShareAndCleanupFlow(
        manageRecognitionPage,
        giveRecognitionDialogBox,
        awardName
      );
    }
  );

  test(
    '[RC-5396] Validate pagination for Spot award listing',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5396',
        storyId: 'RC-5294',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);

      await spotAwardPage.navigateToRecognitionHubAndVerifyPagination(giveRecognitionDialogBox);
    }
  );
});
