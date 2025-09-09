import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { test, Locator } from '@playwright/test'
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { TestGroupType } from '@core/constants/testType';
import { UserCredentials } from '@core/types/test.types';
import { TestSuite } from '@/src/core/constants/testSuite';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { adGroupPage } from '../../../pages/adGroupPage';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

let adGroup: adGroupPage;
const integration_people_page = PAGE_ENDPOINTS.INTEGRATIONS_PEOPLE_PAGE;


test.beforeEach(async ({ page }) => {
    await LoginHelper.loginWithPassword(page, adminUser);
    adGroup = new adGroupPage(page);
});

test('Verify that Select Active Directory groups option is visible in Zeus', {
        tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
    },
    async ({page}) => {     

    await page.goto(integration_people_page);

    await adGroup.clickOnSpanContainText('Use Microsoft Entra ID groups');
    await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
    await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
    await adGroup.ADGroupsModalIsDisplayed('SelectActiveDirectoryGroup-module-title');
    await adGroup.selectADGroups('All Company Updated');
    await adGroup.clickOnButtonContainText('Done');
    await adGroup.validateMessage('Added','1')
});


test('Verify that create and do not create audience option is visible in Zeus', {
    tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
},
async ({page}) => {     

await page.goto(integration_people_page);

await adGroup.clickOnSpanContainText('Use Microsoft Entra ID groups');
await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
await adGroup.selectADGroups('new security grp');
await adGroup.clickOnButtonContainText('Done');
await adGroup.SpanTextDisplayed('Do not create audiences');
await adGroup.SpanTextDisplayed('Create audiences');
});


test('All group types should be available in the ‘Select Active directory groups’ dropdown', {
    tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
},
async ({page}) => {     

await page.goto(integration_people_page);

await adGroup.clickOnSpanContainText('Use Microsoft Entra ID groups');
await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
await adGroup.verifyGroupType('type');
});

test('Verify that standard error message should be displayed when no group will be selected while selecting "use Active Directory groups"  through radio button', {
    tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
},
async ({page}) => {     

await page.goto(integration_people_page);

await adGroup.clickOnSpanContainText('Use Microsoft Entra ID groups');
await adGroup.verifyMicrosoftEntraIDGroupsVisibility('Select Microsoft Entra ID groups');
await adGroup.clickOnButtonContainText('Select Microsoft Entra ID groups');
await adGroup.clickOnSaveButton('Save');
await adGroup.verifyParagraphText('Please select at least one Microsoft Entra ID group');
});

test('Verify the alert message should be displayed while clicking on Disconnect Active directory.', {
    tag: [TestGroupType.SMOKE, TestGroupType.SANITY, TestSuite.AD_GROUP],
},
async ({page}) => {     

await page.goto(integration_people_page);

await adGroup.ClickOnDisconnectButton('Disconnect your Microsoft Entra ID account');
await adGroup.headingisPresent('Disconnect Microsoft Entra ID account');

});
