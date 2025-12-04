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

  await sourceLocator.scrollIntoViewIfNeeded();
  await targetLocator.scrollIntoViewIfNeeded();
  await sourceLocator.waitFor({ state: 'visible' });
  await targetLocator.waitFor({ state: 'visible' });

  // Attempt 1: native dragTo with explicit positions
  try {
    const srcBox = await sourceLocator.boundingBox();
    const dstBox = await targetLocator.boundingBox();
    if (srcBox && dstBox) {
      const sourcePosition = { x: Math.max(2, srcBox.width / 2), y: Math.max(2, srcBox.height / 2) };
      const targetPosition = {
        x: Math.min(dstBox.width - 4, Math.max(4, dstBox.width / 2)),
        y: Math.min(dstBox.height - 4, Math.max(4, dstBox.height / 2)),
      };
      await sourceLocator.dragTo(targetLocator, { sourcePosition, targetPosition, timeout: 5000 });
      return;
    }
  } catch {
    // continue to fallback
  }

  // Attempt 2: mouse-based drag using bounding boxes
  try {
    const srcBox = await sourceLocator.boundingBox();
    const dstBox = await targetLocator.boundingBox();
    if (!srcBox || !dstBox) throw new Error('Missing bounding boxes for drag operation');

    const srcPoint = { x: srcBox.x + srcBox.width / 2, y: srcBox.y + srcBox.height / 2 };
    const dstPoint = {
      x: dstBox.x + Math.min(dstBox.width - 6, Math.max(6, dstBox.width / 2)),
      y: dstBox.y + Math.min(dstBox.height - 6, Math.max(6, dstBox.height / 2)),
    };

    await page.mouse.move(srcPoint.x, srcPoint.y);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(dstPoint.x, dstPoint.y, { steps: 12 });
    await page.waitForTimeout(50);
    await page.mouse.up();
    return;
  } catch {
    // continue to last fallback
  }

  // Attempt 3: HTML5 DataTransfer events
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  try {
    await sourceLocator.dispatchEvent('dragstart', { dataTransfer });
    await targetLocator.dispatchEvent('dragenter', { dataTransfer });
    await targetLocator.dispatchEvent('dragover', { dataTransfer });
    await targetLocator.dispatchEvent('drop', { dataTransfer });
    await sourceLocator.dispatchEvent('dragend', { dataTransfer });
  } finally {
    await dataTransfer.dispose();
  }
}
