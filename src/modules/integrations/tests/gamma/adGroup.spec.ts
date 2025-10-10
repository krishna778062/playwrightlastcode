import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { tagTest } from '@/src/core/utils/testDecorator';
import { ActionType } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { GammaIntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { AD_GROUP } from '@/src/modules/integrations/test-data/gamma-data-file';
import { AdGroupPage } from '@/src/modules/integrations/ui/pages/adGroupPage';

let adGroup: AdGroupPage;

test.describe(
  'ad group integration',
  {
    tag: [IntegrationsSuiteTags.GAMMA, GammaIntegrationsFeatureTags.AD_GROUP],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      adGroup = new AdGroupPage(appManagerFixture.page);
      await adGroup.loadPage();
      await adGroup.verifyThePageIsLoaded();
      await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
    });

    test(
      'verify that Select Active Directory groups option is visible in Zeus',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11721',
          storyId: 'INT-5282',
        });
        await adGroup.selectGroup(AD_GROUP.GROUP_NAME1);
        await adGroup.clickOnSubmitButton(ActionType.Done);
        await adGroup.verifyAddedGroupsMessage(1);
      }
    );

    test(
      'verify that create and do not create audiences options is visible after connected with Active Directory groups.',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11705',
          storyId: 'INT-5282',
        });
        await adGroup.selectGroup(AD_GROUP.GROUP_NAME2);
        await adGroup.clickOnSubmitButton(ActionType.Done);
        await adGroup.doNotCreateAudiencesButtonVisibilty(AD_GROUP.DO_NOT_CREATE_AUDIENCES);
        await adGroup.createAudiencesButtonVisibilty(AD_GROUP.CREATE_AUDIENCES);
      }
    );

    test(
      'all group types should be available in the ‘Select Active directory groups’ dropdown',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-5691',
          storyId: 'INT-5439',
        });
        await adGroup.verifyGroupType();
      }
    );

    test(
      'verify that standard error message should be displayed when no group will be selected while selecting "use Active Directory groups"  through radio button',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-4921',
          storyId: 'INT-4563',
        });
        await adGroup.clickOnSubmitButton(ActionType.Done);
        await adGroup.clickOnSubmitButton(ActionType.Save);
        await adGroup.verifyErrorMessage(MESSAGES.NO_GROUP_SELECTED_MESSAGE);
      }
    );

    test(
      'verify that Retain AD groups if user switches from "Do not use AD groups" to "Use AD groups"',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-5577',
          storyId: 'INT-5282',
        });
        await adGroup.selectGroup(AD_GROUP.GROUP_NAME1);
        await adGroup.selectGroup(AD_GROUP.GROUP_NAME2);
        await adGroup.clickOnSubmitButton(ActionType.Done);
        await adGroup.verifyAddedGroupsMessage(2);
        await adGroup.clickOnSubmitButton(ActionType.Save);
        await adGroup.clickOnDoNotUseADGroupsButton(AD_GROUP.DO_NOT_USE_AD_GROUPS);
        await adGroup.clickOnSubmitButton(ActionType.Save);
        await appManagerFixture.page.reload();
        await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
        await adGroup.verifyMicrosoftEntraButtonCount(2);
        await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
        await adGroup.clickOnSelectedGroupsTab(AD_GROUP.SELECTED_GROUPS_TAB);
        await adGroup.clickOnClearGroupButton(AD_GROUP.GROUP_NAME1);
        await adGroup.clickOnClearGroupButton(AD_GROUP.GROUP_NAME2);
        await adGroup.clickOnSubmitButton(ActionType.Done);
        await adGroup.clickOnDoNotUseADGroupsButton(AD_GROUP.DO_NOT_USE_AD_GROUPS);
        await adGroup.clickOnSubmitButton(ActionType.Save);
      }
    );
  }
);
