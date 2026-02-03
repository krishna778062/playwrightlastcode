import { faker } from '@faker-js/faker';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';
import { DialogBox } from '@rewards-components/common/dialog-box';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getFormattedDate } from '@core/utils/dateUtil';
import { tagTest } from '@core/utils/testDecorator';

import { MESSAGES } from '@/src/modules/recognition/constants/messages';

test.describe('Spot Awards Tab', () => {
  const tabOptions = ['Active', 'Draft', 'Scheduled', 'Inactive'];
  const updateSpotAwardTitle = `Updated Spot Award ${faker.string.alphanumeric(8)}`;

  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
      'manage',
      PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
    );
  });

  test(
    '[RC-4337] Verify tab for Spot awards',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P0,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4337',
        storyId: 'RC-4123',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);

      await spotAwardPage.verifyRecognitionPageLoaded(PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION);
      await spotAwardPage.verifySpotAwardsTabVisible();
    }
  );

  test(
    '[RC-4338] Verify when there is no spot awards available on tenant',
    {
      tag: [RecognitionSuitTags.REGRESSION_TEST, RecognitionFeatureTags.SPOT_AWARDS, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4338',
        storyId: 'RC-4123',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      await spotAwardPage.mockEmptySpotAwardsListing();
      await spotAwardPage.navigateToSpotAwardsTab();

      await spotAwardPage.verifyEmptyState();
    }
  );

  test(
    '[RC-4339] Validate filter for Spot awards',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4339',
        storyId: 'RC-4123',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      await spotAwardPage.navigateToSpotAwardsTab();
      await spotAwardPage.verifyFilterTabs(tabOptions);
    }
  );

  test(
    '[RC-4351] Validate newly created Spot award on Recognition Dashboard',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4351',
        storyId: 'RC-4123',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);

      await spotAwardPage.navigateToSpotAwardsTab();
      await spotAwardPage.subTabIndicator.getThreeDotsButton(0).waitFor({ state: 'visible' });

      await spotAwardPage.verifyTableColumnsAndSort();
      await spotAwardPage.verifyThreeDotsMenuOptions(0);
      await spotAwardPage.editAwardAndVerifyChanges(updateSpotAwardTitle);
      await spotAwardPage.verifyEditDateCount(updateSpotAwardTitle);
    }
  );

  test(
    '[RC-4354] Validate creation of Spot award when All employees selected to give award to All employees for specific period limited times',
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
        zephyrTestId: 'RC-4354',
        storyId: 'RC-4123',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);

      await spotAwardPage.navigateToSpotAwardsTab();
      await spotAwardPage.subTabIndicator.getThreeDotsButton(0).waitFor({ state: 'visible' });

      await spotAwardPage.verifyTableColumnsAndSort();
      await spotAwardPage.verifyThreeDotsMenuOptions(0);
      await spotAwardPage.editAwardAndVerifyChanges(updateSpotAwardTitle);
      await spotAwardPage.verifyEditDateCount(updateSpotAwardTitle);
    }
  );

  test(
    '[RC-4355] Validate creation of Spot award when All employees selected to give award to Employees in a location for Specific period unlimited times',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4355',
        storyId: 'RC-4123',
      });
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const spotAwardTitle = 'New_' + updateSpotAwardTitle;

      await spotAwardPage.navigateToSpotAwardsAndWaitForAwards();
      await spotAwardPage.clickNewSpotAwardAndCancel();

      await spotAwardPage.subTabIndicator.getButton('New spot award', 'link').click();
      await spotAwardPage.fillSpotAwardFormPageOne(spotAwardTitle);

      const from = getFormattedDate().replace(',', '');
      const to = getFormattedDate({ days: 5 }).replace(',', '');
      await spotAwardPage.fillSpotAwardConfigurationAndVerifyToast(
        'All employees',
        'Employees in a location',
        'India',
        from,
        to
      );
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);
      await spotAwardPage.verifyAwardNameInTable(spotAwardTitle);
      await spotAwardPage.verifyThreeDotsMenuOptionsByName(spotAwardTitle);
    }
  );

  test(
    '[RC-4818] Validate activation and deactivation of spot awards',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.SPOT_AWARDS,
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4818',
        storyId: 'RC-4123',
      });
      const newSpotAwardTitle = `New Spot Award ${faker.string.alphanumeric(8)}`;
      const { page: appManagerPage } = appManagerFixture;
      const spotAwardPage = new SpotAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const confirmationModal = new DialogBox(appManagerPage);

      await spotAwardPage.navigateToSpotAwardsTab();

      await spotAwardPage.verifyActiveTabAndClickDeactivate(manageRecognitionPage);
      const awardTitle = await spotAwardPage.verifyAndConfirmDeactivateModal(confirmationModal);
      await spotAwardPage.verifyInactiveTabAndActivateAward(awardTitle, manageRecognitionPage, confirmationModal);

      await spotAwardPage.verifyDraftTabAndUpdateAward(newSpotAwardTitle);

      await spotAwardPage.verifyScheduledTabAndDeactivateActivateAward(
        newSpotAwardTitle,
        manageRecognitionPage,
        confirmationModal
      );
    }
  );
});
