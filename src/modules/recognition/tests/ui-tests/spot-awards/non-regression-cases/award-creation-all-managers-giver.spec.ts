import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

// eslint-disable-next-line playwright/no-focused-test
test.describe.only('Awards Creation Filter - All Managers Giver', () => {
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
      testId: 'RC-4559',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Employees in a department During specific period limited times',
      giverType: 'All managers',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4551',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Employees in a location for Indefinitely limited times',
      giverType: 'All managers',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4552',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Employees in a location for Indefinitely unlimited times',
      giverType: 'All managers',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4554',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Employees in a location for Indefinitely unlimited times',
      giverType: 'All managers',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4556',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Employees in a department for Indefinitely limited times',
      giverType: 'All managers',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4557',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Employees in a Department for Indefinitely unlimited times',
      giverType: 'All managers',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4560',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Award giver’s direct reports for Indefinitely limited times',
      giverType: 'All managers',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4562',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Award giver’s direct reports During specific period unlimited times',
      giverType: 'All managers',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4566',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Award giver’s full ladder reports During specific period for limited times',
      giverType: 'All managers',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4567',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award to Award giver’s full ladder reports During specific period unlimited times',
      giverType: 'All managers',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
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
          receiverType.includes('location') ? 'India' : undefined,
          selectAwardPeriodValue as 'Indefinitely' | 'During a specified period',
          selectHowOftenAwardGivenValue as 'Unlimited' | 'Limited'
        );
        await spotAwardPage.verifyAwardInTableAndDelete(awardName);
      }
    );
  });
});
