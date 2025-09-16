import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { AD_GROUP } from '../../../constants/common';
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
      tag: [TestPriority.P4, TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      // await page.goto(PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
      await adGroup.clickOnRadioButton(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnButton(AD_GROUP.GROUP_BUTTON);
      await adGroup.selectGroup(AD_GROUP.GROUP_NAME1);
      await adGroup.clickOnDoneButton(AD_GROUP.DONE_BUTTON);
      await adGroup.validateMessage(AD_GROUP.ADDED_MESSAGE, AD_GROUP.COUNT);
    }
  );

  test(
    'Verify that create and do not create audience option is visible in Zeus',
    {
      tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.clickOnRadioButton(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnButton(AD_GROUP.GROUP_BUTTON);
      await adGroup.selectGroup(AD_GROUP.GROUP_NAME2);
      await adGroup.clickOnDoneButton(AD_GROUP.DONE_BUTTON);
      await adGroup.AudienceOptionDisplayed(AD_GROUP.DO_NOT_CREATE_AUDIENCES);
      await adGroup.AudienceOptionDisplayed(AD_GROUP.CREATE_AUDIENCES);
    }
  );

  test(
    'All group types should be available in the ‘Select Active directory groups’ dropdown',
    {
      tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.verifyThePageIsLoaded();
      await adGroup.clickOnRadioButton(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnButton(AD_GROUP.GROUP_BUTTON);
      await adGroup.verifyGroupType(AD_GROUP.TYPE);
    }
  );

  test(
    'Verify that standard error message should be displayed when no group will be selected while selecting "use Active Directory groups"  through radio button',
    {
      tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.clickOnRadioButton(AD_GROUP.AD_GROUP_OPTION);
      await adGroup.clickOnButton(AD_GROUP.GROUP_BUTTON);
      await adGroup.clickOnButton(AD_GROUP.SAVE_BUTTON);
      await adGroup.verifyMessage(MESSAGES.NO_GROUP_SELECTED_MESSAGE);
    }
  );

  test(
    'Verify the alert message should be displayed while clicking on Disconnect Active directory.',
    {
      tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({ page }) => {
      adGroup = new adGroupPage(page);
      await adGroup.loadPage();
      await adGroup.clickOnDisconnectButton(AD_GROUP.DISCONNECT_BUTTON);
      await adGroup.confirmDisconnect(AD_GROUP.CONFIRM_MESSAGE);
    }
  );
});
