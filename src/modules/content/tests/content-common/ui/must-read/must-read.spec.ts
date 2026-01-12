import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { PrivilegesScreenPage } from '@/src/modules/content/ui/pages/privilegesScreenPage';

test.describe(
  '@Must Read - Must Read Modal functionality',
  {
    tag: [ContentTestSuite.MUST_READ],
  },
  () => {
    let contentPreviewPage: ContentPreviewPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();
    });

    // Helper function to verify Must Read modal cancel button
    async function verifyMustReadModalCancelButton(
      page: any,
      siteId: string,
      contentId: string,
      contentType: ContentType
    ): Promise<void> {
      contentPreviewPage = new ContentPreviewPage(page, siteId, contentId, contentType.toLowerCase());
      await contentPreviewPage.loadPage({ stepInfo: `Load ${contentType} preview page` });
      await contentPreviewPage.verifyThePageIsLoaded();
      await contentPreviewPage.clickOnOptionMenuButton();
      await contentPreviewPage.clickOnMustReadButton();
      await contentPreviewPage.clickOnMustReadModalCancelButton();
      await contentPreviewPage.verifyMustReadModalIsNotVisible();
      await contentPreviewPage.verifyContentIsNotAMustRead();
    }

    test(
      'verify Must read Modal cancel button for Page, Event and Album Content CONT-21123',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-21123', '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Must read Modal cancel button for Page, Event and Album Content',
          zephyrTestId: 'CONT-21123',
          storyId: 'CONT-21123',
        });

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: true,
          hasPages: true,
        });

        // Create all content types in parallel via API
        const [pageInfo, eventInfo, albumInfo] = await Promise.all([
          appManagerFixture.contentManagementHelper.createPage({
            siteId: siteDetails.siteId,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
          }),
          appManagerFixture.contentManagementHelper.createEvent({
            siteId: siteDetails.siteId,
            contentInfo: { contentType: 'event' },
          }),
          appManagerFixture.contentManagementHelper.createAlbum({
            siteId: siteDetails.siteId,
            imageName: 'beach.jpg',
          }),
        ]);

        await verifyMustReadModalCancelButton(
          appManagerFixture.page,
          siteDetails.siteId,
          pageInfo.contentId,
          ContentType.PAGE
        );
        await verifyMustReadModalCancelButton(
          appManagerFixture.page,
          siteDetails.siteId,
          eventInfo.contentId,
          ContentType.EVENT
        );
        await verifyMustReadModalCancelButton(
          appManagerFixture.page,
          siteDetails.siteId,
          albumInfo.contentId,
          ContentType.ALBUM
        );
      }
    );

    test(
      'verify that app manager can make the content as must read for all the employee in organization CONT-5171',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-5171'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify that app manager can make the content as must read for all the employee in organization',
          zephyrTestId: 'CONT-5171',
          storyId: 'CONT-5171',
        });

        // Step 1: Login as app manager on tenant (already done via fixture)
        await appManagerFixture.homePage.verifyThePageIsLoaded();

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: true,
          hasPages: true,
        });

        // Create all content types in parallel via API
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteDetails.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });

        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteDetails.siteId,
          pageInfo.contentId,
          ContentType.PAGE
        );
        await contentPreviewPage.loadPage({ stepInfo: `Load ${ContentType.PAGE} preview page` });
        await contentPreviewPage.verifyThePageIsLoaded();
        await contentPreviewPage.clickOnOptionMenuButton();
        await contentPreviewPage.clickOnMustReadButton();
        await contentPreviewPage.verifyMustReadModalIsNotVisible();
        await contentPreviewPage.makeContentForEveryoneInOrganization();
        await contentPreviewPage.clickOnMakeMustReadButton();
        await contentPreviewPage.verifyContentIsMustRead();
      }
    );

    test(
      'verify that must read button is not visible for standard user when content is already must read CONT-5521',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-5521'],
      },
      async ({ appManagerApiFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that must read button is not visible for standard user when content is already must read',
          zephyrTestId: 'CONT-5521',
          storyId: 'CONT-5521',
        });

        const siteDetails = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const createPageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteDetails.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'knowledge' },
        });

        await appManagerApiFixture.contentManagementHelper.makeContentMustRead(createPageInfo.contentId);
        const contentDetails = new ContentPreviewPage(
          appManagerFixture.page,
          siteDetails.siteId,
          createPageInfo.contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentDetails.loadPage();
        await contentDetails.clickOnOptionMenuButton();
        await contentDetails.verifyMustReadButtonIsNotVisible();
      }
    );

    test(
      'verify there should be no error message "Cannot read property \'getAppConfig\' of undefined" when user make changes under Manage Application Must Read or Alert section',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29121'],
      },
      async ({ appManagerApiFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify there should be no error message "Cannot read property \'getAppConfig\' of undefined" when user make changes under Manage Application Must Read or Alert section',
          zephyrTestId: 'CONT-29121',
          storyId: 'CONT-29121',
        });

        await appManagerApiFixture.feedManagementHelper.getAppConfig();
        const sitesNotInControl = await appManagerApiFixture.feedManagementHelper.getSiteAndContentNotInControl(
          appManagerApiFixture.siteManagementHelper
        );
        const privilegesScreenPage = new PrivilegesScreenPage(appManagerFixture.page);
        await privilegesScreenPage.loadPage();
        await privilegesScreenPage.verifyThePageIsLoaded();
        await privilegesScreenPage.alertInputBoxFillWithText(sitesNotInControl.site.name);
        await privilegesScreenPage.alertInputBoxSelectOption(sitesNotInControl.site.name);
        await privilegesScreenPage.mustReadInputBoxFillWithText(sitesNotInControl.mustReadSite.name);
        await privilegesScreenPage.mustReadInputBoxSelectOption(sitesNotInControl.mustReadSite.name);
        await privilegesScreenPage.clickOnSave();
        await privilegesScreenPage.verifyTheChangesConfirmationToastMessageIsVisible();
        await privilegesScreenPage.reloadScreen();
        await privilegesScreenPage.verifyMustReadChangesAreSaved(sitesNotInControl.mustReadSite.name);
        await privilegesScreenPage.verifyAlertChangesAreSaved(sitesNotInControl.site.name);
      }
    );
    test(
      'verify that app manager should be able to add any site from the access control ',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-5796'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'verify that app manager should be able to add any site from the access control',
          zephyrTestId: 'CONT-5796',
          storyId: 'CONT-5796',
        });

        await appManagerApiFixture.feedManagementHelper.getAppConfig();
        const sitesNotInControl = await appManagerApiFixture.feedManagementHelper.getSiteAndContentNotInControl(
          appManagerApiFixture.siteManagementHelper
        );
        const privilegesScreenPage = new PrivilegesScreenPage(appManagerFixture.page);
        await privilegesScreenPage.loadPage();
        await privilegesScreenPage.verifyThePageIsLoaded();
        await privilegesScreenPage.actions.mustReadInputBoxFillWithText(sitesNotInControl.mustReadSite.name);
        await privilegesScreenPage.actions.mustReadInputBoxSelectOption(sitesNotInControl.mustReadSite.name);
        await privilegesScreenPage.actions.clickOnSave();
        await privilegesScreenPage.assertions.verifyTheChangesConfirmationToastMessageIsVisible();
        await privilegesScreenPage.reloadScreen();
        await privilegesScreenPage.assertions.verifyMustReadChangesAreSaved(sitesNotInControl.mustReadSite.name);
      }
    );
  }
);
