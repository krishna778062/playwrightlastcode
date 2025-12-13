import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentApiHelper } from '@/src/modules/content/apis/apiValidation/contentAPIHelper';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

test.describe(
  '@Content API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let contentApiHelper: ContentApiHelper;

    test.beforeEach(async () => {
      contentApiHelper = new ContentApiHelper();
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete all created content
      try {
        await appManagerApiFixture.contentManagementHelper.cleanup();
        await appManagerApiFixture.siteManagementHelper.cleanup();
      } catch (error) {
        console.warn('Content cleanup failed:', error);
      }
    });

    test(
      'validation App manager should be able to create Page in public site using API',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42055', ContentTestSuite.CONTENT_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validation App manager should be able to create Page in public site using API',
          zephyrTestId: 'CONT-42055',
          storyId: 'CONT-42055',
        });

        // Create a public site
        const siteData = TestDataGenerator.generateSite(SITE_TYPES.PUBLIC);
        const createdSite = await appManagerApiFixture.siteManagementHelper.createSite({
          siteName: siteData.siteName,
          accessType: SITE_TYPES.PUBLIC,
          waitForSearchIndex: false,
        });

        // Create a page in the public site
        const pageName = TestDataGenerator.generateRandomText();
        const pageResponse = await appManagerApiFixture.contentManagementHelper.createPageWithCompleteResponse({
          siteId: createdSite.siteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'news',
          },
          options: {
            pageName: pageName,
            contentDescription: 'Test page description',
          },
        });

        // Validate the page response
        await contentApiHelper.validatePageCreation(pageResponse, pageName, createdSite.siteId);
      }
    );

    test(
      'validation App manager should be able to create Event in public site using API',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42054', ContentTestSuite.CONTENT_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validation App manager should be able to create Event in public site using API',
          zephyrTestId: 'CONT-42054',
          storyId: 'CONT-42054',
        });

        // Create a public site
        const siteData = TestDataGenerator.generateSite(SITE_TYPES.PUBLIC);
        const createdSite = await appManagerApiFixture.siteManagementHelper.createSite({
          siteName: siteData.siteName,
          accessType: SITE_TYPES.PUBLIC,
          waitForSearchIndex: false,
        });

        // Create an event in the public site
        const eventName = TestDataGenerator.generateRandomText();
        const eventResponse = await appManagerApiFixture.contentManagementHelper.createEventWithCompleteResponse({
          siteId: createdSite.siteId,
          contentInfo: {
            contentType: 'event',
          },
          options: {
            eventName: eventName,
            contentDescription: 'Test event description',
            location: 'Test Location',
          },
        });

        // Validate the event response
        await contentApiHelper.validateEventCreation(eventResponse, eventName, createdSite.siteId);
      }
    );

    test(
      'validation App manager should be able to create Album in public site using API',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42053', ContentTestSuite.CONTENT_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validation App manager should be able to create Album in public site using API',
          zephyrTestId: 'CONT-42053',
          storyId: 'CONT-42053',
        });

        // Create a public site
        const siteData = TestDataGenerator.generateSite(SITE_TYPES.PUBLIC);
        const createdSite = await appManagerApiFixture.siteManagementHelper.createSite({
          siteName: siteData.siteName,
          accessType: SITE_TYPES.PUBLIC,
          waitForSearchIndex: false,
        });

        // Create an album in the public site
        const albumName = TestDataGenerator.generateRandomText();
        const albumResponse = await appManagerApiFixture.contentManagementHelper.createAlbumWithCompleteResponse({
          siteId: createdSite.siteId,
          imageName: 'beach.jpg',
          options: {
            albumName: albumName,
            contentDescription: 'Test album description',
          },
        });

        // Validate the album response
        await contentApiHelper.validateAlbumCreation(albumResponse, albumName, createdSite.siteId);
      }
    );
  }
);
