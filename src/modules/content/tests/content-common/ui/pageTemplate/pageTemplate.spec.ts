import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { generateRandomLongText, PAGE_TEMPLATE_TEST_DATA } from '@content/test-data/page-template.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { EditTemplatePage } from '@/src/modules/content/ui/pages/editTemplatePage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  'page template tests',
  {
    tag: [ContentTestSuite.PAGE_APP_MANAGER, ContentSuiteTags.PAGE_CREATION],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({}) => {});

    test(
      'verify user should be able to add and edit page template created with more than 3 lakhs character within the editor',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.PAGE_CREATION, '@CONT-25965'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify user should be able to add and edit page template created with more than 3 lakhs character within the editor',
          zephyrTestId: 'CONT-25965',
          storyId: 'CONT-25965',
        });
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        // Generate large content (300,001+ characters) using random text generator
        // You can pass any number here, e.g., 150000, 300001, etc.
        const largeContent = generateRandomLongText(150000);

        const templateName = PAGE_TEMPLATE_TEST_DATA.TEMPLATE_NAMES.WITH_FAKER;
        await appManagerFixture.contentManagementHelper.createPageTemplate({
          siteId: siteInfo.siteId,
          options: {
            name: templateName,
            title: PAGE_TEMPLATE_TEST_DATA.DEFAULT_TEMPLATE_TITLE,
            subType: PAGE_TEMPLATE_TEST_DATA.DEFAULT_SUB_TYPE,
            language: PAGE_TEMPLATE_TEST_DATA.DEFAULT_LANGUAGE,
            imgLayout: PAGE_TEMPLATE_TEST_DATA.DEFAULT_IMG_LAYOUT,
            text: largeContent,
          },
        });

        const siteSetupPage = new ManageSiteSetUpPage(appManagerFixture.page, siteInfo.siteId);
        await siteSetupPage.loadPage();
        await siteSetupPage.verifyThePageIsLoaded();
        await siteSetupPage.actions.clickOnThePageTemplateTab();
        await siteSetupPage.actions.clickThreeDotsMenuForTemplate(templateName);
        await siteSetupPage.actions.clickOnEditButton();
        const editTemplatePage = new EditTemplatePage(appManagerFixture.page);
        await editTemplatePage.verifyThePageIsLoaded();
        await editTemplatePage.actions.editContent(largeContent);
        await editTemplatePage.assertions.verifyContentHasProperCharacterCount(300000);
        await editTemplatePage.actions.clickOnUpdateButton();
      }
    );
  }
);
