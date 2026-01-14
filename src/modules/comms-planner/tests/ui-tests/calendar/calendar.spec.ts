import { ACTIVITIES } from '@modules/comms-planner/constants/activity';
import { CUSTOM_FIELD_TYPES } from '@modules/comms-planner/constants/constant';
import { CUSTOM_FIELD_META } from '@modules/comms-planner/constants/customField';
import { test } from '@modules/comms-planner/fixtures/loginFixture';
import { verifyCustomFieldInActivity } from '@modules/comms-planner/helpers/calendar';
import { create } from '@modules/comms-planner/helpers/content';
import { createCustomField, deleteCustomField, editCustomField } from '@modules/comms-planner/helpers/customField';
import { gotoCustomFieldPage } from '@modules/comms-planner/helpers/page';
import { CalendarPage } from '@modules/comms-planner/pages/calendar/calendarPage';

import { CustomFieldsPage } from '../../../pages/customizations/customFieldsPage';

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

        await calendarPage.selectContentType(activity.content.type);
        await calendarPage.clickOnConnectToContentButton();

        /**
         * Remove later!
         */
        await calendarPage.clickCancelActivityModalButton();
      }
    }
  );
});

test.describe('Custom field check in activities', () => {
  let customFieldsPage: CustomFieldsPage;
  let calendarPage: CalendarPage;

  test.beforeEach(async ({ appManagersPage }) => {
    customFieldsPage = new CustomFieldsPage(appManagersPage);
    calendarPage = new CalendarPage(appManagersPage);
  });

  for (const entity of [CUSTOM_FIELD_TYPES.TEXT, CUSTOM_FIELD_TYPES.TEXTAREA]) {
    test(
      `verify custom field presence in activities | ${entity}`,
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@COMMS-PLANNER',
          '@CUSTOM-FIELDS_COMMS-PLANNER',
          TestGroupType.HEALTHCHECK,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: `Verify custom field ${entity} in activities`,
          zephyrTestId: '',
          storyId: '',
        });

        await gotoCustomFieldPage(customFieldsPage);

        const meta = CUSTOM_FIELD_META.get(entity)!.CREATE;
        const editMeta = CUSTOM_FIELD_META.get(entity)!.EDIT;

        for (const addLocation of [true]) {
          const config = {
            addLocation,
          };

          await createCustomField(customFieldsPage, meta, config);

          /**
           * Go to calendar page and verify above created custom field
           */
          await verifyCustomFieldInActivity(calendarPage, meta);

          /**
           * Go to the customization page and edit the custom field and go back to calendar page for verification
           */
          await gotoCustomFieldPage(customFieldsPage);
          await editCustomField(customFieldsPage, meta, config);

          /**
           * Go to calendar page and verify above created custom field
           */
          await verifyCustomFieldInActivity(calendarPage, editMeta);

          await gotoCustomFieldPage(customFieldsPage);
          await deleteCustomField(customFieldsPage, editMeta);
        }
      }
    );
  }
});
