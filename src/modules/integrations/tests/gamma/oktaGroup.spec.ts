import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ActionType } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { GammaIntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { OktaGroupPage } from '@/src/modules/integrations/pages/oktaGroupPage';
import { OKTA_GROUP } from '@/src/modules/integrations/test-data/gamma-data-file';

let oktaGroup: OktaGroupPage;

test.describe(
  'okta group integration',
  {
    tag: [IntegrationsSuiteTags.GAMMA, GammaIntegrationsFeatureTags.OKTA_GROUP],
  },
  () => {
    test.afterEach(async ({}, testInfo) => {
      if (testInfo.title.includes('error message when anything wrong with the connections')) {
        return;
      }
      await oktaGroup.clickOnUnCheckOkta();
      await oktaGroup.clickOnSaveButton();
    });

    test(
      'verify that Select okta groups option should be is visible when selected use okta group option',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-22779,INT-22777'],
          storyId: 'INT-21556',
        });
        oktaGroup = new OktaGroupPage(appManagerPage);
        await oktaGroup.loadPage();
        await oktaGroup.verifyThePageIsLoaded();
        await oktaGroup.clickOnCheckbox();
        await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
        await oktaGroup.clickOnSaveButton();
        await oktaGroup.clickOnConfirmButton();
        await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
        await oktaGroup.visiblityOfSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
      }
    );

    test(
      'verify the error message when anything wrong with the connections',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-22778',
          storyId: 'INT-21556',
        });
        oktaGroup = new OktaGroupPage(appManagerPage);
        await oktaGroup.loadPage();
        await oktaGroup.verifyThePageIsLoaded();
        await oktaGroup.clickOnCheckbox();
        await oktaGroup.fillOktaCredentials(OKTA_GROUP.WRONG_LINK, OKTA_GROUP.WRONG_TOKEN);
        await oktaGroup.clickOnSaveButton();
        await oktaGroup.clickOnConfirmButton();
        await oktaGroup.verifyErrorMessage(MESSAGES.OKTA_GROUP_WRONG_CONNECTION);
      }
    );

    test(
      'verify that "do not use okta groups" is enbaled by default when no group is selected',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-22792',
          storyId: 'INT-21556',
        });
        oktaGroup = new OktaGroupPage(appManagerPage);
        await oktaGroup.loadPage();
        await oktaGroup.verifyThePageIsLoaded();
        await oktaGroup.clickOnCheckbox();
        await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
        await oktaGroup.clickOnSaveButton();
        await oktaGroup.clickOnConfirmButton();
        await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
        await appManagerPage.reload();
        await oktaGroup.verifyDoNotUseOktaGroupsIsSelected(OKTA_GROUP.DO_NOT_USE_OKTA_GROUPS);
      }
    );

    test(
      'validate the message after selecting okta group',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-22795',
          storyId: 'INT-21556',
        });
        oktaGroup = new OktaGroupPage(appManagerPage);
        await oktaGroup.loadPage();
        await oktaGroup.verifyThePageIsLoaded();
        await oktaGroup.clickOnCheckbox();
        await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
        await oktaGroup.clickOnSaveButton();
        await oktaGroup.clickOnConfirmButton();
        await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
        await oktaGroup.clickOnSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
        await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME1);
        await oktaGroup.clickOnDoneButton(ActionType.Done);
        await oktaGroup.verifyAddedGroupsMessage(1);
      }
    );

    test(
      'verify that able to delete selected groups, select new groups and count should be updated accordingly, Verify that user is able to get okta groups modal',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-22794, INT-22796'],
          storyId: 'INT-21556',
        });
        oktaGroup = new OktaGroupPage(appManagerPage);
        await oktaGroup.loadPage();
        await oktaGroup.verifyThePageIsLoaded();
        await oktaGroup.clickOnCheckbox();
        await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
        await oktaGroup.clickOnSaveButton();
        await oktaGroup.clickOnConfirmButton();
        await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
        await oktaGroup.clickOnSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
        await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME1);
        await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME2);
        await oktaGroup.clickOnDoneButton(ActionType.Done);
        await oktaGroup.verifyAddedGroupsMessage(2);
        await oktaGroup.clickOnSaveButton();
        await oktaGroup.clickOnSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
        await oktaGroup.clickOnSelectedGroupsTab(OKTA_GROUP.SELECTED_GROUPS_TAB);
        await oktaGroup.clickOnClearGroupButton(OKTA_GROUP.GROUP_NAME2);
        await oktaGroup.clickOnDoneButton(ActionType.Done);
        await oktaGroup.verifyRemovedGroupsMessage(1);
      }
    );

    test(
      'verify that user is able to select multiple groups and count should be visible',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-22793',
          storyId: 'INT-21556',
        });
        oktaGroup = new OktaGroupPage(appManagerPage);
        await oktaGroup.loadPage();
        await oktaGroup.verifyThePageIsLoaded();
        await oktaGroup.clickOnCheckbox();
        await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
        await oktaGroup.clickOnSaveButton();
        await oktaGroup.clickOnConfirmButton();
        await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
        await oktaGroup.clickOnSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
        await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME1);
        await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME2);
        await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME3);
        await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME4);
        await oktaGroup.clickOnDoneButton(ActionType.Done);
        await oktaGroup.verifyAddedGroupsMessage(4);
      }
    );
  }
);
