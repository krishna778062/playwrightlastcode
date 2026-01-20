import { ManageAppSettingsApiService } from '@recognition/api/services/ManageAppSettingsApiService';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageAppRecognitionSettingPage } from '@recognition/ui/pages/manageAppRecognitionSettingPage';
import { GiveRecognitionDialogBox } from '@recognition-components/give-recognition-dialog-box';
import { RecognitionHubPage } from '@recognition-pages/recognitionHubPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Manage app recognition settings - only peer enablement mode', () => {
  test(
    'Verify UI elements on manage application recognition page when only p2p is enabled',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6355',
        storyId: 'RC-6090',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppRecognitionSettingPage = new ManageAppRecognitionSettingPage(appManagerPage);
      await manageAppRecognitionSettingPage.navigateManageAppRecognitionSettingPageViaEndpoint();
      await manageAppRecognitionSettingPage.verifyManageRecognitionSettingsHeaderElements();
    }
  );

  test(
    'Verify Expertise option appears on the recognition modal when enabled in application settings for P2P only',
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
        zephyrTestId: 'RC-6365',
        storyId: 'RC-6090',
      });

      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const manageAppRecognitionSettingPage = new ManageAppRecognitionSettingPage(appManagerPage);
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const giveRecognitionDialog = new GiveRecognitionDialogBox(appManagerPage);

      // Ensure expertise is disabled and not shown
      await manageAppSettingsApi.updateTenantConfig(appManagerPage, { isExpertiseEnabled: false });
      await manageAppRecognitionSettingPage.navigateManageAppRecognitionSettingPageViaEndpoint();
      await manageAppRecognitionSettingPage.verifyExpertiseHeaderIsVisible();
      await manageAppRecognitionSettingPage.verifyExpertiseCheckboxIsChecked(false);

      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.clickOnGiveRecognition();
      await giveRecognitionDialog.verifyFieldVisibility('expertise', false);
      await giveRecognitionDialog.dialogCloseButton.click();

      // Enable expertise and verify it appears on the modal
      await manageAppSettingsApi.updateTenantConfig(appManagerPage, { isExpertiseEnabled: true });
      await recognitionHubPage.clickOnGiveRecognition();
      await giveRecognitionDialog.verifyFieldVisibility('expertise', true);
      await giveRecognitionDialog.dialogCloseButton.click();
    }
  );

  test(
    "Verify 'Company Value' option appears on the recognition modal when enabled in application settings for P2P only",
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
        zephyrTestId: 'RC-6364',
        storyId: 'RC-6090',
      });

      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const giveRecognitionDialog = new GiveRecognitionDialogBox(appManagerPage);

      // Disable company values and ensure it is hidden on modal
      await manageAppSettingsApi.updateTenantConfig(appManagerPage, { companyValueMode: 'OFF' });
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.clickOnGiveRecognition();
      await giveRecognitionDialog.verifyFieldVisibility('companyValues', false);
      await giveRecognitionDialog.dialogCloseButton.click();

      // Enable company values and verify it appears on the modal
      await manageAppSettingsApi.updateTenantConfig(appManagerPage, { companyValueMode: 'ATTACH' });
      await recognitionHubPage.clickOnGiveRecognition();
      await giveRecognitionDialog.verifyFieldVisibility('companyValues', true);
      await giveRecognitionDialog.dialogCloseButton.click();
    }
  );
});
