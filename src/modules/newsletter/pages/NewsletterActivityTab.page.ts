import { DateSelection, NewsletterDatePickerComponent } from '@newsletter/components/datePicker.component';
import { expect, Locator, Page } from '@playwright/test';

import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class NewsletterActivityTabPage extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;
  private readonly activityTab: Locator;
  private readonly dateColumnCells: Locator;
  private readonly periodFilterCandidates: Locator[];

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);
    this.activityTab = this.page.getByRole('tab', { name: 'Activity' });
    this.dateColumnCells = this.page.locator(
      'div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr td:nth-child(2)'
    );
    this.periodFilterCandidates = [
      this.page.getByRole('button', { name: /^Period\b/i }),
      this.page.getByRole('button', { name: /^Period/i }),
      this.page.locator('button:has-text(/^Period\\b/i)'),
      this.page.locator('button:has-text(/Period/i)'),
      this.page.locator('button').filter({ has: this.page.locator('span', { hasText: /^Period\b/i }) }),
      this.page.locator('[class*="FilterGroup-module__pill"]').filter({ hasText: /^Period/i }),
      this.page.locator('[data-testid="filter-pill-period"]'),
      this.page.getByTestId('filter-pill-period'),
      this.page.getByRole('button', { name: /Period filter/i }),
      this.page
        .locator('[data-testid="filter-group"]')
        .filter({ hasText: /^Period/i })
        .locator('button'),
    ];
  }

  async openActivityTab(): Promise<void> {
    await this.clickOnElement(this.activityTab, {
      stepInfo: 'Open Activity tab',
    });
  }

  private async resolveVisibleLocator(candidates: Locator[], errorMessage: string): Promise<Locator> {
    for (const candidate of candidates) {
      const locator = candidate.first();
      try {
        await locator.scrollIntoViewIfNeeded().catch(() => void 0);
        await locator.waitFor({ state: 'visible', timeout: 3000 });
        return locator;
      } catch {
        continue;
      }
    }
    throw new Error(errorMessage);
  }

  private async openPeriodFilterPanel(): Promise<Locator> {
    const periodFilterButton = await this.resolveVisibleLocator(
      this.periodFilterCandidates,
      'Period filter control could not be located on Activity tab'
    );

    await this.verifier.verifyTheElementIsVisible(periodFilterButton, {
      assertionMessage: 'Period filter control should be visible before applying date filter',
    });
    const isExpanded = await periodFilterButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.clickOnElement(periodFilterButton, {
        stepInfo: 'Open Period filter dropdown',
      });
    }

    const periodHeading = this.page.getByRole('heading', { name: /^Period/i }).last();
    await periodHeading.waitFor({ state: 'visible', timeout: 3000 });
    const panel = periodHeading.locator('xpath=ancestor::*[@data-escaped][1]');
    await expect(panel, 'Period filter panel should be visible').toBeVisible({ timeout: 3000 });
    return panel;
  }

  async applyActivityDateFilter(from: DateSelection, to: DateSelection): Promise<void> {
    const periodPanel = await this.openPeriodFilterPanel();

    const customOption = periodPanel.getByLabel(/^Custom$/i);
    await expect(customOption, 'Custom date range option should be visible').toBeVisible();
    await customOption.check();

    const fromTrigger = periodPanel.getByRole('button', { name: /^Date from/i }).first();
    const toTrigger = periodPanel.getByRole('button', { name: /^Date to/i }).first();

    await expect(fromTrigger, '"Date from" trigger should be visible in period panel').toBeVisible({ timeout: 3000 });
    await expect(toTrigger, '"Date to" trigger should be visible in period panel').toBeVisible({ timeout: 3000 });

    const panelDatePicker = new NewsletterDatePickerComponent(this.page, {
      fromDateLocator: fromTrigger,
      toDateLocator: toTrigger,
    });

    await panelDatePicker.selectDateRange(from, to);

    const applyButton = periodPanel.getByRole('button', { name: /^Apply$/i }).first();
    await this.clickOnElement(applyButton, {
      stepInfo: 'Apply activity date filter',
    });

    await this.page.waitForLoadState('networkidle');
  }

  async assertNewsletterBasedOnTheFilter(validateDateRange: string): Promise<void> {
    const matchingRows = this.dateColumnCells.filter({ hasText: validateDateRange });

    await expect
      .poll(async () => matchingRows.count(), {
        message: `Expected at least one newsletter activity row to include date ${validateDateRange}`,
      })
      .toBeGreaterThan(0);
  }

  private async getVisiblePeriodPanel(): Promise<Locator | null> {
    const periodHeading = this.page.getByRole('heading', { name: /^Period/i }).last();
    if (await periodHeading.isVisible()) {
      return periodHeading.locator('xpath=ancestor::*[@data-escaped][1]');
    }
    return null;
  }

  private async ensurePeriodPanel(): Promise<Locator> {
    const periodButton = await this.resolveVisibleLocator(
      this.periodFilterCandidates,
      'Period filter control could not be located on Activity tab'
    );
    const expanded = await periodButton.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await this.clickOnElement(periodButton, {
        stepInfo: 'Open Period filter flyout',
      });
    }
    const panel = await this.getVisiblePeriodPanel();
    if (panel) {
      await expect(panel, 'Period filter panel should be visible').toBeVisible({ timeout: 3000 });
      return panel;
    }
    const periodHeading = this.page.getByRole('heading', { name: /^Period/i }).last();
    await periodHeading.waitFor({ state: 'visible', timeout: 3000 });
    const resolvedPanel = periodHeading.locator('xpath=ancestor::*[@data-escaped][1]');
    await expect(resolvedPanel, 'Period filter panel should be visible').toBeVisible({ timeout: 3000 });
    return resolvedPanel;
  }

  async openPeriodFilter(): Promise<void> {
    await this.ensurePeriodPanel();
  }

  async selectPeriod(option: string): Promise<void> {
    const panel = await this.ensurePeriodPanel();
    const escapedOption = option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const optionRadio = panel.getByLabel(new RegExp(`^${escapedOption}$`, 'i'));
    await expect(optionRadio, `Period option ${option} should be visible`).toBeVisible({ timeout: 3000 });
    await optionRadio.check();
  }

  async applyPeriod(): Promise<void> {
    const panel = await this.ensurePeriodPanel();
    const applyButton = panel.getByRole('button', { name: /^Apply$/i }).first();
    await expect(applyButton, '"Apply" button should be visible before applying period filter').toBeVisible({
      timeout: 3000,
    });
    await expect(applyButton, '"Apply" button should be enabled before applying period filter').toBeEnabled({
      timeout: 3000,
    });
    await this.clickOnElement(applyButton, {
      stepInfo: 'Apply selected period filter',
    });
    await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => void 0);
    const dismissalResult = await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => null);
    if (!dismissalResult) {
      await expect(applyButton, '"Apply" button should remain visible while panel stays open').toBeVisible({
        timeout: 1000,
      });
    }
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => void 0);
  }

  async assertNewsletterBasedOnPeriod(expectedPeriodLabel: string): Promise<void> {
    const panel = await this.ensurePeriodPanel();
    const escapedLabel = expectedPeriodLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const periodOption = panel.getByLabel(new RegExp(`^${escapedLabel}$`, 'i'));

    await expect(periodOption, `Period option ${expectedPeriodLabel} should be visible`).toBeVisible({
      timeout: 3000,
    });
    await expect(periodOption, `Period option ${expectedPeriodLabel} should be selected`).toBeChecked({
      timeout: 3000,
    });

    await this.applyPeriod();
  }
}
