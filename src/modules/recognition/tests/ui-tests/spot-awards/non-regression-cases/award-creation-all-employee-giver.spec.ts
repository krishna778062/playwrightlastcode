import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awards Creation Filter - All Employee Giver', () => {
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
      testId: 'RC-4352',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to Employees in a location for Indefinitely Unlimited times',
      giverType: 'All employees',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4353',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to Employees in a location for Indefinitely limited times',
      giverType: 'All employees',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4355',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to Employees in a location for Specific period unlimited times',
      giverType: 'All employees',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4434',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to All employees During specific period Unlimited times',
      giverType: 'All employees',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4454',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to Employees in a department for Indefinitely Unlimited times',
      giverType: 'All employees',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4455',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to All employees for Indefinitely Limited times',
      giverType: 'All employees',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4456',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to Employees in a department for Indefinitely limited times',
      giverType: 'All employees',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4778',
      testTitle:
        'Validate creation of Spot award when All employees selected to give award to People with the same manager as the award giver for Indefinitely unlimited times',
      giverType: 'All employees',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4779',
      testTitle:
        'Validate creation of Spot award when All Employees selected to give award to People with the same manager as the award giver for Indefinitely limited times',
      giverType: 'All employees',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4780',
      testTitle:
        'Validate creation of Spot award when All Employees selected to give award to People with the same manager as the award giver for Specific period limited times',
      giverType: 'All employees',
      receiverType: 'People with the same manager as the award giver',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4781',
      testTitle:
        'Validate creation of Spot award when All Employees selected to give award to People with the same manager as the award giver for Specific period unlimited times',
      giverType: 'All employees',
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
          receiverType.includes('location') ? 'India' : undefined,
          selectAwardPeriodValue as 'Indefinitely' | 'During a specified period',
          selectHowOftenAwardGivenValue as 'Unlimited' | 'Limited'
        );
        await spotAwardPage.verifyAwardInTableAndDelete(awardName);
      }
    );
  });
});
