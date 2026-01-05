import { expect, FrameLocator, Page } from '@playwright/test';

import { PieChartComponent } from '../../../components/pieChartComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

/**
 * Base class for app adoption dashboard pie chart metrics.
 *
 * This class provides enhanced hover functionality for pie chart segments
 * using mouse.move with exact coordinates to handle tooltip display.
 *
 * The enhanced hover method:
 * - Uses mouse.move to exact center coordinates of the label
 * - Includes retry logic if tooltip doesn't appear
 * - Waits for element stability before moving mouse
 */
export abstract class BaseAppAdoptionPieChartMetric extends PieChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string) {
    super(page, thoughtSpotIframe, metricTitle);
  }

  /**
   * Enhanced hover over the segment label with the given label
   * Uses mouse.move to exact center coordinates of the label to trigger tooltip
   * @param label - The label of the segment to hover over
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   */
  async hoverOverSegmentLabelWithLabelAs(label: string, maxRetries = 3): Promise<void> {
    const chartLabel = this.getChartLabelLocatorWithLabelAs(label);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Scroll into view and wait for element to be stable
        await chartLabel.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Get bounding box and move mouse to center coordinates
        const boundingBox = await chartLabel.boundingBox();
        if (boundingBox) {
          const centerX = boundingBox.x + boundingBox.width / 2;
          const centerY = boundingBox.y + boundingBox.height / 2;
          await this.page.mouse.move(centerX, centerY);
        }

        // Wait for tooltip to appear
        await this.page.waitForTimeout(2000);
        await this.toolTipContainer.waitFor({ state: 'visible', timeout: 3000 });
        return; // Tooltip appeared, exit successfully
      } catch {
        if (attempt === maxRetries) {
          // On last attempt, try one more move and continue
          const box = await chartLabel.boundingBox();
          if (box) {
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.page.waitForTimeout(2000);
          }
          return;
        }
        // Wait before retry
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Override verify method to handle duplicate/truncated text in chart labels
   * Extracts only the first occurrence of the pattern to handle cases where
   * textContent returns "Label - Count (Percentage%)Label …"
   */
  async verifySegmentLabelDataPointsAreAsExpected(params: { label: string; expectedText: string }): Promise<void> {
    const { label, expectedText } = params;
    const chartLabel = this.getChartLabelLocatorWithLabelAs(label);

    // Wait for the element to be visible
    await this.verifier
      .waitUntilElementIsVisible(chartLabel, {
        timeout: TIMEOUTS.SHORT,
        stepInfo: `Wait for chart label "${label}" to be visible`,
      })
      .catch(() => {
        // Some charts may not need explicit wait, so we catch and continue
      });

    let actualText: string | null = null;

    // Try using innerText first (only gets visible text)
    actualText = await chartLabel.innerText().catch(() => null);

    // If innerText doesn't work, try getting all text elements and concatenate
    if (!actualText) {
      const textElements = chartLabel.locator('text');
      const textCount = await textElements.count();
      if (textCount > 0) {
        const textParts: string[] = [];
        for (let i = 0; i < textCount; i++) {
          const text = await textElements.nth(i).textContent();
          if (text) {
            textParts.push(text);
          }
        }
        actualText = textParts.join('');
      }
    }

    // If still no text, try textContent from the group itself
    if (!actualText) {
      actualText = await chartLabel.textContent().catch(() => null);
    }

    if (!actualText) {
      throw new Error(`Could not extract text from chart label for "${label}"`);
    }

    // Extract only the first occurrence to handle duplicate text
    // Pattern: "Label - Count (Percentage%)" - extract up to the closing parenthesis and percentage
    const extractFirstOccurrence = (text: string, labelToMatch: string): string => {
      const labelLower = labelToMatch.toLowerCase().trim();
      const labelIndex = text.toLowerCase().indexOf(labelLower);

      if (labelIndex === -1) {
        return text;
      }

      // Find the pattern: "Label - Count (Percentage%)"
      // Look for the pattern starting from where the label appears
      const startIndex = labelIndex;
      const dashIndex = text.indexOf(' - ', startIndex);

      if (dashIndex === -1) {
        return text;
      }

      // Find the closing parenthesis and percentage
      const openParenIndex = text.indexOf('(', dashIndex);
      if (openParenIndex === -1) {
        return text;
      }

      const closeParenIndex = text.indexOf(')', openParenIndex);
      if (closeParenIndex === -1) {
        return text;
      }

      // Extract the first occurrence: from label start to closing parenthesis + 1
      return text.substring(startIndex, closeParenIndex + 1);
    };

    // Extract the first occurrence if the text contains duplicates
    const extractedText = extractFirstOccurrence(actualText, label);

    // Normalize text (remove invisible chars, normalize whitespace)
    const normalizeText = (text: string): string => {
      return text
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and other invisible characters
        .replace(/\s*\(\s*/g, '(') // Normalize spaces before opening parenthesis: "1 (" or "1(" -> "1("
        .replace(/\s*\)\s*/g, ')') // Normalize spaces around closing parenthesis: " )" or ")" -> ")"
        .replace(/\s*-\s*/g, ' - ') // Normalize spaces around dashes: "-" or " -" or "- " -> " - "
        .replace(/\s+/g, ' ') // Collapse multiple whitespace characters into a single space
        .trim();
    };

    const normalizedActual = normalizeText(extractedText);
    const normalizedExpected = normalizeText(expectedText);

    expect(
      normalizedActual,
      `Segment label ${label} should display text: ${expectedText}, but got: ${actualText}`
    ).toBe(normalizedExpected);
  }
}
