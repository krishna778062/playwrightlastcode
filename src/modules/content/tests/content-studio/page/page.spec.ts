import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { ContentStudioPageCreationPage } from '@content/ui/pages/contentStudioPageCreationPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  `page Creation by Application Manager - Content Studio`,
  {
    tag: [ContentTestSuite.PAGE_APP_MANAGER, ContentSuiteTags.PAGE_CREATION],
  },
  () => {
    test.skip(process.env.TEST_ENV !== 'test', 'Content Studio tests are only supported in test environment');

    let pageCreationPage: ContentStudioPageCreationPage;
    test.beforeEach('Setting up the test environment for page creation', async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();
    });

    test(
      'verify Open the "Add Cover Image" modal in page editor',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.REGRESSION,
          ContentSuiteTags.PAGE_CREATION,
          '@CONT-39618',
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Open the "Add Cover Image" modal in page editor',
          zephyrTestId: 'CONT-39618',
          storyId: 'CONT-39618',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();

        pageCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE,
          { isFromStudio: true }
        )) as ContentStudioPageCreationPage;
        await pageCreationPage.verifyThePageIsLoaded();
        await pageCreationPage.clickAddCoverImageIcon();
        await pageCreationPage.verifyCoverImageModalTabIsVisible('Upload');
        await pageCreationPage.verifyCoverImageModalTabIsVisible('Browse');
        await pageCreationPage.verifyCoverImageModalTabIsVisible('URL');
        await pageCreationPage.verifyCoverImageModalTabIsVisible('Unsplash');
      }
    );

    test(
      'verify admin can set cover image using Browse tab (CONT-39635)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentSuiteTags.PAGE_CREATION,
          '@CONT-39635',
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify admin can set cover image using Browse tab in Content Studio',
          zephyrTestId: 'CONT-39635',
          storyId: 'CONT-39635',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();

        pageCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE,
          { isFromStudio: true }
        )) as ContentStudioPageCreationPage;

        await pageCreationPage.verifyThePageIsLoaded();
        await pageCreationPage.clickAddCoverImageIcon();
        await pageCreationPage.clickOnOptionsButtonAndSelectAddCoverImageTab('Browse');
        await pageCreationPage.verifyopenMediaManagerDialogIsVisible();
        await pageCreationPage.clickOnopenMediaManagerDialog();
        await pageCreationPage.selectAndAttachImageFromMediaManager();
        await pageCreationPage.verifyUploadedCoverImagePreviewIsVisible();
      }
    );

    test(
      'verify admin can apply background overlay color on cover area (CONT-40980)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentSuiteTags.PAGE_CREATION,
          '@CONT-40980',
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify admin can apply background overlay color on cover area',
          zephyrTestId: 'CONT-40980',
          storyId: 'CONT-40980',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();

        pageCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE,
          { isFromStudio: true }
        )) as ContentStudioPageCreationPage;

        await pageCreationPage.verifyThePageIsLoaded();

        await pageCreationPage.clickAddCoverImageIcon();
        await pageCreationPage.verifyToolbarIsVisible();
        await pageCreationPage.clickEditCover();
        await pageCreationPage.verifyEditPageCoverPanelIsVisible();
        await pageCreationPage.clickCoverLayoutSection();
        await pageCreationPage.verifyLayoutOptionsAreVisible();
        await pageCreationPage.selectBackgroundOverlayLayout();
        await pageCreationPage.clickAddImage();

        await pageCreationPage.verifyAllCoverImageModalTabsAreVisible();

        await pageCreationPage.clickSelectColorTab();
        await pageCreationPage.verifyColorPaletteIsVisible();
        await pageCreationPage.selectBrandColor(0);
        await pageCreationPage.verifyCoverColorIsApplied();
        await pageCreationPage.verifyPageTitleOverCoverIsVisible();
      }
    );
  }
);
