import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awards Creation Filter - Manager in a location Giver', () => {
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
      testId: 'RC-4728',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a location for Indefinitely unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4732',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a location for Indefinitely limited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4733',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a location during specific period unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4734',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a location during specific period limited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4735',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a department for Indefinitely unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4723',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to All employees for Indefinitely unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4726',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to All employees for Indefinitely unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4727',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to All employees during specific period limited times',
      giverType: 'Managers in a location',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4736',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a department for Indefinitely limited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4740',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a department during specific period unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4741',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Employees in a department for Specific period limited times',
      giverType: 'Managers in a location',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4747',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Award giver’s direct reports for Indefinitely unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4748',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Award giver’s direct reports for Indefinitely limited times',
      giverType: 'Managers in a location',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4749',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Award giver’s direct reports during specific period unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4751',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Award giver’s full ladder reports for Indefinitely unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4752',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Award giver’s full ladder reports  for Indefinitely limited times',
      giverType: 'Managers in a location',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4753',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Award giver’s full ladder reports during specific period unlimited times',
      giverType: 'Managers in a location',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4754',
      testTitle:
        'Validate creation of Spot award when Managers in a location selected to give award to Award giver’s full ladder reports for Specific period limited times',
      giverType: 'Managers in a location',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'During a specified period',
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
