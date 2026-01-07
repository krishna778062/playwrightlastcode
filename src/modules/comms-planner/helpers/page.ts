import { CalendarPage } from '@modules/comms-planner/pages/calendar/calendarPage';
import { CustomFieldsPage } from '@modules/comms-planner/pages/customizations/customFieldsPage';

export const gotoCustomFieldPage = async (customFieldsPage: CustomFieldsPage) => {
  await customFieldsPage.loadPage({ stepInfo: 'Loading comms planner - customization page' });
  await customFieldsPage.verifyThePageIsLoaded();
};

export const gotoCalendarPage = async (calendarPage: CalendarPage) => {
  await calendarPage.loadPage({ stepInfo: 'Loading comms planner - calendar page' });
  await calendarPage.verifyThePageIsLoaded();
};
