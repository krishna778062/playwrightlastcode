/* eslint-disable simple-import-sort/imports */
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { ManageAppSettingsApiService } from '@recognition-api/services/ManageAppSettingsApiService';
import { ManageAppRecognitionSettingPage } from '@recognition-pages/manageAppRecognitionSettingPage';

test.describe('Comment enable/disable settings check', () => {
  test(
    'Verify option disable comments on Application setting page',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.COMMENT_ENABLE_DISABLE,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7234',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppRecognitionSettingPage = new ManageAppRecognitionSettingPage(appManagerPage);
      await manageAppRecognitionSettingPage.navigateManageAppRecognitionSettingPageViaEndpoint();
      await manageAppRecognitionSettingPage.verifyRecognitionCommentsSettingsUIElements();
    }
  );

  test(
    'Validate enable/disable comment option on application setting page',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.COMMENT_ENABLE_DISABLE,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7235',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const manageAppRecognitionSettingPage = new ManageAppRecognitionSettingPage(appManagerPage);
      await manageAppRecognitionSettingPage.navigateManageAppRecognitionSettingPageViaEndpoint();

      // Pre-req: comments disabled in the application setting page
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', true);
      // UI validation to enable the comments
      await manageAppRecognitionSettingPage.verifyEnableDisableCommentsSetting('enable');
      // UI validation to disable the comments
      await manageAppRecognitionSettingPage.verifyEnableDisableCommentsSetting('disable');
      await manageAppRecognitionSettingPage.verifyDisableCommentsModalElements();
      await manageAppRecognitionSettingPage.clickDisableCommentsButton();
      // clean up to keep the comments enabled via api
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
    }
  );

  test(
    'Verify disabled comment dialogue when user is trying to select disable the comment option on application setting page',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.COMMENT_ENABLE_DISABLE,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7486',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const manageAppRecognitionSettingPage = new ManageAppRecognitionSettingPage(appManagerPage);
      await manageAppRecognitionSettingPage.navigateManageAppRecognitionSettingPageViaEndpoint();

      // Pre-req: comments enabled in the application setting page
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      // UI validation to disable the comments
      await manageAppRecognitionSettingPage.verifyEnableDisableCommentsSetting('disable');
      await manageAppRecognitionSettingPage.verifyDisableCommentsModalElements();
      await manageAppRecognitionSettingPage.clickDisableCommentsButton();
      // clean up to keep the comments enabled via api
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
    }
  );
});
