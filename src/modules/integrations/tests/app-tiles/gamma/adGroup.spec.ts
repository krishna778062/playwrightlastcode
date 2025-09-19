import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { ActionType, AD_GROUP } from '../../../constants/common';
import { MESSAGES } from '../../../constants/messageRepo';
import { adGroupPage } from '../../../pages/adGroupPage';

import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

let adGroup: adGroupPage;

test.describe('AD Group Integration', () => {
  test.beforeEach(async ({ page }) => {
    await LoginHelper.loginWithPassword(page, adminUser);
  });

  test(
    'Verify that Select Active Directory groups option is visible in Zeus',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
      await adGroup.selectGroup(AD_GROUP.GROUP_NAME1);
      await adGroup.clickOnDoneButton(AD_GROUP.DONE_BUTTON);
      await adGroup.verifyAddedGroupsMessage(1);
    }
  );

  test(
    'Verify that create and do not create audience option is visible in Zeus',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
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
    'All group types should be available in the ‘Select Active directory groups’ dropdown',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
      await adGroup.verifyGroupType();
    }
  );

  test(
    'Verify that standard error message should be displayed when no group will be selected while selecting "use Active Directory groups"  through radio button',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.clickOnAdGroupsOption(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnSelectADGroupButton(AD_GROUP.GROUP_BUTTON);
      await adGroup.clickOnDoneButton(ActionType.Save);
      await adGroup.verifyErrorMessage(MESSAGES.NO_GROUP_SELECTED_MESSAGE);
    }
  );

  test(
    'Verify the alert message should be displayed while clicking on Disconnect Active directory.',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.clickOnDisconnectAccountButton(AD_GROUP.SOURCE_NAME, AD_GROUP.DISCONNECT_BUTTON_TEXT);
      await adGroup.verifyDisconnectConfirmationText(AD_GROUP.CONFIRM_MESSAGE);
    }
  );
});
