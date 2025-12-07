import { ACTIVITIES } from '@modules/comms-planner/constants/activity';
import { test } from '@modules/comms-planner/fixtures/loginFixture';
import { create } from '@modules/comms-planner/helpers/content';
import { CalendarPage } from '@modules/comms-planner/pages/calendar/calendarPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('calendar', () => {
  let calendarPage: CalendarPage;

  test.beforeEach(async ({ appManagersPage }) => {
    calendarPage = new CalendarPage(appManagersPage);

    await calendarPage.loadPage({ stepInfo: 'Loading comms planner - calendar page' });
    await calendarPage.verifyThePageIsLoaded();
  });

  test(
    'verify activity modal',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@ACTIVITY_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify activity modal',
        zephyrTestId: '',
        storyId: '',
      });

      await calendarPage.clickAddActivityButton();
      await calendarPage.verifyOpenedActivityModal();
    }
  );

  test(
    'create new activities',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@ACTIVITY_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerApiFixture }) => {
      tagTest(test.info(), {
        description: 'Create a new activity',
        zephyrTestId: '',
        storyId: '',
      });

      for (const activity of ACTIVITIES) {
        const content = await create(appManagerApiFixture, activity);

        activity.content.id = content.contentId;

        await calendarPage.clickAddActivityButton();
        await calendarPage.verifyOpenedActivityModal();

        await calendarPage.addActivityName(activity.title);
        await calendarPage.addActivityDescription(activity.description);

        /**
         * Remove later!
         */
        await calendarPage.clickCancelActivityModalButton();
      }
    }
  );
});
