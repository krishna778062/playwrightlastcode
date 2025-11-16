import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { test } from '@/src/modules/employee-listening/fixtures/loginFixture';
import { PollsListeningPage } from '@/src/modules/employee-listening/pages/polls/pollsListingPage';
import { PollsSettingsPage } from '@/src/modules/employee-listening/pages/polls/pollsSettingsPage';

test.describe('polls Management Tests', () => {
  let pollsSettingsPage: PollsSettingsPage;

  test.beforeEach(async ({ appManagersPage }) => {
    pollsSettingsPage = new PollsSettingsPage(appManagersPage);

    await pollsSettingsPage.loadPage();
    await pollsSettingsPage.verifyThePageIsLoaded();
  });

  test(
    'verify Polls from Manage application setting',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS_MANAGEMENT', '@POLLS_VERIFICATION'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'verify Polls from Manage application setting',
        zephyrTestId: 'LS-7320',
        storyId: 'Polls Settings Management',
      });

      await pollsSettingsPage.verifyEnablePollsIsVisible();
      await pollsSettingsPage.verifyAIPollHeadingIsVisible();
      await pollsSettingsPage.verifyDisablePollsIsVisible();

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.verifyThePageIsLoaded();
    }
  );

  test(
    'disable AI Polls from Manage application setting',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS_MANAGEMENT', '@POLLS_ENABLE_DISABLE'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can disable Polls from Manage application settings',
        zephyrTestId: 'LS-7913',
        storyId: 'Polls Settings Management',
      });

      await pollsSettingsPage.togglePolls('enable', false);

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.verifyAIPollIsNotVisible();
    }
  );

  test(
    'navigate to the poll listing page from manage feature side panel',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify navigation to polls page via manage features side panel and confirm active state',
        zephyrTestId: 'LS-7337',
        storyId: 'EL-UI Automation',
      });
      const pollsListeningPage = new PollsListeningPage(appManagersPage);

      await pollsListeningPage.clickOnManageFeaturesSideNav();
      await pollsListeningPage.verifyManageFeatureSideNavIsActive();
      await pollsListeningPage.clickOnPollsSideNav();
      await pollsListeningPage.verifyThePageIsLoaded();
    }
  );

  test(
    'navigate to the poll listing page from EL with ABAC side panel',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify navigation to polls page via user mode side panel and confirm active state',
        zephyrTestId: 'LS-7337',
        storyId: 'EL-UI Automation',
      });
      const pollsListeningPage = new PollsListeningPage(appManagersPage);

      await pollsListeningPage.clickOnUserModeSideNav();
      await pollsListeningPage.verifyUserModeSideNavIsActive();
      await pollsListeningPage.clickOnPollsSideNav();
      await pollsListeningPage.verifyThePageIsLoaded();
    }
  );

  test(
    'verify admin can enable ai polls in manage application settings',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@AI_POLLS', '@POLLS_ENABLE_DISABLE'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can enable AI Polls in Manage application settings',
        zephyrTestId: 'LS-7321',
        storyId: 'Polls Settings Management',
      });

      await pollsSettingsPage.togglePolls('enable', true);

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.verifyAIPollIsVisible();
    }
  );

  test(
    'verify Polls page with polls and "Create poll" button',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@POLLS_PAGE_VALIDATION'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Validate the Polls page loads correctly and includes required elements',
        zephyrTestId: 'LS-7323',
        storyId: 'Polls Page Validation',
      });

      await pollsSettingsPage.togglePolls('enable', true);

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.createPollButton.isVisible();
      await pollsListeningPage.pollsPageValidation();
    }
  );

  test(
    'verify search polls functionality on the polls page',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@POLLS_SEARCH'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify the Search Polls functionality on the Polls page',
        zephyrTestId: 'LS-7332',
        storyId: 'Polls Search Functionality',
      });

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage({ stepInfo: 'Loading Polls page' });
      await pollsListeningPage.verifyThePageIsLoaded();
      await pollsListeningPage.searchPoll();
    }
  );
});
