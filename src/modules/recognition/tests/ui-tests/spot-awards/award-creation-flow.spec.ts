import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awards Creation Flow', () => {
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

  test(
    '[RC-5001] Validate to check limit of field text when creating spot award',
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
        zephyrTestId: 'RC-5001',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const awardNameLongText = await spotAwardPage.genarateLongText(101);
      const awardNameLimitedText = await spotAwardPage.genarateLongText(99);
      const descriptionLongText = await spotAwardPage.genarateLongText(501);
      const descriptionLimitedText = await spotAwardPage.genarateLongText(499);
      const guidanceLongText = await spotAwardPage.genarateLongText(1501);
      const guidanceLimitedText = await spotAwardPage.genarateLongText(1499);
      await spotAwardPage.validateAwardNameFieldCharacterLimit(awardNameLongText, awardNameLimitedText);

      await spotAwardPage.validateAwardDescriptionFieldCharacterLimit(descriptionLongText, descriptionLimitedText);

      await spotAwardPage.validateAwardGuidanceFieldCharacterLimit(guidanceLongText, guidanceLimitedText);
    }
  );

  [
    {
      testId: 'RC-4809',
      testTitle:
        'Validate creation of Spot award when Recognition managers selected to give award to Employees in a location for Indefinitely limited times',
      giverType: 'Recognition managers',
      receiverType: 'Employees in a location',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4350',
      testTitle: 'Validate creation of Spot award when All managers selected to give award to their Direct Reports',
      giverType: 'All managers',
      receiverType: 'Award giver’s direct reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4348',
      testTitle:
        'Validate creation of Spot award when All managers selected to give award and rewards points are disabled',
      giverType: 'All managers',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Limited',
    },
    {
      testId: 'RC-4343',
      testTitle: 'Validate creation of Spot award when All user selected to give award',
      giverType: 'All employees',
      receiverType: 'All employees',
      selectAwardPeriodValue: 'Indefinitely',
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
          awardName, // awardDescription
          2, // badgeIndex
          giverType,
          receiverType,
          'India',
          selectAwardPeriodValue as 'Indefinitely' | 'During a specified period',
          selectHowOftenAwardGivenValue as 'Unlimited' | 'Limited'
        );

        await spotAwardPage.verifyCreatedAwardInTable(awardName);
      }
    );
  });

  test(
    '[RC-4681] Validate user can able to cancel spot award details page while creating spot award',
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
        zephyrTestId: 'RC-4681',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await spotAwardPage.verifyNewSpotAwardHeader();

      await spotAwardPage.clickCancelAndVerifyNavigation(manageRecognitionPage);
    }
  );
});
