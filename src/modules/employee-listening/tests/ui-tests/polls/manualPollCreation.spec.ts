import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { test } from '@/src/modules/employee-listening/fixtures/loginFixture';
import { PollsHelper } from '@/src/modules/employee-listening/helpers';
import { AIPollCreationPage } from '@/src/modules/employee-listening/pages/polls/pollCreation';
import { PollsListeningPage } from '@/src/modules/employee-listening/pages/polls/pollsListingPage';
import { PollsSettingsPage } from '@/src/modules/employee-listening/pages/polls/pollsSettingsPage';

test.describe('manual Poll Creation Tests', () => {
  let pollsSettingsPage: PollsSettingsPage;
  let pollsListeningPage: PollsListeningPage;
  let aiPollCreationPage: AIPollCreationPage;
  let pollsHelper: PollsHelper;

  test.beforeEach(async ({ appManagersPage }) => {
    pollsSettingsPage = new PollsSettingsPage(appManagersPage);
    pollsListeningPage = new PollsListeningPage(appManagersPage);
    aiPollCreationPage = new AIPollCreationPage(appManagersPage);
    pollsHelper = new PollsHelper(pollsSettingsPage, pollsListeningPage, aiPollCreationPage);

    await pollsHelper.setupPollsConfiguration('enable', false);
  });

  test(
    'verify manual poll creation flow',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@MANUAL_POLL'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify complete manual poll creation flow: create poll with team event question, add options, select audience, post poll, verify confirmation toast, notification delivery, and poll visibility in polls list',
        zephyrTestId: 'LS-7421',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        pollQuestion: 'What is your favorite team event activity?',
        pollOptions: ['Escape Room', 'Cooking Class', 'Outdoor Adventure'],
        nextButton: true,
        selectTargetAudience: ['All Employees'],
        postButton: true,
      });

      await pollsListeningPage.verifyPollExistsInList('What is your favorite team event activity?');
    }
  );
});
