import { faker } from '@faker-js/faker';
import { RecognitionSuitTags, spotAwardsFeatureTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Spot award audience filter section', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
      'manage',
      PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
    );
    await manageRecognitionPage.spotAwardTab.click();
    await manageRecognitionPage.subTabIndicator.getThreeDotsButton(0).waitFor({ state: 'visible' });
  });

  test(
    '[RC-5552] Verify Audience option while creating Spot award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        spotAwardsFeatureTags.SPOT_AWARDS_AUDIENCE,
        TestPriority.P0,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5552',
        storyId: 'RC-4925',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const giverType = 'Users in an audience';
      const receiverType = 'All employees';
      const awardName = `Auto_QA Spot Award_audienceFilter ${faker.string.alphanumeric(8)}`;

      await spotAwardPage.clickNewSpotAwardButton(manageRecognitionPage);
      await spotAwardPage.createSpotAwardWithAudienceOption(awardName, awardName, 2, giverType, receiverType);
      await spotAwardPage.verifyCreatedAwardInTable(awardName);
    }
  );

  test(
    '[RC-5553] Verify Audience option while editing Spot award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        spotAwardsFeatureTags.SPOT_AWARDS_AUDIENCE,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5553',
        storyId: 'RC-4925',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const giverType = 'Users in an audience';

      await spotAwardPage.clickEditSpotAwardButton(manageRecognitionPage);
      await spotAwardPage.editSpotAwardAndSelectAudienceOption(giverType);
      await spotAwardPage.deleteSpotAwardAndVerifyToast();
    }
  );
});
