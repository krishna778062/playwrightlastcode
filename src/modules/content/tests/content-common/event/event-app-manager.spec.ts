import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { EventCreationPage } from '@content/ui/pages/eventCreationPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { AddContentModalComponent } from '@/src/modules/content/ui/components/addContentModal';
import { CreateComponent } from '@/src/modules/content/ui/components/createComponent';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
// import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentTestSuite.EVENT_APP_MANAGER,
  {
    tag: [ContentTestSuite.EVENT_APP_MANAGER],
  },
  () => {
    let eventCreationPage: EventCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let sideNavBarComponent: SideNavBarComponent;
    let createComponent: CreateComponent;
    let addContentModal: AddContentModalComponent;
    let manageFeaturesPage: ManageFeaturesPage;
    let manageContentPage: ManageContentPage;
    let siteIdToPublishEvent: string;
    let publishedEventId: string;
    let manualCleanupNeeded = false;

    test.beforeEach('Setting up the test environment for event creation', async ({ appManagerFixture }) => {
      // Create home page instance and verify it's loaded
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      sideNavBarComponent = new SideNavBarComponent(appManagerFixture.page);
      createComponent = new CreateComponent(appManagerFixture.page);
      addContentModal = new AddContentModalComponent(appManagerFixture.page);
      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      eventCreationPage = new EventCreationPage(appManagerFixture.page);
      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach(async ({ appManagerFixture }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedEventId && siteIdToPublishEvent) {
        await appManagerFixture.contentManagementHelper.deleteContent(siteIdToPublishEvent, publishedEventId);
        console.log('Manual cleanup completed for event:', publishedEventId);
      } else {
        console.log('No event was published, hence skipping the deletion');
      }
    });

    test(
      'event Content Add attach file with all the Mandatory fields',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.EVENT_CREATION, '@healthcheck', '@CONT-10824'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Event Content Add attach file with all the Mandatory fields',
          zephyrTestId: 'CONT-10824',
          storyId: 'CONT-10824',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        eventCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.EVENT
        )) as EventCreationPage;
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteIdToPublishEvent,
          publishedEventId,
          ContentType.EVENT
        );

        // Generate event data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const eventCreationOptions = TestDataGenerator.generateEvent(imagePath);

        // Create and publish the event
        const { eventId, siteId } = await eventCreationPage.actions.createAndPublishEvent(eventCreationOptions);

        // Store IDs for cleanup
        publishedEventId = eventId;
        siteIdToPublishEvent = siteId;
        manualCleanupNeeded = true;

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          eventCreationOptions.title,
          "Created event successfully - it's published"
        );

        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();
      }
    );
    test(
      'to verify language dropdown in event creation & updation',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.LANGUAGE_IN_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'to verify language dropdown in event creation & updation',
          zephyrTestId: 'CONT-30648',
          storyId: 'CONT-30648',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await sideNavBarComponent.clickOnCreateButton();
        await createComponent.selectContentTypeAndCreateContent(ContentType.EVENT);
        await addContentModal.selectSiteFromDropdown('All Employees');
        await addContentModal.clickAddButton();
        await eventCreationPage.assertions.verifyLanguageDropdown();

        // creating event through API
        const allEmployeesSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName('All Employees');
        const eventName = CONTENT_TEST_DATA.DEFAULT_EVENT_CONTENT.title;
        const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
          siteId: allEmployeesSiteId,
          contentInfo: {
            contentType: 'event',
          },
          options: {
            eventName: eventName,
            contentDescription: 'This is a test event description',
            location: 'Delhi, India',
          },
        });

        console.log(
          `Created event via API: ${eventName} with ID: ${eventInfo.contentId} in All Employees site: ${allEmployeesSiteId}`
        );

        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.writeRandomTextInSearchBar(eventName);
        await manageContentPage.actions.clickSearchIcon();
        await manageContentPage.actions.clickOnEditButton();
        await eventCreationPage.verifyLanguageDropdown();
      }
    );
  }
);
