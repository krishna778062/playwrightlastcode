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
        await pageCreationPage.assertions.verifyThePageIsLoaded();
        await pageCreationPage.actions.clickAddCoverImageIcon();
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('Upload');
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('Browse');
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('URL');
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('Unsplash');
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

        await pageCreationPage.assertions.verifyThePageIsLoaded();
        await pageCreationPage.actions.clickAddCoverImageIcon();
        await pageCreationPage.actions.clickOnOptionsButtonAndSelectAddCoverImageTab('Browse');
        await pageCreationPage.assertions.verifyopenMediaManagerDialogIsVisible();
        await pageCreationPage.actions.clickOnopenMediaManagerDialog();
        await pageCreationPage.actions.selectAndAttachImageFromMediaManager();
        await pageCreationPage.assertions.verifyUploadedCoverImagePreviewIsVisible();
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

        await pageCreationPage.assertions.verifyThePageIsLoaded();

        await pageCreationPage.actions.clickAddCoverImageIcon();
        await pageCreationPage.assertions.verifyToolbarIsVisible();
        await pageCreationPage.actions.clickEditCover();
        await pageCreationPage.assertions.verifyEditPageCoverPanelIsVisible();
        await pageCreationPage.actions.clickCoverLayoutSection();
        await pageCreationPage.assertions.verifyLayoutOptionsAreVisible();
        await pageCreationPage.actions.selectBackgroundOverlayLayout();
        await pageCreationPage.actions.clickAddImage();

        await pageCreationPage.assertions.verifyAllCoverImageModalTabsAreVisible();

        await pageCreationPage.actions.clickSelectColorTab();
        await pageCreationPage.assertions.verifyColorPaletteIsVisible();
        await pageCreationPage.actions.selectBrandColor(0);
        await pageCreationPage.assertions.verifyCoverColorIsApplied();
        await pageCreationPage.assertions.verifyPageTitleOverCoverIsVisible();
      }
    );
  }
);
