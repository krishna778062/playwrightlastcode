import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { tagTest } from '@/src/core/utils/testDecorator';
import { ActionType } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { GammaIntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { AdGroupPage } from '@/src/modules/integrations/pages/adGroupPage';
import { AD_GROUP } from '@/src/modules/integrations/test-data/gamma-data-file';

let adGroup: AdGroupPage;

test.describe(
  'ad group integration',
  {
    tag: [IntegrationsSuiteTags.GAMMA, GammaIntegrationsFeatureTags.AD_GROUP],
  },
  () => {
    test(
      'verify that Select Active Directory groups option is visible in Zeus',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11721',
          storyId: 'INT-5282',
        });
        adGroup = new AdGroupPage(appManagerPage);
        await adGroup.loadPage();
        await adGroup.verifyThePageIsLoaded();
        await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
        await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
        await adGroup.selectGroup(AD_GROUP.GROUP_NAME1);
        await adGroup.clickOnDoneButton(AD_GROUP.DONE_BUTTON);
        await adGroup.verifyAddedGroupsMessage(1);
      }
    );

    test(
      'verify that create and do not create audiences options is visible after connected with Active Directory groups.',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11705',
          storyId: 'INT-5282',
        });
        adGroup = new AdGroupPage(appManagerPage);
        await adGroup.loadPage();
        await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
        await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
        await adGroup.selectGroup(AD_GROUP.GROUP_NAME2);
        await adGroup.clickOnDoneButton(AD_GROUP.DONE_BUTTON);
        await adGroup.doNotCreateAudiencesButtonVisibilty(AD_GROUP.DO_NOT_CREATE_AUDIENCES);
        await adGroup.createAudiencesButtonVisibilty(AD_GROUP.CREATE_AUDIENCES);
      }
    );

    test(
      'all group types should be available in the ‘Select Active directory groups’ dropdown',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-5691',
          storyId: 'INT-5439',
        });
        adGroup = new AdGroupPage(appManagerPage);
        await adGroup.loadPage();
        await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
        await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
        await adGroup.verifyGroupType();
      }
    );

    test(
      'verify that standard error message should be displayed when no group will be selected while selecting "use Active Directory groups"  through radio button',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-4921',
          storyId: 'INT-4563',
        });
        adGroup = new AdGroupPage(appManagerPage);
        await adGroup.loadPage();
        await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
        await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
        await adGroup.clickOnDoneButton(ActionType.Save);
        await adGroup.verifyErrorMessage(MESSAGES.NO_GROUP_SELECTED_MESSAGE);
      }
    );

    test(
      'verify the alert message should be displayed while clicking on Disconnect Active directory.',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-5863',
          storyId: 'INT-5273',
        });
        adGroup = new AdGroupPage(appManagerPage);
        await adGroup.loadPage();
        await adGroup.clickOnDisconnectAccountButton(AD_GROUP.SOURCE_NAME, AD_GROUP.DISCONNECT_BUTTON_TEXT);
        await adGroup.verifyDisconnectConfirmationText(AD_GROUP.CONFIRM_MESSAGE);
      }
    );
  }
);
