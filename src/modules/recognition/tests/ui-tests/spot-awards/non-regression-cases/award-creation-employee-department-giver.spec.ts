import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awards Creation Filter - Employees in a Department Giver', () => {
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
      testId: 'RC-4767',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a department for Specific period unlimited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4768',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to People with the same manager as the award giver for Indefinitely unlimited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4769 RC-4771',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to People with the same manager as the award giver for Indefinitely limited times',
      giverType: 'Employees in a department',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4770',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to People with the same manager as the award giver for Specific period limited times',
      giverType: 'Employees in a department',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4759',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to All employees for Specific period limited times',
      giverType: 'Employees in a department',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4760',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a location for Indefinitely unlimited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4761',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a location for Indefinitely limited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4762',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a location during specific period unlimited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4763',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a location for Specific period limited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4764',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a department for Indefinitely unlimited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4765',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a department for Indefinitely limited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4766',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to Employees in a department for Specific period limited times',
      giverType: 'Employees in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4755',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to All employees for Indefinitely unlimited times',
      giverType: 'Employees in a department',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4756',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to All employees for Indefinitely limited times',
      giverType: 'Employees in a department',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4757',
      testTitle:
        'Validate creation of Spot award when Employees in a department selected to give award to All employees during specific period unlimited times',
      giverType: 'Employees in a department',
      receiverType: 'All employees',
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
