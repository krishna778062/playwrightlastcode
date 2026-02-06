import { faker } from '@faker-js/faker';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';
import { RecognitionSuitTags, spotAwardsFeatureTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { SpotAwardPage } from '@recognition/ui/pages/manage/spotAwardPage';
import { GiveRecognitionDialogBox } from '@recognition-components/give-recognition-dialog-box';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { LoginHelper } from '@/src/core/helpers/loginHelper';

test.describe('Spot award end to end flow - audience to full ladder', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
      'manage',
      PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
    );
    await manageRecognitionPage.spotAwardTab.click();
  });

  [
    {
      testId: 'RC-6441',
      testTitle:
        'Validate creation of Spot award when Users in audience selected to give award to Award giver’s full ladder reports for Indefinitely unlimited times',
      giverType: 'Users in an audience',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Unlimited',
      priority: TestPriority.P1,
      testGroup: TestGroupType.SANITY,
    },
    {
      testId: 'RC-6440',
      testTitle:
        'Validate creation of Spot award when Users in audience selected to give award to Award giver’s full ladder reports for Indefinitely limited times',
      giverType: 'Users in an audience',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'Indefinitely',
      selectHowOftenAwardGivenValue: 'Limited',
      timesValue: '5',
      priority: TestPriority.P2,
      testGroup: TestGroupType.REGRESSION,
    },
    {
      testId: 'RC-6439',
      testTitle:
        'Validate creation of Spot award when Users in audience selected to give award to Award giver’s full ladder reports for Specific period unlimited times',
      giverType: 'Users in an audience',
      receiverType: 'Award giver’s full ladder reports',
      selectAwardPeriodValue: 'During a specified period',
      selectHowOftenAwardGivenValue: 'Unlimited',
      priority: TestPriority.P2,
      testGroup: TestGroupType.REGRESSION,
    },
  ].forEach(
    ({
      testId,
      testTitle,
      giverType,
      receiverType,
      selectAwardPeriodValue,
      selectHowOftenAwardGivenValue,
      priority,
      testGroup = TestGroupType.REGRESSION,
    }) => {
      test(
        `[${testId}] ${testTitle}`,
        {
          tag: [RecognitionSuitTags.REGRESSION_TEST, spotAwardsFeatureTags.SPOT_AWARDS_AUDIENCE, priority, testGroup],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: testId,
          });
          const { page: appManagerPage } = appManagerFixture;
          const spotAwardPage = new SpotAwardPage(appManagerPage);
          const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
          const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
          const awardName = `Spot_Auto_${giverType}_to_${receiverType}_${faker.string.alphanumeric(6)}`;
          const guidance = `Guidance ${faker.word.words(3)}`;

          //Create the spot award by app-manager
          await spotAwardPage.clickNewSpotAwardButton(manageRecognitionPage);
          await spotAwardPage.verifyNewSpotAwardPageElements();
          await spotAwardPage.fillCompleteSpotAwardFormAndCreate(
            awardName,
            'descriptionText for ' + awardName + ' ' + faker.string.alphanumeric(8),
            2,
            giverType,
            receiverType,
            undefined,
            selectAwardPeriodValue as 'Indefinitely' | 'During a specified period',
            selectHowOftenAwardGivenValue as 'Unlimited' | 'Limited',
            guidance,
            undefined,
            'Monthly',
            getRecognitionTenantConfigFromCache().audience
          );
          await spotAwardPage.verifyToastMessage('New award created');
          await spotAwardPage.waitForToastToHide();
          await spotAwardPage.subTabIndicator.clickOnColumnButton('Created', 2);
          await spotAwardPage.verifyAwardNameInTable(awardName);
          await spotAwardPage.subTabIndicator.checkRecentlyCreatedAwardStatus('Active', 3);
          await spotAwardPage.verifyAwardMenuOptions(awardName);
          await spotAwardPage.pressEscape();

          // Login as end-user who's a part of the audience and give the award to audience member
          await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
          await LoginHelper.loginWithPassword(appManagerFixture.page, {
            email: getRecognitionTenantConfigFromCache().endUserEmail!,
            password: getRecognitionTenantConfigFromCache().endUserPassword!,
          });
          //Go to hub and open dialog to publish and share the award as eligible user
          await spotAwardPage.navigateToRecognitionHubAndOpenDialog(giveRecognitionDialogBox);
          await giveRecognitionDialogBox.publishSpotAward(
            awardName,
            'spot award description for ' + awardName + ' ' + faker.string.alphanumeric(8),
            0
          );
          await spotAwardPage.verifyToastMessage('Recognition published');
          await spotAwardPage.waitForToastToHide();
          await giveRecognitionDialogBox.shareToFeedViaModal();
          await spotAwardPage.verifyToastMessage('Recognition shared successfully');
          await spotAwardPage.waitForToastToHide();
          await giveRecognitionDialogBox.shareToFeedViaShareIcon();
          await spotAwardPage.verifyToastMessage('Recognition shared successfully');

          // Login as non eligible user to check the spot award audience eligibility check
          await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
          await LoginHelper.loginWithPassword(appManagerFixture.page, {
            email: getRecognitionTenantConfigFromCache().recognitionManagerEmail!,
            password: getRecognitionTenantConfigFromCache().recognitionManagerPassword!,
          });
          await spotAwardPage.navigateToRecognitionHubAndOpenDialog(giveRecognitionDialogBox);
          await spotAwardPage.assertSpotAwardEligibility(awardName, false);

          // Award cleanup and UI validation of deletion
          await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
            'manage',
            PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
          );
          await manageRecognitionPage.spotAwardTab.click();
          await spotAwardPage.deleteSpotAwardAndVerifyToast();
        }
      );
    }
  );
});
