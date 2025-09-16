import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { IntegrationsSuiteTags } from '../../../constants/testTags';
import { adGroupPage } from '../../../pages/adGroupPage';

import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

let adGroup: adGroupPage;

test.describe(
  'AD Group Integration',
  {
    tag: [IntegrationsSuiteTags.GAMMA],
  },
  () => {
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
        await adGroup.verifyThePageIsLoaded();
        await adGroup.clickOnRadioButton('Use Microsoft Entra ID groups');
        await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
        await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
        await adGroup.adGroupsModalIsDisplayed('SelectActiveDirectoryGroup-module-title');
        await adGroup.selectADGroups('All Company Updated');
        await adGroup.clickOnButtonContainText('Done');
        await adGroup.validateMessage('Added', '1');
      }
    );

    test(
      'Verify that create and do not create audience option is visible in Zeus',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
      },
      async ({}) => {
        await adGroup.clickOnRadioButton('Use Microsoft Entra ID groups');
        await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
        await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
        await adGroup.selectADGroups('new security grp');
        await adGroup.clickOnButtonContainText('Done');
        await adGroup.divTextDisplayed('Do not create audiences');
        await adGroup.divTextDisplayed('Create audiences');
      }
    );

    test(
      'All group types should be available in the ‘Select Active directory groups’ dropdown',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
      },
      async ({}) => {
        await adGroup.clickOnButton('Use Microsoft Entra ID groups');
        await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
        await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
        await adGroup.verifyGroupType('type');
      }
    );

    test(
      'Verify that standard error message should be displayed when no group will be selected while selecting "use Active Directory groups"  through radio button',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
      },
      async ({}) => {
        await adGroup.clickOnButton('Use Microsoft Entra ID groups');
        await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
        await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
        await adGroup.clickOnButton('Save');
        await adGroup.verifyParagraphText('Please select at least one Microsoft Entra ID group');
      }
    );

    test(
      'Verify the alert message should be displayed while clicking on Disconnect Active directory.',
      {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
      },
      async ({}) => {
        await adGroup.clickOnDisconnectButton('Disconnect your Microsoft Entra ID account');
        await adGroup.headingIsPresent('Disconnect Microsoft Entra ID account');
      }
    );
  }
);
