import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';
import { RecognitionHubPage } from '@recognition/ui/pages/recognitionHubPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { MESSAGES } from '@/src/modules/recognition/constants/messages';
import { GiveRecognitionDialogBox } from '@/src/modules/recognition/ui/components/recognition/give-recognition-dialog-box';

test.describe('Recognition Page Flow', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const recognitionHubPage = new RecognitionHubPage(appManagerPage);
    await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
  });

  test(
    '[RC-5000] Verify recognize button when user fill the mandate fields while giving spot award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5000',
        storyId: 'RC-4336',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const awardName = `Auto_QA Spot Award ${faker.string.alphanumeric(8)}`;
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'manage',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.spotAwardTab.click();
      await spotAwardPage.clickNewSpotAwardButton(manageRecognitionPage);
      await spotAwardPage.createSimpleSpotAward(awardName, awardName);
      await spotAwardPage.verifyToastMessage(MESSAGES.NEW_AWARD_CREATED);
      await spotAwardPage.waitForToastToHide();
      await spotAwardPage.page.reload();

      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.fillFormAndValidateRecognizeButton(giveRecognitionDialogBox, awardName);
      await recognitionHubPage.removeOptionalFieldAndValidateRecognizeButton(giveRecognitionDialogBox);
      await recognitionHubPage.removeMandatoryFieldAndValidateRecognizeButton(giveRecognitionDialogBox);
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'manage',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.spotAwardTab.click();
      await spotAwardPage.verifyAwardInTableAndDelete(awardName);
    }
  );

  test(
    '[RC-4345] Validate promotion tile for spot award in the recognition hub when there is active spot awards for user',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4345',
        storyId: 'RC-4336',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);

      await recognitionHubPage.verifySpotAwardPromotionTile();
    }
  );

  test(
    '[RC-4428] Validate forms opening on selecting tab button on give recognition window',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4428',
        storyId: 'RC-4336',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.clickGiveRecognitionAndValidate(giveRecognitionDialogBox);
      await recognitionHubPage.selectSpotAwardTabAndValidate(giveRecognitionDialogBox);
    }
  );

  test(
    '[RC-4462] Verify spot awards for single recipient',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4462',
        storyId: 'RC-4336',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const awardName = `Auto_QA Spot Award ${faker.string.alphanumeric(8)}`;
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'manage',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.spotAwardTab.click();
      await spotAwardPage.clickNewSpotAwardButton(manageRecognitionPage);
      await spotAwardPage.createSimpleSpotAward(awardName, awardName);
      await spotAwardPage.verifyToastMessage(MESSAGES.NEW_AWARD_CREATED);
      await spotAwardPage.waitForToastToHide();
      await spotAwardPage.page.reload();

      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.verifySpotAwardsForSingleRecipient(giveRecognitionDialogBox, awardName);
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'manage',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.spotAwardTab.click();
      await spotAwardPage.verifyAwardInTableAndDelete(awardName);
    }
  );
});
