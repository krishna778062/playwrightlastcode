import { expect, FrameLocator, Page, test } from '@playwright/test';

import { PieChartComponent } from '../../../components/pieChartComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

/**
 * Base class for app adoption dashboard pie chart metrics.
 *
 * This class provides enhanced hover functionality for pie chart segments
 * using JavaScript-based event dispatching to handle complex chart interactions.
 *
 * The enhanced hover method:
 * - Uses JavaScript to find the segment closest to the label
 * - Dispatches mouse events directly on the segment element
 * - Includes fallback logic for index-based matching
 * - Handles edge cases where standard hover might fail
 */
export abstract class BaseAppAdoptionPieChartMetric extends PieChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string) {
    super(page, thoughtSpotIframe, metricTitle);
  }

  /**
   * Enhanced hover over the segment label with the given label
   * Uses JavaScript-based event dispatching for reliable hover interactions
   * @param label - The label of the segment to hover over
   */
  async hoverOverSegmentLabelWithLabelAs(label: string): Promise<void> {
    await test.step(`Hover over segment label ${label} for metric ${this.metricTitle}`, async () => {
      // Verify label exists
      const chartLabel = this.getChartLabelLocatorWithLabelAs(label);
      await expect(chartLabel, `Chart label with text ${label} should be visible`).toBeVisible();

      // Strategy: Use JavaScript to find the segment and dispatch mouse events directly
      // This completely bypasses pointer event interception and coordinate issues
      const labelHandle = await chartLabel.elementHandle();
      if (!labelHandle) {
        throw new Error(`Could not get element handle for chart label with text ${label}`);
      }

      // Use JavaScript to find the corresponding segment and trigger hover
      const hoverSuccess = await labelHandle.evaluate((labelElement, targetLabel) => {
        try {
          // Get label position
          const labelRect = labelElement.getBoundingClientRect();
          const labelCenterX = labelRect.left + labelRect.width / 2;
          const labelCenterY = labelRect.top + labelRect.height / 2;

          // Find the chart container
          let chartContainer = labelElement.closest('[class*="answer-content-module__answerVizContainer"]');
          if (!chartContainer) {
            let parent = labelElement.parentElement;
            while (parent && !parent.querySelector('g[class*="highcharts-series-group"]')) {
              parent = parent.parentElement;
            }
            chartContainer = parent;
          }

          if (!chartContainer) {
            return false;
          }

          // Find all pie segment path elements
          const segments = chartContainer.querySelectorAll('g[class*="highcharts-series-group"] path');
          if (segments.length === 0) {
            return false;
          }

          // Find the segment closest to the label by checking bounding boxes
          let closestSegment: SVGPathElement | null = null;
          let minDistance = Infinity;

          segments.forEach(segment => {
            const pathElement = segment as SVGPathElement;
            const bbox = pathElement.getBBox();
            const svg = pathElement.ownerSVGElement;
            if (svg) {
              const svgPoint = svg.createSVGPoint();
              // Use the center of the bounding box
              svgPoint.x = bbox.x + bbox.width / 2;
              svgPoint.y = bbox.y + bbox.height / 2;
              const screenCTM = svg.getScreenCTM();
              if (screenCTM) {
                const screenPoint = svgPoint.matrixTransform(screenCTM);
                const distance = Math.sqrt(
                  Math.pow(screenPoint.x - labelCenterX, 2) + Math.pow(screenPoint.y - labelCenterY, 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  closestSegment = pathElement;
                }
              }
            }
          });

          // Dispatch mouse events on the closest segment
          if (closestSegment) {
            const mouseOverEvent = new MouseEvent('mouseover', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            const mouseMoveEvent = new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            (closestSegment as Element).dispatchEvent(mouseOverEvent);
            (closestSegment as Element).dispatchEvent(mouseMoveEvent);
            return true;
          }

          return false;
        } catch (error) {
          console.error('Error in hover JavaScript:', error);
          return false;
        }
      }, label);

      // If JavaScript approach succeeded, wait for tooltip
      if (hoverSuccess) {
        await this.page.waitForTimeout(300);
        return;
      }

      // Fallback: Match by index and use mouse.move
      const allLabels = this.rootLocator.locator(`g[class*='highcharts-data-label-color']`);
      const pieSegments = this.chartSegmentLocator;

      let labelIndex = -1;
      const labelCount = await allLabels.count();
      for (let i = 0; i < labelCount; i++) {
        const currentLabel = allLabels.nth(i);
        const labelText = await currentLabel.textContent();
        if (labelText && labelText.includes(label)) {
          labelIndex = i;
          break;
        }
      }

      if (labelIndex >= 0) {
        const segmentCount = await pieSegments.count();
        if (labelIndex < segmentCount) {
          const segment = pieSegments.nth(labelIndex);
          await segment.scrollIntoViewIfNeeded();
          const segmentBox = await segment.boundingBox({ timeout: 10000 });
          if (segmentBox) {
            const middlePoint = {
              x: segmentBox.x + segmentBox.width / 2,
              y: segmentBox.y + segmentBox.height / 2,
            };
            await this.page.mouse.move(middlePoint.x, middlePoint.y);
            await this.page.waitForTimeout(200);
            return;
          }
        }
      }

      throw new Error(`Failed to hover on segment for label "${label}" - all approaches failed`);
    });
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
