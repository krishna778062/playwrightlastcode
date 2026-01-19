import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awards Creation Filter - Employee in a location Giver', () => {
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
      testId: 'RC-4568',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to All employees  for Indefinitely Unlimited times',
      giverType: 'Employees in a location',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4569',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to All employees for Indefinitely limited times',
      giverType: 'Employees in a location',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4703',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to All employees for Specific period limited times',
      giverType: 'Employees in a location',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4701',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to All employees During specific period unlimited times',
      giverType: 'Employees in a location',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4707',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to Employees in a department for Indefinitely unlimited times',
      giverType: 'Employees in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4708',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to Employees in a location for Indefinitely limited times',
      giverType: 'Employees in a location',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4710',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to Employees in a location during specific period unlimited times',
      giverType: 'Employees in a location',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4711',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to Employees in a location for Specific period limited times',
      giverType: 'Employees in a location',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4713',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to Employees in a department for Indefinitely limited times',
      giverType: 'Employees in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4774',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to People with the same manager as the award giver for Indefinitely unlimited times',
      giverType: 'Employees in a location',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4775',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to People with the same manager as the award giver for Indefinitely limited times',
      giverType: 'Employees in a location',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4776',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to People with the same manager as the award giver for Indefinitely limited times',
      giverType: 'Employees in a location',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4714',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to Employees in a department during specific period unlimited times',
      giverType: 'Employees in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4715',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to Employees in a department for Specific period limited times',
      giverType: 'Employees in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4777',
      testTitle:
        'Validate creation of Spot award when Employees in a location selected to give award to People with the same manager as the award giver for Specific period unlimited times',
      giverType: 'Employees in a location',
      receiverType: 'People with the same manager as the award giver',
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
          undefined, // Location will be selected from dropdown when receiverType includes 'location'
          selectAwardPeriodValue as 'Indefinitely' | 'During a specified period',
          selectHowOftenAwardGivenValue as 'Unlimited' | 'Limited'
        );
        await spotAwardPage.verifyAwardInTableAndDelete(awardName);
      }
    );
  });
});
