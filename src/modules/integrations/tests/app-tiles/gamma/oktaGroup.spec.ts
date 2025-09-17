import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { OKTA_GROUP } from '../../../constants/common';
import { ActionType } from '../../../constants/common';
import { MESSAGES } from '../../../constants/messageRepo';
import { oktaGroupPage } from '../../../pages/oktaGroupPage';

import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

let oktaGroup: oktaGroupPage;

test.describe('AD Group Integration', () => {
  test.beforeEach(async ({ page }) => {
    await LoginHelper.loginWithPassword(page, adminUser);
  });

  test(
    'Verify that Select okta groups option should be is visible when selected use okta group option',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.OKTA_GROUP],
    },

    async ({ page }) => {
      oktaGroup = new oktaGroupPage(page);
      await oktaGroup.loadPage();
      await oktaGroup.clickOnCheckbox();
      await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
      await oktaGroup.clickOnSaveButton();
      await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
      await oktaGroup.visiblityOfSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
      await oktaGroup.clickOnUnCheckOkta();
      await oktaGroup.clickOnSaveButton();
    }
  );

  test(
    'Verify the error message when anything wrong with the connections',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.OKTA_GROUP],
    },

    async ({ page }) => {
      oktaGroup = new oktaGroupPage(page);
      await oktaGroup.loadPage();
      await oktaGroup.clickOnCheckbox();
      await oktaGroup.fillOktaCredentials(OKTA_GROUP.WRONG_LINK, OKTA_GROUP.WRONG_TOKEN);
      await oktaGroup.clickOnSaveButton();
      await oktaGroup.verifyErrorMessage(MESSAGES.OKTA_GROUP_WRONG_CONNECTION);
    }
  );

  test(
    'Verify that "do not use okta groups" is enbaled by default when no group is selected',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.OKTA_GROUP],
    },

    async ({ page }) => {
      oktaGroup = new oktaGroupPage(page);
      await oktaGroup.loadPage();
      await oktaGroup.clickOnCheckbox();
      await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
      await oktaGroup.clickOnSaveButton();
      await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
      await page.reload();
      await oktaGroup.verifyDoNotUseOktaGroupsIsSelected(OKTA_GROUP.DO_NOT_USE_OKTA_GROUPS);
      await oktaGroup.clickOnUnCheckOkta();
      await oktaGroup.clickOnSaveButton();
    }
  );

  test(
    'Validate the message after selecting okta group',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.OKTA_GROUP],
    },

    async ({ page }) => {
      oktaGroup = new oktaGroupPage(page);
      await oktaGroup.loadPage();
      await oktaGroup.clickOnCheckbox();
      await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
      await oktaGroup.clickOnSaveButton();
      await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
      await oktaGroup.clickOnSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
      await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME1);
      await oktaGroup.clickOnDoneButton(ActionType.Done);
      await oktaGroup.verifyAddedGroupsMessage(1);
      await oktaGroup.clickOnUnCheckOkta();
      await oktaGroup.clickOnSaveButton();
    }
  );

  test(
    'Verify that able to delete selected groups, select new groups and count should be updated accordingly, Verify that user is able to get okta groups modal',
    {
      tag: [TestPriority.P4, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.OKTA_GROUP],
    },

    async ({ page }) => {
      oktaGroup = new oktaGroupPage(page);
      await oktaGroup.loadPage();
      await oktaGroup.clickOnCheckbox();
      await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
      await oktaGroup.clickOnSaveButton();
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
      await oktaGroup.clickOnUnCheckOkta();
      await oktaGroup.clickOnSaveButton();
    }
  );

  test(
    'Verify that user is able to select multiple groups and count should be visible',
    {
      tag: [TestPriority.P4, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.OKTA_GROUP],
    },

    async ({ page }) => {
      oktaGroup = new oktaGroupPage(page);
      await oktaGroup.loadPage();
      await oktaGroup.clickOnCheckbox();
      await oktaGroup.fillOktaCredentials(OKTA_GROUP.OKTA_LINK, OKTA_GROUP.TOKEN);
      await oktaGroup.clickOnSaveButton();
      await oktaGroup.clickOnOktaGroupOption(OKTA_GROUP.GROUP_OPTION);
      await oktaGroup.clickOnSelectOktaGroupButton(OKTA_GROUP.GROUP_BUTTON);
      await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME1);
      await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME2);
      await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME3);
      await oktaGroup.clickOnSelectOktaGroup(OKTA_GROUP.GROUP_NAME4);
      await oktaGroup.clickOnDoneButton(ActionType.Done);
      await oktaGroup.verifyAddedGroupsMessage(4);
      await oktaGroup.clickOnUnCheckOkta();
      await oktaGroup.clickOnSaveButton();
    }
  );
});
