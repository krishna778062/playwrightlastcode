import type { Locator, Page } from '@playwright/test';

export function getUserCountPattern(page: Page, pattern: string): Locator {
  return page.getByText(new RegExp(pattern));
}

export function getDayGridCell(page: Page, day: number): Locator {
  return page.getByRole('gridcell', { name: day.toString(), exact: true });
}

export function getExactAudienceCheckbox(page: Page, audienceName: string): Locator {
  return page.getByLabel(audienceName, { exact: true }).getByRole('checkbox');
}

export function getAlternativeAudienceCheckbox(page: Page, audienceName: string): Locator {
  return page
    .locator('div')
    .filter({ hasText: new RegExp(`^${audienceName}$`, 'i') })
    .locator('input[type="checkbox"]')
    .first();
}

export function getPromptButton(page: Page, promptText: string): Locator {
  return page.getByRole('button', { name: promptText });
}
