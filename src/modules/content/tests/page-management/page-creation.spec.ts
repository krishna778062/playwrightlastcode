import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { SideNavBarComponent } from '@/src/core/components/sideNavBarComponent';
import { TopNavBarComponent } from '@/src/core/components/topNavBarComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreen } from '@/src/modules/content/pages/applicationscreen';
import { ApplicationScreen as ManageFeature } from '@/src/modules/content/pages/manageFeaturesPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentSuiteTags.PAGE_CREATION,
  {
    tag: [ContentSuiteTags.PAGE_CREATION],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let publishedPageId: string;
    let siteIdToPublishPage: string;
    let pageRef: Page;
    let homePage: NewUxHomePage;
    let applicationscreen: ApplicationScreen;
    let manageFeaturePage: ManageFeature;

    test.beforeEach(async ({ page, loginAs }) => {
      // Login as app manager using loginAs
      await loginAs('appManager');
      pageRef = page;

      homePage = new NewUxHomePage(page);
      await homePage.verifyThePageIsLoaded();
      pageCreationPage = new PageCreationPage(pageRef);
      applicationscreen = new ApplicationScreen(pageRef);
      manageFeaturePage = new ManageFeature(pageRef);
    });

    test.afterEach(async ({ appManagerApiClient }) => {
      //delete the published page only if the page is published
      if (publishedPageId) {
        console.log('site id to publish page', siteIdToPublishPage);
        console.log('content id to delete', publishedPageId);
        await appManagerApiClient.getContentManagementService().deleteContent(siteIdToPublishPage, publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }
    });

    test(
      'Verify admin is able to publish a new page created with cover image',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });
        await homePage.verifyThePageIsLoaded();
        pageCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.PAGE
        )) as PageCreationPage;
        const title = `Automated Test Page ${faker.company.name()} - ${faker.commerce.productName()}`;
        const description = `This is an automated test description ${faker.lorem.paragraph()}`;

        // Use the new wrapper method to create and publish the page
        const { pageId, siteId } = await pageCreationPage.actions.createAndPublishPage({
          title,
          description,
          category: 'uncategorized',
          contentType: PageContentType.NEWS,
          coverImage: {
            fileName: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
            cropOptions: {
              widescreen: false,
              square: false,
            },
          },
        });

        //store the page id
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;

        //handle the promotion
        await pageCreationPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await pageCreationPage.assertions.verifyContentPublishedSuccessfully(title);
      }
    );
    test(
      'Verify feed and comment should not be displayed when feed and comments are disabled app level',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.VERIFY_COMMENTS_AND_FEEDS],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify feed and comment should not be displayed when feed and comments are disabled app level',
          zephyrTestId: 'CONT-26613',
          storyId: 'CONT-26613',
        });
        await homePage.navigateToApplication();
        await applicationscreen.clickOnApplication();
        await pageCreationPage.clickOnGovernance();
        await pageCreationPage.clickOnTimeline();
        await pageCreationPage.clickOnSave();
        await homePage.clickOnManageFeature();
        await manageFeaturePage.clickOnContentCard();
        await pageCreationPage.clickOnContent();
        await pageCreationPage.checkCommentOption();
        await homePage.clickOnManageFeature();
        await manageFeaturePage.clickOnSitesCard();
        await pageCreationPage.clickOnSite();
        await pageCreationPage.ViewSite();
        await pageCreationPage.clickOnFeed();
        await pageCreationPage.verfiyFeedSection();
        await homePage.clickOnContQA();
        await homePage.clickOnFeedSideMenu();
        await pageCreationPage.verfiyFeedSection();
      }
    );
  }
);
