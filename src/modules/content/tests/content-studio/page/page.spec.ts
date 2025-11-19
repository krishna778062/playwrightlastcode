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

        // Step 1: Click on cover image section
        await pageCreationPage.actions.clickAddCoverImageIcon();

        // Step 2: Verify cover image toolbar options are visible
        await pageCreationPage.assertions.verifyToolbarIsVisible();

        // Step 3: Click on Edit cover option from toolbar
        await pageCreationPage.actions.clickEditCover();

        // Step 4: Verify Edit page cover panel is visible
        await pageCreationPage.assertions.verifyEditPageCoverPanelIsVisible();

        // Step 5: Click on Cover layout section to open layout options
        await pageCreationPage.actions.clickCoverLayoutSection();

        // Step 6: Verify layout options are visible
        await pageCreationPage.assertions.verifyLayoutOptionsAreVisible();

        // Step 7: Select "Background overlay" layout
        // Note: Selecting Background overlay enables the "Select color" tab
        await pageCreationPage.actions.selectBackgroundOverlayLayout();

        // Step 8: Click on Add image button in toolbar to open modal with tab options
        await pageCreationPage.actions.clickAddImage();

        // Step 9: Verify image upload modal with tabs appears (Upload, Browse, URL, Select Color, Unsplash)
        // Note: "Select color" tab is only visible when Background overlay layout is selected
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('Upload');
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('Select color');
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('Browse');
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('URL');
        await pageCreationPage.assertions.verifyCoverImageModalTabIsVisible('Unsplash');

        // Step 10: Click on Select color tab
        await pageCreationPage.actions.clickSelectColorTab();

        // Step 11: Verify color palette is visible
        await pageCreationPage.assertions.verifyColorPaletteIsVisible();

        // Step 12: Select a brand color from brand colors section (avoiding black color)
        await pageCreationPage.actions.selectBrandColor(0);

        // Step 13: Verify color is applied to cover area
        await pageCreationPage.assertions.verifyCoverColorIsApplied();

        // Step 14: Verify page title appears over the background color
        await pageCreationPage.assertions.verifyPageTitleOverCoverIsVisible();
      }
    );
  }
);
