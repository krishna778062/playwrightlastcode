import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { CarouselApiHelper } from '@/src/modules/content/apis/apiValidation/carouselApiHelper';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  '@Site Carousel API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let carouselApiHelper: CarouselApiHelper;

    test.beforeEach(async () => {
      carouselApiHelper = new CarouselApiHelper();
    });

    test(
      'app manager can enable and disable site carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.TILES, '@CONT-42894'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can enable and disable site carousel',
          zephyrTestId: 'CONT-42894',
          storyId: 'CONT-42894',
        });

        // Get existing site
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Enable site carousel
        const enableResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteCarouselEnabled: true,
        });
        await carouselApiHelper.validateAppGovernanceResponse(enableResponse);

        // Verify site carousel is enabled with retry
        await carouselApiHelper.validateSiteCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Disable site carousel
        const disableResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteCarouselEnabled: false,
        });
        await carouselApiHelper.validateAppGovernanceResponse(disableResponse);

        // Verify site carousel is disabled with retry
        await carouselApiHelper.validateSiteCarouselDisabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );
      }
    );

    test(
      'app manager can add and remove page content from site carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.TILES, '@CONT-42895'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can add and remove page content from site carousel',
          zephyrTestId: 'CONT-42895',
          storyId: 'CONT-42895',
        });

        // Enable site carousel
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteCarouselEnabled: true,
        });

        // Verify site carousel is enabled before proceeding
        await carouselApiHelper.validateSiteCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Get existing site
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Get existing content for carousel
        const contentInfo = await appManagerApiFixture.contentManagementHelper.getContentId({
          accessType: SITE_TYPES.PUBLIC,
          status: 'published',
        });

        // Add content to site carousel
        const addResponse = await appManagerApiFixture.carouselHelper.addSiteCarouselItem(
          siteId,
          contentInfo.contentId
        );
        await carouselApiHelper.validateCarouselItemAddResponse(addResponse);

        // Verify content is in site carousel
        const carouselItems = await appManagerApiFixture.carouselHelper.getSiteCarouselItems(siteId);
        await carouselApiHelper.validateCarouselItemInList(carouselItems, contentInfo.contentId);

        // Remove content from site carousel
        const carouselItem = carouselItems.result.listOfItems.find(
          (item: any) => item.item?.id === contentInfo.contentId
        );
        const deleteResponse = await appManagerApiFixture.carouselHelper.carouselService.deleteSiteCarouselItem(
          siteId,
          carouselItem.carouselItemId
        );
        await carouselApiHelper.validateCarouselItemDeletionResponse(deleteResponse);

        // Verify content is removed from site carousel
        const updatedCarouselItems = await appManagerApiFixture.carouselHelper.getSiteCarouselItems(siteId);
        await carouselApiHelper.validateCarouselItemNotInList(updatedCarouselItems, contentInfo.contentId);
      }
    );

    test(
      'app manager can add and remove event content from site carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.TILES, '@CONT-42896'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can add and remove event content from site carousel',
          zephyrTestId: 'CONT-42896',
          storyId: 'CONT-42896',
        });

        // Enable site carousel
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteCarouselEnabled: true,
        });

        // Verify site carousel is enabled before proceeding
        await carouselApiHelper.validateSiteCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Get existing site
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Create event content
        const eventInfo = await appManagerApiFixture.contentManagementHelper.createEvent({
          siteId: siteId,
          contentInfo: {
            contentType: 'event',
          },
          options: {
            eventName: TestDataGenerator.generateRandomString('SiteCarouselEvent'),
            contentDescription: 'Test event for site carousel',
            location: 'Test Location',
            waitForSearchIndex: false,
          },
        });

        // Add event to site carousel
        const addResponse = await appManagerApiFixture.carouselHelper.addSiteCarouselItem(siteId, eventInfo.contentId);
        await carouselApiHelper.validateCarouselItemAddResponse(addResponse);

        // Verify event is in site carousel
        const carouselItems = await appManagerApiFixture.carouselHelper.getSiteCarouselItems(siteId);
        await carouselApiHelper.validateCarouselItemInList(carouselItems, eventInfo.contentId);

        // Remove event from site carousel
        const carouselItem = carouselItems.result.listOfItems.find(
          (item: any) => item.item?.id === eventInfo.contentId
        );
        const deleteResponse = await appManagerApiFixture.carouselHelper.carouselService.deleteSiteCarouselItem(
          siteId,
          carouselItem.carouselItemId
        );
        await carouselApiHelper.validateCarouselItemDeletionResponse(deleteResponse);

        // Verify event is removed from site carousel
        const updatedCarouselItems = await appManagerApiFixture.carouselHelper.getSiteCarouselItems(siteId);
        await carouselApiHelper.validateCarouselItemNotInList(updatedCarouselItems, eventInfo.contentId);
      }
    );

    test(
      'app manager can add and remove album content from site carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.TILES, '@CONT-42897'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can add and remove album content from site carousel',
          zephyrTestId: 'CONT-42897',
          storyId: 'CONT-42897',
        });

        // Enable site carousel
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteCarouselEnabled: true,
        });

        // Verify site carousel is enabled before proceeding
        await carouselApiHelper.validateSiteCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Get existing site
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Create album content
        const albumInfo = await appManagerApiFixture.contentManagementHelper.createAlbum({
          siteId: siteId,
          imageName: 'beach.jpg',
          options: {
            albumName: TestDataGenerator.generateRandomString('SiteCarouselAlbum'),
            contentDescription: 'Test album for site carousel',
            waitForSearchIndex: false,
          },
        });

        // Add album to site carousel
        const addResponse = await appManagerApiFixture.carouselHelper.addSiteCarouselItem(siteId, albumInfo.contentId);
        await carouselApiHelper.validateCarouselItemAddResponse(addResponse);

        // Verify album is in site carousel
        const carouselItems = await appManagerApiFixture.carouselHelper.getSiteCarouselItems(siteId);
        await carouselApiHelper.validateCarouselItemInList(carouselItems, albumInfo.contentId);

        // Remove album from site carousel
        const carouselItem = carouselItems.result.listOfItems.find(
          (item: any) => item.item?.id === albumInfo.contentId
        );
        const deleteResponse = await appManagerApiFixture.carouselHelper.carouselService.deleteSiteCarouselItem(
          siteId,
          carouselItem.carouselItemId
        );
        await carouselApiHelper.validateCarouselItemDeletionResponse(deleteResponse);

        // Verify album is removed from site carousel
        const updatedCarouselItems = await appManagerApiFixture.carouselHelper.getSiteCarouselItems(siteId);
        await carouselApiHelper.validateCarouselItemNotInList(updatedCarouselItems, albumInfo.contentId);
      }
    );
  }
);
