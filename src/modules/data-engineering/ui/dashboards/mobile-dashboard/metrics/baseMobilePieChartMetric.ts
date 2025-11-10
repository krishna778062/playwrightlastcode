import { expect, FrameLocator, Locator, Page } from '@playwright/test';

import { PieChartComponent } from '../../../components/pieChartComponent';

/**
 * Base class for mobile dashboard pie chart metrics that need string-based label matching
 * to avoid ambiguous matches (e.g., "Android logins" vs "Both iOS and android logins").
 *
 * This class provides:
 * - String-based locator that matches labels at the start of text (using startsWith, no regex)
 * - Enhanced text extraction with multiple fallbacks
 * - Duplicate text handling
 * - Text normalization
 */
export abstract class BaseMobilePieChartMetric extends PieChartComponent {
  protected getChartLabelLocatorWithLabelAsOverride: (label: string) => Promise<Locator>;
  private readonly allChartLabels: Locator;

  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string) {
    super(page, thoughtSpotIframe, metricTitle);

    this.allChartLabels = this.rootLocator.locator(`g[class*='highcharts-data-label-color']`);

    // Create a locator that matches the label at the start of the text
    // to avoid ambiguous matches (e.g., "Android logins" should not match "Both iOS and android logins")
    // Note: Can't override readonly property from base class, so we create a separate one
    // This method uses string matching (startsWith) instead of regex for better performance and simplicity
    // Since Playwright's filter doesn't support async functions, we iterate through all labels
    // to find the one that starts with the given label (case-insensitive)
    this.getChartLabelLocatorWithLabelAsOverride = async (label: string) => {
      const labelLower = label.toLowerCase().trim();
      const count = await this.allChartLabels.count();

      for (let i = 0; i < count; i++) {
        const text = await this.allChartLabels.nth(i).textContent();
        const normalizedText = text?.toLowerCase().trim() ?? '';
        if (normalizedText.startsWith(labelLower)) {
          return this.allChartLabels.nth(i);
        }
      }

      throw new Error(`Label "${label}" not found in chart labels`);
    };
  }

  /**
   * Override hover method to use the string-based locator (startsWith matching)
   * Subclasses can override this to add additional logic (e.g., visibility waits)
   */
  async hoverOverSegmentLabelWithLabelAs(label: string): Promise<void> {
    const chartLabel = await this.getChartLabelLocatorWithLabelAsOverride(label);
    await chartLabel.hover();
  }

  /**
   * Override verify method to use the string-based locator and handle complex text extraction
   * Extracts text with multiple fallbacks and handles duplicate/truncated text
   */
  async verifySegmentLabelDataPointsAreAsExpected(params: { label: string; expectedText: string }): Promise<void> {
    const { label, expectedText } = params;
    const chartLabelGroup = await this.getChartLabelLocatorWithLabelAsOverride(label);

    // Wait for the element to be visible first (subclasses can override if not needed)
    await this.verifier
      .waitUntilElementIsVisible(chartLabelGroup, {
        timeout: 15_000,
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
