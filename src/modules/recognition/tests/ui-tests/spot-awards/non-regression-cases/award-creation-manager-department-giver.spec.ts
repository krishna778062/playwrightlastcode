import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awards Creation Filter - Manager in a department Giver', () => {
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
      testId: 'RC-4799',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Employees in a department for Specific period limited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4798',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Employees in a location for Specific period limited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4797',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to All employees for Specific period limited times',
      giverType: 'Managers in a department',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4796',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Award giver’s full ladder reports during specific period unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4795',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Award giver’s direct reports during specific period unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4794',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Employees in a department during specific period unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4782',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to All employees for Indefinitely unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4784',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Employee in a department for Indefinitely unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4785',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Award giver’s direct reports for Indefinitely unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4786',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Award giver’s full ladder reports for Indefinitely unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4787',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to All employees for Indefinitely limited times',
      giverType: 'Managers in a department',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4788',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Employees in a location for Indefinitely limited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4789',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Employees in a department for Indefinitely limited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a department',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4790',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Award giver’s direct reports for Indefinitely limited times',
      giverType: 'Managers in a department',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4791',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Award giver’s full ladder reports for Indefinitely limited times',
      giverType: 'Managers in a department',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4793',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to Employees in a location during specific period unlimited times',
      giverType: 'Managers in a department',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
    },
    {
      testId: 'RC-4792',
      testTitle:
        'Validate creation of Spot award when Managers in a department selected to give award to All employees during specific period unlimited times',
      giverType: 'Managers in a department',
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
          undefined, // Location will be selected from dropdown when receiverType includes 'location'
          selectAwardPeriodValue as 'Indefinitely' | 'During a specified period',
          selectHowOftenAwardGivenValue as 'Unlimited' | 'Limited'
        );
        await spotAwardPage.verifyAwardInTableAndDelete(awardName);
      }
    );
  });
});
