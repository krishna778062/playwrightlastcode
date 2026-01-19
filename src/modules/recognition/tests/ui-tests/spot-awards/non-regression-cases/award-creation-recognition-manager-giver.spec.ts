import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awards Creation Filter - Recognition manager Giver', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
      'manage',
      PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
    );
    await manageRecognitionPage.spotAwardTab.click();
    await manageRecognitionPage.subTabIndicator.getButton('New spot award', 'link').click();
  });

  [
    {
      testId: 'RC-4839',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Managers in a department for Specific period limited times',
      giverType: 'Recognition managers',
      receiverType: 'Managers in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4838',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Managers in a location for Specific period limited times',
      giverType: 'Recognition managers',
      receiverType: 'Managers in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4837',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to All managers for Specific period limited times',
      giverType: 'Recognition managers',
      receiverType: 'All managers',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4836',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Employees in a department for Specific period limited times',
      giverType: 'Recognition managers',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4835',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Employees in a location for Specific period limited times',
      giverType: 'Recognition managers',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4834',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to All employees for Specific period limited times',
      giverType: 'Recognition managers',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4833',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Managers in a department during specific period unlimited times',
      giverType: 'Recognition managers',
      receiverType: 'Managers in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4832',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Managers in a location during specific period unlimited times',
      giverType: 'Recognition managers',
      receiverType: 'Managers in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4831',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to All managers during specific period unlimited times',
      giverType: 'Recognition managers',
      receiverType: 'All managers',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4830',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Employees in a department during specific period unlimited times',
      giverType: 'Recognition managers',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4829',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Employees in a location during specific period unlimited times',
      giverType: 'Recognition managers',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4828',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to All employees during specific period unlimited times',
      giverType: 'Recognition managers',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4813',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Managers in a department for Indefinitely limited times',
      giverType: 'Recognition managers',
      receiverType: 'Managers in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
  ].forEach(({ testId, testTitle, giverType, receiverType, selectAwardPeriodValue, selectHowOftenAwardGivenValue }) => {
    test(
      `[${testId}] ${testTitle}`,
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
          zephyrTestId: testId,
        });
        const { page: appManagerPage } = appManagerFixture;
        const spotAwardPage = new SpotAwardPage(appManagerPage);
        const awardName = `Auto_QA Spot Award ${faker.string.alphanumeric(8)}`;

        await spotAwardPage.verifyNewSpotAwardPageElements();
        await spotAwardPage.fillCompleteSpotAwardFormAndCreate(
          awardName,
          awardName,
          2,
          giverType,
          receiverType,
          undefined, // Location will be selected from dropdown when receiverType includes 'location'
          selectAwardPeriodValue as 'Indefinitely' | 'During a specified period',
          selectHowOftenAwardGivenValue as 'Unlimited' | 'Limited'
        );
        await spotAwardPage.verifyAwardInTableAndDelete(awardName);
      }
    );
  });
});
