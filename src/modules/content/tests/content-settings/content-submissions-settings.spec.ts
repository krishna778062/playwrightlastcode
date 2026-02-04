import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GovernanceScreenPage } from '../../ui/pages/governanceScreenPage';
import { ManageSiteSetUpPage } from '../../ui/pages/manageSiteSetUpPage';
import { SiteCreationPage } from '../../ui/pages/siteCreationPage';
import { SiteDashboardPage } from '../../ui/pages/sitePages/siteDashboardPage';

test.describe(
  `Content submissions settings verification`,
  {
    tag: [ContentSuiteTags.ENABLE_DISABLE_CONTENT_SUBMISSIONS],
  },
  () => {
    let governanceScreenPage: GovernanceScreenPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
    });

    test(
      'Content submissions || ENABLED || Verify UI & functionality check mark button',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.ENABLE_DISABLE_CONTENT_SUBMISSIONS, '@CONT-42889'],
      },
      async ({}) => {
        tagTest(test.info(), {
          description:
            'Verify behavior of Enable "Content Submissions" option under "Application settings → Application → Setup → Governance" is displayed',
          zephyrTestId: 'CONT-42889',
          storyId: 'CONT-42889',
        });

        // Step 1: Login with an "App Manager" (handled by fixture)
        // Step 2: Navigate to "Application settings → Application → Setup → Governance"
        await governanceScreenPage.loadPage();
        await governanceScreenPage.verifyThePageIsLoaded();

        // Step 3: Verify that New UI of "Content Submissions" is displayed
        await governanceScreenPage.verifyContentSubmissionsUI();

        // Step 4: Verify that description contains the statement
        await governanceScreenPage.verifyContentSubmissionsDescription();

        // Step 5: Verify Radio buttons of Enable and Disabled is displayed
        await governanceScreenPage.verifyContentSubmissionsRadioButtons();
      }
    );

    test(
      'Content submissions || Site Setup || Verify Content Submissions toggle in site creation',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.ENABLE_DISABLE_CONTENT_SUBMISSIONS, '@CONT-42891'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Content Submissions toggle is displayed and functional in site creation page under "Content & landing page" section',
          zephyrTestId: 'CONT-42891',
          storyId: 'CONT-42891',
        });

        // Ensure contentSubmissionsEnabled is set to true via API
        await appManagerFixture.feedManagementHelper.ensureContentSubmissionsFlag(true);

        // Step 1: Navigate to Create button > Site > Add site
        const siteCreationPageResult = await appManagerFixture.navigationHelper.openSiteCreationForm(false, {
          stepInfo: 'Navigate to site creation page',
        });

        // Type guard: ensure we have SiteCreationPage (not SiteCreationPage)
        if (!(siteCreationPageResult instanceof SiteCreationPage)) {
          throw new Error(
            'Expected SiteCreationPage but got SiteCreationPageAbac. This test requires non-ABAC site creation page.'
          );
        }
        const siteCreationPage = siteCreationPageResult;

        // Step 2: Verify that under "Content & landing page" the "Content Submissions" toggle is displayed
        await siteCreationPage.verifyContentSubmissionsToggleIsDisplayed();

        // Step 3: Verify user is able to toggle (ON-OFF) "Content Submissions"
        await siteCreationPage.verifyContentSubmissionsToggleFunctionality();

        // Step 4: Ensure toggle is ON for the next verifications
        const isToggleOn = await siteCreationPage.contentSubmissionsToggle.isChecked();
        if (!isToggleOn) {
          await siteCreationPage.clickOnElement(siteCreationPage.contentSubmissionsToggle);
          // Wait for toggle to be checked
          await siteCreationPage.verifier.verifyTheElementIsChecked(siteCreationPage.contentSubmissionsToggle, {
            assertionMessage: 'Content Submissions toggle should be ON',
            timeout: 5000,
          });
        }

        // Step 5: Verify "Who can submit content" edit option is non-interactable
        await siteCreationPage.verifyWhoCanSubmitContentEditIsDisabled();

        // Step 6: Verify "Who can submit content" edit option displays tooltip on hover
        await siteCreationPage.verifySubmissionProcessTooltip(
          "Submission process settings aren't available until target audience changes are saved"
        );

        // Step 7: Verify "Approval process" edit option displays tooltip on hover
        await siteCreationPage.verifyApprovalProcessTooltip(
          "Approval process settings aren't available until target audience changes are saved"
        );
      }
    );

    test(
      'Content submissions || Manage Site Setup || Verify Content Submissions toggle in existing site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.ENABLE_DISABLE_CONTENT_SUBMISSIONS, '@CONT-42892'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Content Submissions toggle is displayed and functional in manage site setup page under "Content, questions & landing page" section',
          zephyrTestId: 'CONT-42892',
          storyId: 'CONT-42892',
        });

        // Ensure contentSubmissionsEnabled is set to true via API
        await appManagerFixture.feedManagementHelper.ensureContentSubmissionsFlag(true);

        // Create a page and make a comment on it (as Admin)
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public', {
          waitForSearchIndex: false,
        });

        // Step 2: Load the site dashboard on UI
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteDetails.siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifyThePageIsLoaded();

        // Step 3: Click on "Manage site" button
        await siteDashboardPage.navigateToManageSite();

        // Step 4: Navigate to Setup tab (if not already there)
        const manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, siteDetails.siteId);
        await manageSiteSetUpPage.loadPage();
        await manageSiteSetUpPage.verifyThePageIsLoaded();

        // Step 6: Verify user is able to toggle (ON-OFF) "Content Submissions"
        await manageSiteSetUpPage.verifyContentSubmissionsToggleFunctionality();

        // Step 7: Ensure toggle is ON for the next verifications
        const isToggleOn = await manageSiteSetUpPage.contentSubmissionsToggle.isChecked();
        if (!isToggleOn) {
          await manageSiteSetUpPage.clickOnElement(manageSiteSetUpPage.contentSubmissionsToggle);
          // Wait for toggle to be checked
          await manageSiteSetUpPage.verifier.verifyTheElementIsChecked(manageSiteSetUpPage.contentSubmissionsToggle, {
            assertionMessage: 'Content Submissions toggle should be ON',
            timeout: 5000,
          });
        }

        // Step 9: Verify "Who can submit content" edit option displays tooltip on hover
        await manageSiteSetUpPage.verifySubmissionProcessTooltip(
          "Submission process settings aren't available until target audience changes are saved"
        );

        // Step 10: Verify "Approval process" edit option displays tooltip on hover
        await manageSiteSetUpPage.verifyApprovalProcessTooltip(
          "Approval process settings aren't available until target audience changes are saved",
          true
        );
      }
    );
  }
);
