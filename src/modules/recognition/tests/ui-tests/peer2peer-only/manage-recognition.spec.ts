import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { DialogContainerForm } from '@recognition/ui/components';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { RecognitionTabNames } from '@recognition-constants/genericEnums';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Manage recognition - only peer enablement mode', () => {
  test(
    'verify peer enablement when only p2p is enabled and Recognition flag is OFF',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P1,
        TestGroupType.SANITY,
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

  test(
    'Verify award creation in manage recognition when peer enablement only',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6175',
        storyId: 'RC-6090',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);
      const awardName = `Auto Peer Award ${Date.now()}`;
      const updatedAwardName = `${awardName} - edited`;
      const awardDescription = `Automated peer recognition ${Date.now()}`;
      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint('manage', PAGE_ENDPOINTS.MANAGE_RECOGNITION);
      await manageRecognitionPage.verifyPeerRecognitionAccessibleInP2POnlyMode();
      await manageRecognitionPage.runPeerRecognitionLifecycle({
        dialogContainerForm,
        awardName,
        updatedAwardName,
        awardDescription,
      });
    }
  );
});
