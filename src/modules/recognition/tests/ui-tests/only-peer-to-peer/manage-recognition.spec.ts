import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { RecognitionTabNames } from '@recognition-constants/genericEnums';
import { RecognitionHubPage } from '@recognition-pages/recognitionHubPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('manage recognition', () => {
  test(
    'verify navigation to recognition pages through side nav bar UI elements when only p2p is enabled',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.NAVIGATION_VIA_SIDE_NAV,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6398',
        storyId: 'RC-6090',
      });
      const { page: appManagerPage, navigationHelper: appManagerUINavigationHelper } = appManagerFixture;

      await appManagerUINavigationHelper.navigateToRecognitionHubViaSideNavBar();
      await appManagerUINavigationHelper.navigateToManageRecognitionViaSideNavBar();
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint('manage', PAGE_ENDPOINTS.MANAGE_RECOGNITION);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
    }
  );

  test(
    'verify navigation to recognition pages through endpoints when only p2p is enabled',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.NAVIGATION_VIA_SIDE_NAV,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6398',
        storyId: 'RC-6090',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint('manage', PAGE_ENDPOINTS.MANAGE_RECOGNITION);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
    }
  );

  test(
    'verify peer enablement when only p2p is enabled and Recognition flag is OFF',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5791',
        storyId: 'RC-6090',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'peer',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.verifyPeerRecognitionAccessibleInP2POnlyMode();
      await manageRecognitionPage.verifyBadgeTabAccessibleInP2POnlyMode();
      await manageRecognitionPage.verifyTabNotAccessibleInP2POnlyMode(RecognitionTabNames.SPOT_AWARDS);
      await manageRecognitionPage.verifyTabNotAccessibleInP2POnlyMode(RecognitionTabNames.MILESTONES);
      await manageRecognitionPage.verifyTabNotAccessibleInP2POnlyMode(RecognitionTabNames.RECURRING_AWARDS);
    }
  );
});
