import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { SiteDashboardPage } from '../../pages/siteDashboardPage';

import { SideNavBarComponent } from '@/src/core/components/sideNavBarComponent';
import { TopNavBarComponent } from '@/src/core/components/topNavBarComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/pages/applicationscreenPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { GovernanceScreenPage } from '@/src/modules/content/pages/governanceScreenPage';
import { ManageApplicationPage } from '@/src/modules/content/pages/manageApplicationPage';
import { ManageContentPage } from '@/src/modules/content/pages/manageContentPage';
import { ApplicationScreenPage as ManageFeature } from '@/src/modules/content/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { SiteDetailsPage } from '@/src/modules/content/pages/siteDetailsPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SiteDashboard } from '@/src/modules/integrations/pages/siteDashboard';

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
    let applicationscreen: ApplicationScreenPage;
    let manageFeaturePage: ManageFeature;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;
    let manageContentPage: ManageContentPage;
    let contentPreviewPage: ContentPreviewPage;
    let manageSitePage: ManageSitePage;
    let siteDetailsPage: SiteDetailsPage;
    let siteDashboardPage: SiteDashboardPage;

    test.beforeEach(async ({ appManagerHomePage, appManagersPage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      // pageRef = pageRef;

      homePage = new NewUxHomePage(appManagersPage);
      await homePage.verifyThePageIsLoaded();
      pageCreationPage = new PageCreationPage(appManagersPage);
      applicationscreen = new ApplicationScreenPage(appManagersPage);
      manageFeaturePage = new ManageFeature(appManagersPage);
      manageApplicationPage = new ManageApplicationPage(appManagersPage);
      governanceScreenPage = new GovernanceScreenPage(appManagersPage);
      manageContentPage = new ManageContentPage(appManagersPage);
      contentPreviewPage = new ContentPreviewPage(appManagersPage, '', '', '');
      manageSitePage = new ManageSitePage(appManagersPage, '');
      siteDetailsPage = new SiteDetailsPage(appManagersPage, '');
      siteDashboardPage = new SiteDashboardPage(appManagersPage, '');
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
        await homePage.actions.navigateToApplication();
        await applicationscreen.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.clickOnTimeline();
        await governanceScreenPage.actions.clickOnSave();
        await homePage.actions.clickOnManageFeature();
        await manageFeaturePage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnContent();
        await contentPreviewPage.actions.checkCommentOption();
        await homePage.actions.clickOnManageFeature();
        await manageFeaturePage.actions.clickOnSitesCard();
        await manageSitePage.actions.clickOnSite();
        await siteDetailsPage.actions.ViewSite();
        await siteDashboardPage.actions.verfiyFeedSection();
        await homePage.actions.clickOnHomeButton();
        await homePage.actions.clickOnFeedSideMenu();
        await siteDashboardPage.actions.verfiyFeedSection();
      }
    );
  }
);
