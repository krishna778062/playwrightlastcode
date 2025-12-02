import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';

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
      await contentPreviewPage.actions.clickOnOptionMenuButton();
      await contentPreviewPage.actions.clickOnMustReadButton();
      await contentPreviewPage.actions.clickOnMustReadModalCancelButton();
      await contentPreviewPage.assertions.verifyMustReadModalIsNotVisible();
      await contentPreviewPage.assertions.verifyContentIsNotAMustRead();
    }

    test(
      'verify Must read Modal cancel button for Page, Event and Album Content',
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
      'verify that app manager can make the content as must read for all the employee in organization',
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
        await contentPreviewPage.actions.clickOnOptionMenuButton();
        await contentPreviewPage.actions.clickOnMustReadButton();
        await contentPreviewPage.assertions.verifyMustReadModalIsNotVisible();
        await contentPreviewPage.actions.makeContentForEveryoneInOrganization();
        await contentPreviewPage.actions.clickOnMakeMustReadButton();
        await contentPreviewPage.assertions.verifyContentIsMustRead();
      }
    );

    test(
      'verify that must read button is not visible for standard user when content is already must read',
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
          ContentType.PAGE
        );
        await contentDetails.loadPage();
        await contentDetails.actions.clickOnOptionMenuButton();
        await contentDetails.assertions.verifyMustReadButtonIsNotVisible();
      }
    );
  }
);
