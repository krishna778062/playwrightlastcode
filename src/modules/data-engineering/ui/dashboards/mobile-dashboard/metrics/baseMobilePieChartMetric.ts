import { expect, FrameLocator, Locator, Page } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { PieChartComponent } from '../../../components/pieChartComponent';

/**
 * Base class for mobile dashboard pie chart metrics that need regex-based label matching
 * to avoid ambiguous matches (e.g., "Android logins" vs "Both iOS and android logins").
 *
 * This class provides:
 * - Regex-based locator that matches labels at the start of text (using filter with regex)
 * - Enhanced text extraction with multiple fallbacks
 * - Duplicate text handling
 * - Text normalization
 *
 * Note: Using regex with filter() is synchronous and faster than async iteration,
 * which prevents tooltip accumulation issues in CI environments where multiple charts exist.
 */
export abstract class BaseMobilePieChartMetric extends PieChartComponent {
  protected getChartLabelLocatorWithLabelAsOverride: (label: string) => Locator;

  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string) {
    super(page, thoughtSpotIframe, metricTitle);

    // Create a regex-based locator that matches the label at the start of the text
    // to avoid ambiguous matches (e.g., "Android logins" should not match "Both iOS and android logins")
    // Note: Can't override readonly property from base class, so we create a separate one
    // Using regex with filter() is synchronous and faster than async iteration,
    // which prevents tooltip accumulation issues in CI environments
    this.getChartLabelLocatorWithLabelAsOverride = (label: string) => {
      // Escape special regex characters in the label
      const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexPattern = new RegExp(`^${escapedLabel}`, 'i');
      return this.rootLocator.locator(`g[class*='highcharts-data-label-color']`).filter({ hasText: regexPattern });
    };
  }

  /**
   * Override hover method to use the regex-based locator
   * Subclasses can override this to add additional logic (e.g., visibility waits)
   */
  async hoverOverSegmentLabelWithLabelAs(label: string): Promise<void> {
    const chartLabel = this.getChartLabelLocatorWithLabelAsOverride(label);
    await chartLabel.hover();
  }

  /**
   * Override verify method to use the string-based locator and handle complex text extraction
   * Extracts text with multiple fallbacks and handles duplicate/truncated text
   */
  async verifySegmentLabelDataPointsAreAsExpected(params: { label: string; expectedText: string }): Promise<void> {
    const { label, expectedText } = params;
    const chartLabelGroup = this.getChartLabelLocatorWithLabelAsOverride(label);

    // Wait for the element to be visible first (subclasses can override if not needed)
    await this.verifier
      .waitUntilElementIsVisible(chartLabelGroup, {
        timeout: TIMEOUTS.SHORT,
        stepInfo: `Wait for chart label "${label}" to be visible`,
      })
      .catch(() => {
        // Some charts may not need explicit wait, so we catch and continue
      });

    let actualText: string | null = null;

    // Try using innerText first (only gets visible text)
    actualText = await chartLabelGroup.innerText().catch(() => null);

    // If innerText doesn't work, try getting all text elements and concatenate
    if (!actualText) {
      const textElements = chartLabelGroup.locator('text');
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
      actualText = await chartLabelGroup.textContent().catch(() => null);
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
