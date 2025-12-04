import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { CarouselApiHelper } from '@/src/modules/content/apis/apiValidation/carouselApiHelper';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  '@Home Carousel API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let carouselApiHelper: CarouselApiHelper;

    test.beforeEach(async () => {
      carouselApiHelper = new CarouselApiHelper();
    });

    test(
      'app manager can enable and disable home carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.HOME_DASHBOARD, '@CCONT-42874'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can enable and disable home carousel',
          zephyrTestId: 'CONT-42874',
          storyId: 'CONT-42874',
        });

        // Enable home carousel
        const enableResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeCarouselEnabled: true,
        });
        await carouselApiHelper.validateAppGovernanceResponse(enableResponse);

        // Verify carousel is enabled with retry
        await carouselApiHelper.validateHomeCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Disable home carousel
        const disableResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeCarouselEnabled: false,
        });
        await carouselApiHelper.validateAppGovernanceResponse(disableResponse);

        // Verify carousel is disabled with retry
        await carouselApiHelper.validateHomeCarouselDisabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );
      }
    );

    test(
      'app manager can add and remove Page content from home carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.HOME_DASHBOARD, '@CONT-42875'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can add and remove content from home carousel',
          zephyrTestId: 'CONT-42875',
          storyId: 'CONT-42875',
        });

        // Enable home carousel
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeCarouselEnabled: true,
        });

        // Verify carousel is enabled before proceeding
        await carouselApiHelper.validateHomeCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Get existing content for carousel
        const contentInfo = await appManagerApiFixture.contentManagementHelper.getContentId({
          accessType: SITE_TYPES.PUBLIC,
          status: 'published',
        });

        // Add content to carousel
        const addResponse = await appManagerApiFixture.carouselHelper.addHomeCarouselItem(contentInfo.contentId);
        await carouselApiHelper.validateCarouselItemAddResponse(addResponse);

        // Verify content is in carousel
        const carouselItems = await appManagerApiFixture.carouselHelper.getHomeCarouselItems();
        await carouselApiHelper.validateCarouselItemInList(carouselItems, contentInfo.contentId);

        // Remove content from carousel
        const carouselItem = carouselItems.result.listOfItems.find(
          (item: any) => item.item?.id === contentInfo.contentId
        );
        const deleteResponse = await appManagerApiFixture.carouselHelper.carouselService.deleteHomeCarouselItem(
          carouselItem.carouselItemId
        );
        await carouselApiHelper.validateCarouselItemDeletionResponse(deleteResponse);

        // Verify content is removed from carousel
        const updatedCarouselItems = await appManagerApiFixture.carouselHelper.getHomeCarouselItems();
        await carouselApiHelper.validateCarouselItemNotInList(updatedCarouselItems, contentInfo.contentId);
      }
    );

    test(
      'app manager can add and remove event content from home carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.HOME_DASHBOARD, '@CONT-5393'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can add and remove event content from home carousel',
          zephyrTestId: 'CONT-5393',
          storyId: 'CONT-5393',
        });

        // Enable home carousel
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeCarouselEnabled: true,
        });

        // Verify carousel is enabled before proceeding
        await carouselApiHelper.validateHomeCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Get existing site for event creation
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Create event content
        const eventInfo = await appManagerApiFixture.contentManagementHelper.createEvent({
          siteId: siteId,
          contentInfo: {
            contentType: 'event',
          },
          options: {
            eventName: TestDataGenerator.generateRandomString('CarouselEvent'),
            contentDescription: 'Test event for carousel',
            location: 'Test Location',
            waitForSearchIndex: false,
          },
        });

        // Add event to carousel
        const addResponse = await appManagerApiFixture.carouselHelper.addHomeCarouselItem(eventInfo.contentId);
        await carouselApiHelper.validateCarouselItemAddResponse(addResponse);

        // Verify event is in carousel
        const carouselItems = await appManagerApiFixture.carouselHelper.getHomeCarouselItems();
        await carouselApiHelper.validateCarouselItemInList(carouselItems, eventInfo.contentId);

        // Remove event from carousel
        const carouselItem = carouselItems.result.listOfItems.find(
          (item: any) => item.item?.id === eventInfo.contentId
        );
        const deleteResponse = await appManagerApiFixture.carouselHelper.carouselService.deleteHomeCarouselItem(
          carouselItem.carouselItemId
        );
        await carouselApiHelper.validateCarouselItemDeletionResponse(deleteResponse);

        // Verify event is removed from carousel
        const updatedCarouselItems = await appManagerApiFixture.carouselHelper.getHomeCarouselItems();
        await carouselApiHelper.validateCarouselItemNotInList(updatedCarouselItems, eventInfo.contentId);
      }
    );

    test(
      'app manager can add and remove album content from home carousel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.HOME_DASHBOARD, '@CONT-10863'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App Manager can add and remove album content from home carousel',
          zephyrTestId: 'CONT-10863',
          storyId: 'CONT-10863',
        });

        // Enable home carousel
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeCarouselEnabled: true,
        });

        // Verify carousel is enabled before proceeding
        await carouselApiHelper.validateHomeCarouselEnabled(() =>
          appManagerApiFixture.feedManagementHelper.getAppConfig()
        );

        // Get existing site for album creation
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Create album content
        const albumInfo = await appManagerApiFixture.contentManagementHelper.createAlbum({
          siteId: siteId,
          imageName: 'beach.jpg',
          options: {
            albumName: TestDataGenerator.generateRandomString('CarouselAlbum'),
            contentDescription: 'Test album for carousel',
            waitForSearchIndex: false,
          },
        });

        // Add album to carousel
        const addResponse = await appManagerApiFixture.carouselHelper.addHomeCarouselItem(albumInfo.contentId);
        await carouselApiHelper.validateCarouselItemAddResponse(addResponse);

        // Verify album is in carousel
        const carouselItems = await appManagerApiFixture.carouselHelper.getHomeCarouselItems();
        await carouselApiHelper.validateCarouselItemInList(carouselItems, albumInfo.contentId);

        // Remove album from carousel
        const carouselItem = carouselItems.result.listOfItems.find(
          (item: any) => item.item?.id === albumInfo.contentId
        );
        const deleteResponse = await appManagerApiFixture.carouselHelper.carouselService.deleteHomeCarouselItem(
          carouselItem.carouselItemId
        );
        await carouselApiHelper.validateCarouselItemDeletionResponse(deleteResponse);

        // Verify album is removed from carousel
        const updatedCarouselItems = await appManagerApiFixture.carouselHelper.getHomeCarouselItems();
        await carouselApiHelper.validateCarouselItemNotInList(updatedCarouselItems, albumInfo.contentId);
      }
    );
  }
);
