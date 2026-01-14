import { CustomField } from '@modules/comms-planner/constants/customField';
import { gotoCalendarPage } from '@modules/comms-planner/helpers/page';
import { CalendarPage } from '@modules/comms-planner/pages/calendar/calendarPage';

/**
 * Delete the custom field created
 */
export const verifyCustomFieldInActivity = async (calendarPage: CalendarPage, meta: CustomField) => {
  await calendarPage.waitForTimeout(1000);
  await gotoCalendarPage(calendarPage);
  await calendarPage.clickAddActivityButton();
  await calendarPage.verifyOpenedActivityModal();
  await calendarPage.verifyCustomFieldsExistence(meta);
};
