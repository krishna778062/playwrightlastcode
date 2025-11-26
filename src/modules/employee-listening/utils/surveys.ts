import type { Locator, Page } from '@playwright/test';

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
