import type { Locator, Page } from '@playwright/test';

import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { SurveyManagementService } from '@/src/modules/employee-listening/api/services/SurveyManagementService';
import { SurveyCreationPage } from '@/src/modules/employee-listening/pages/surveys/surveyCreation';

export function getSurveyOptionButton(page: Page, optionText: string): Locator {
  return page.getByRole('button', { name: optionText });
}

export function getSurveyDropdownOption(page: Page, optionText: string): Locator {
  return page.getByRole('option', { name: optionText });
}

export function getSurveyInputField(page: Page, placeholder: string): Locator {
  return page.getByPlaceholder(placeholder);
}

export function getSurveyTextElement(page: Page, text: string): Locator {
  return page.getByText(text);
}

export function getSurveyQuestionValidation(page: Page, questionText: string): Locator {
  return page.locator(`text=${questionText}`).or(page.getByText(questionText));
}

export function setTestTimeout(testObj: any, ms: number) {
  testObj.setTimeout(ms);
}

/**
 * Utility function to encapsulate SurveyCreationPage and ContentManagementService setup for tests.
 */
export async function setupSurveyTestContext(appManagersPage: any) {
  const surveyCreationPage = new SurveyCreationPage(appManagersPage);
  const cookies: Array<{ name: string; value: string }> = await appManagersPage.context().cookies();
  const cookieHeader = cookies.map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
  const csrfToken = cookies.find((c: { name: string }) => c.name === 'csrfid')?.value;
  const surveyManagementService = new SurveyManagementService(
    appManagersPage.request,
    getEnvConfig().apiBaseUrl,
    appManagersPage.authToken,
    cookieHeader,
    csrfToken
  );
  return { surveyCreationPage, surveyManagementService };
}
