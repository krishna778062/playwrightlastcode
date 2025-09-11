import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { expect, test } from '@playwright/test';

import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { UkgSyncPage } from '../../../pages/ukgSyncPage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

let ukgSyncPage: UkgSyncPage;
const people_url = PAGE_ENDPOINTS.PEOPLE_DATA_PAGE;

test.beforeEach(async ({ page }) => {
  await LoginHelper.loginWithPassword(page, adminUser);
  ukgSyncPage = new UkgSyncPage(page);
});

test(
  'UKGPro option should not be in syncing dropdown, if not enabled at People Data and validations at App level on connection',
  {
    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
  },
  async ({ page }) => {
    await ukgSyncPage.verifyThePageIsLoaded();
    await page.goto(people_url);
    await ukgSyncPage.verifyThePageIsLoaded();
    await ukgSyncPage.verifyCheckBox('UKG Pro', 'true');
    await ukgSyncPage.clearInputField('UKG Pro', 'username');
    await ukgSyncPage.clearInputField('UKG Pro', 'password');
    await ukgSyncPage.clearInputField('UKG Pro', 'base url');
    await ukgSyncPage.clearInputField('UKG Pro', 'key');
    await ukgSyncPage.clickOnButton('Save');
    await ukgSyncPage.verifyErrorMessage('Please fill out this field');
    await ukgSyncPage.addInputField('UKG Pro', 'base url', 'test');
    await ukgSyncPage.clickOnButton('Save');
    await ukgSyncPage.verifyErrorMessage('This is not a valid URL');
    await page.goto('People');
    await ukgSyncPage.selectDropdown('syncSource');
    await ukgSyncPage.verifyVisibility('UKG Pro', 'not visible');
  }
);

// test(
//    'UKGPro option should be in syncing dropdown, if enabled successfully at People Data',
//    {
//    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
//    },
//    async ({ page }) => {
//     await page.goto(people_url);
//     await ukgSyncPage.verifyCheckBox('UKG Pro', 'checked');
//     await ukgSyncPage.addConnectionDetails('SimpplrQA', '(@[+m]9uLu8ndu=', 'https://Servicet.ultipro.com', 'YHLQJ');
//     await ukgSyncPage.clickOnButtonWithName('Save');
//     await ukgSyncPage.verifyToastMessage('saveChanges');
//     await page.goto('');
//     await ukgSyncPage.selectDropdown('syncSource');
//     await ukgSyncPage.verifyVisibility('UKG Pro', 'visible');
// });

// test(
//    'Verify dropdown is getting displayed for Pay currency field with UKG as syncing source.',
//    {
//    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
//    },
//    async ({ page }) => {

// });

// test(
//    'Verify UKG Sync when Email is selected as unique Identifier',
//    {
//    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
//    },
//    async ({ page }) => {

// });

// test(
//    'Verify UKG Sync when Mobile Number is selected as unique Identifier',
//    {
//    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
//    },
//    async ({ page }) => {

// });

// test(
//    'Verify UKG Sync when Employee Number is selected as unique Identifier',
//    {
//    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
//    },
//    async ({ page }) => {

// });

// test(
//    'Verify UKG Sync when Phone is selected as unique Identifier',
//    {
//    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
//    },
//    async ({ page }) => {

// });

// test(
//    'Verify UKG Sync when custom field is selected as unique Identifier',
//    {
//    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
//    },
//    async ({ page }) => {

// });
