import { expect, FrameLocator, Page, test } from '@playwright/test';

import { PieChartComponent } from '../../../components/pieChartComponent';

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
}
