import type { Locator, Page } from '@playwright/test';

type SelectorOrLocator = string | Locator;

function toLocator(page: Page, target: SelectorOrLocator): Locator {
  return typeof target === 'string' ? page.locator(target) : target;
}

/**
 * Performs a robust drag-and-drop between two elements.
 * 1) Tries Playwright's native dragTo
 * 2) Falls back to HTML5 Drag & Drop events with DataTransfer
 */
export async function dragAndDrop(page: Page, source: SelectorOrLocator, target: SelectorOrLocator): Promise<void> {
  const sourceLocator = toLocator(page, source).first();
  const targetLocator = toLocator(page, target).first();

  await sourceLocator.waitFor({ state: 'visible' });
  await targetLocator.waitFor({ state: 'visible' });

  try {
    await sourceLocator.dragTo(targetLocator);
    return;
  } catch {
    // Fallback to HTML5 events
  }

  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());

  await sourceLocator.dispatchEvent('dragstart', { dataTransfer });
  await targetLocator.dispatchEvent('dragenter', { dataTransfer });
  await targetLocator.dispatchEvent('dragover', { dataTransfer });
  await targetLocator.dispatchEvent('drop', { dataTransfer });
  await sourceLocator.dispatchEvent('dragend', { dataTransfer });

  await dataTransfer.dispose();
}
