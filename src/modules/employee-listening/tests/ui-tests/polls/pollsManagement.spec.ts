import { test } from '../../../fixtures/loginFixture';
import { PollsListeningPage } from '../../../pages/polls/pollsPage';
import { PollsSettingsPage } from '../../../pages/polls/pollsSettingsPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('polls Management Tests', () => {
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

      const pollsSettingsPage = new PollsSettingsPage(appManagersPage);

      // Navigate to Application settings > Application > Employee Listening tab
      await pollsSettingsPage.loadPage();
      await pollsSettingsPage.verifyThePageIsLoaded();

      await pollsSettingsPage.verifyEnablePollsIsVisible();
      await pollsSettingsPage.verifyAIPollHeadingIsVisible();
      await pollsSettingsPage.verifyDisablePollsIsVisible();

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.verifyThePageIsLoaded();

      console.log('✓ Polls settings verification completed successfully');
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

      const pollsSettingsPage = new PollsSettingsPage(appManagersPage);

      await pollsSettingsPage.loadPage();
      await pollsSettingsPage.verifyThePageIsLoaded();
      await pollsSettingsPage.togglePolls('enable', false);

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.verifyAIPollIsNotVisible();

      console.log('✓ Polls disable/enable functionality completed successfully');
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

      const pollsSettingsPage = new PollsSettingsPage(appManagersPage);
      await pollsSettingsPage.loadPage();
      await pollsSettingsPage.verifyThePageIsLoaded();
      await pollsSettingsPage.togglePolls('enable', true);

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.verifyAIPollIsVisible();
      console.log('✓ AI Polls enable functionality completed successfully');
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

      const pollsSettingsPage = new PollsSettingsPage(appManagersPage);
      await pollsSettingsPage.loadPage();
      await pollsSettingsPage.verifyThePageIsLoaded();
      await pollsSettingsPage.togglePolls('enable', true);

      const pollsListeningPage = new PollsListeningPage(appManagersPage);
      await pollsListeningPage.loadPage();
      await pollsListeningPage.createPollButton.isVisible();
      await pollsListeningPage.pollsPageValidation();

      console.log('✓ Polls page validation completed successfully');
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
      console.log('✓ Polls search functionality completed successfully');
    }
  );
});
