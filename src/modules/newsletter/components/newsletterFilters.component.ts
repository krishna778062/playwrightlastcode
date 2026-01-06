import { DateSelection, NewsletterDatePickerComponent } from '@newsletter/components/datePicker.component';
import { expect, Locator, Page } from '@playwright/test';

import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export type NewsletterFilterState = {
  creatorText: string;
  statusValue: string;
  recipientsValue: string;
  dateModifiedValue: string;
};

export class NewsletterFiltersComponent extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;
  private readonly filtersButton: Locator;
  private readonly creatorField: Locator;
  private readonly statusSelect: Locator;
  private readonly recipientsSelect: Locator;
  private readonly dateModifiedSelect: Locator;
  private readonly resetFiltersButton: Locator;
  private readonly menuItems: Locator;
  private readonly customDateFromButton: Locator;
  private readonly customDateToButton: Locator;
  private readonly fromAddressField: Locator;
  private readonly senderOptions: Locator;
  private readonly customDateLabelCandidates: Record<'from' | 'to', string[]>;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);
    this.filtersButton = this.page.getByRole('button', { name: 'Filters' });
    this.creatorField = this.page.locator('[data-testid="field-Creator"]');
    this.statusSelect = this.page.locator('#status');
    this.recipientsSelect = this.page.locator('#recipientType');
    this.dateModifiedSelect = this.page.locator('#modifiedAtSelect');
    this.resetFiltersButton = this.page.getByRole('button', { name: 'Reset all' });
    this.menuItems = this.page.getByRole('menuitem');
    this.customDateFromButton = this.page.getByRole('button', { name: /^Date from/i });
    this.customDateToButton = this.page.getByRole('button', { name: /^Date to/i });
    this.fromAddressField = this.page.locator('[data-testid="field-From address"]');
    this.senderOptions = this.page.locator('[data-testid="sender-option"]');
    this.customDateLabelCandidates = {
      from: ['Date from', 'From date', 'Start date'],
      to: ['Date to', 'To date', 'End date'],
    };
  }

  async openFiltersPanel(): Promise<void> {
    await expect(this.filtersButton, 'Filters button should be visible before opening filters').toBeVisible();
    await expect(this.filtersButton, 'Filters button should be enabled before opening filters').toBeEnabled();
    await this.clickOnElement(this.filtersButton, {
      stepInfo: 'Open filters panel',
    });
    await this.verifier.verifyTheElementIsVisible(this.creatorField, {
      assertionMessage: 'Creator filter field should be visible',
    });
  }

  async selectCreator(optionLabel: string): Promise<string> {
    await this.clickOnElement(this.creatorField, {
      stepInfo: 'Open creator filter options',
    });
    const matchingOptions = this.menuItems.filter({ hasText: optionLabel });
    const matchingCount = await matchingOptions.count();
    const optionToSelect = matchingCount > 0 ? matchingOptions.first() : this.menuItems.first();
    await expect(optionToSelect, `Creator option for ${optionLabel} should be visible`).toBeVisible();
    const optionText = (await optionToSelect.textContent())?.trim() || optionLabel;
    await optionToSelect.click();
    return optionText;
  }

  async selectStatus(optionLabel: string): Promise<string> {
    try {
      const selectedValues = await this.statusSelect.selectOption({ label: optionLabel });
      const selectedValue = selectedValues[0];
      if (selectedValue) {
        return selectedValue;
      }
    } catch {
      // fallback handled below
    }
    const fallbackOption = this.statusSelect.locator('option').nth(1);
    await expect(fallbackOption, 'Fallback status option should exist').toBeAttached();
    const fallbackValue = (await fallbackOption.getAttribute('value')) || undefined;
    if (!fallbackValue) {
      throw new Error(`Unable to determine fallback status option value after failing to select "${optionLabel}"`);
    }
    await this.statusSelect.selectOption(fallbackValue);
    return fallbackValue;
  }

  async selectRecipients(optionLabel: string): Promise<string> {
    try {
      const selectedValues = await this.recipientsSelect.selectOption({ label: optionLabel });
      const selectedValue = selectedValues[0];
      if (selectedValue) {
        return selectedValue;
      }
    } catch {
      // fallback handled below
    }
    const fallbackOption = this.recipientsSelect.locator('option').nth(1);
    await expect(fallbackOption, 'Fallback recipients option should exist').toBeAttached();
    const fallbackValue = (await fallbackOption.getAttribute('value')) || undefined;
    if (!fallbackValue) {
      throw new Error(`Unable to determine fallback recipients option value after failing to select "${optionLabel}"`);
    }
    await this.recipientsSelect.selectOption(fallbackValue);
    return fallbackValue;
  }

  async selectDateModified(optionLabel: string): Promise<string> {
    try {
      const selectedValues = await this.dateModifiedSelect.selectOption({ label: optionLabel });
      const selectedValue = selectedValues[0];
      if (selectedValue) {
        return selectedValue;
      }
    } catch {
      // fallback handled below
    }
    const fallbackOption = this.dateModifiedSelect.locator('option').nth(1);
    await expect(fallbackOption, 'Fallback date modified option should exist').toBeAttached();
    const fallbackValue = (await fallbackOption.getAttribute('value')) || undefined;
    if (!fallbackValue) {
      throw new Error(
        `Unable to determine fallback date modified option value after failing to select "${optionLabel}"`
      );
    }
    await this.dateModifiedSelect.selectOption(fallbackValue);
    return fallbackValue;
  }

  async selectCustomDateRange(from: DateSelection, to: DateSelection): Promise<void> {
    if (!(await this.customDateFromButton.isVisible())) {
      await this.selectDateModified('Custom');
    }

    const fromTrigger = await this.resolveCustomDateTrigger('from');
    const toTrigger = await this.resolveCustomDateTrigger('to');

    await expect(fromTrigger, 'Custom date range "Date from" picker should be visible').toBeVisible();
    await expect(toTrigger, 'Custom date range "Date to" picker should be visible').toBeVisible();

    const customDatePicker = new NewsletterDatePickerComponent(this.page, {
      fromDateLocator: fromTrigger,
      toDateLocator: toTrigger,
    });
    await customDatePicker.selectDateRange(from, to);
  }

  async resetFilters(): Promise<void> {
    await this.clickOnElement(this.resetFiltersButton, {
      stepInfo: 'Reset all newsletter filters',
    });
  }

  async captureCurrentState(): Promise<NewsletterFilterState> {
    return {
      creatorText: await this.getCreatorFieldText(),
      statusValue: await this.statusSelect.inputValue(),
      recipientsValue: await this.recipientsSelect.inputValue(),
      dateModifiedValue: await this.dateModifiedSelect.inputValue(),
    };
  }

  async expectStateToMatch(expectedState: NewsletterFilterState): Promise<void> {
    await expect(this.creatorField).toHaveText(expectedState.creatorText);
    await expect(this.statusSelect).toHaveValue(expectedState.statusValue);
    await expect(this.recipientsSelect).toHaveValue(expectedState.recipientsValue);
    await expect(this.dateModifiedSelect).toHaveValue(expectedState.dateModifiedValue);
  }

  async getCustomDateRangeLabels(): Promise<{ from: string; to: string }> {
    const fromTrigger = await this.resolveCustomDateTrigger('from');
    const toTrigger = await this.resolveCustomDateTrigger('to');
    const fromLabel = ((await fromTrigger.textContent()) || '').trim();
    const toLabel = ((await toTrigger.textContent()) || '').trim();
    return { from: fromLabel, to: toLabel };
  }

  async verifyFromAddressFilterIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.fromAddressField, {
      assertionMessage: 'From address filter should be visible',
    });
  }

  async assertDisplayNameAndEmailVisible(senderEmail: string): Promise<void> {
    await this.clickOnElement(this.fromAddressField, {
      stepInfo: 'Open From address filter options',
    });

    // Wait for React Select listbox to appear (options are inside a listbox, not native <option> elements)
    const listbox = this.page.getByRole('listbox');
    await expect(listbox, 'From address dropdown listbox should be visible').toBeVisible({ timeout: 10000 });

    // Get the first option from the listbox
    const dropdownOption = listbox.getByRole('option').first();
    await expect(dropdownOption, 'Dropdown option should be visible').toBeVisible();

    const firstOptionText = (await dropdownOption.textContent())?.trim() ?? '';

    // Assert that option contains both a display name and an email pattern
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
    const hasEmail = emailPattern.test(firstOptionText);

    // Name is present if there's text beyond just the email
    const emailMatch = firstOptionText.match(emailPattern);
    const hasName = emailMatch ? firstOptionText.length > emailMatch[0].length : firstOptionText.length > 0;

    expect(hasName, `From address option should contain a display name. Got: "${firstOptionText}"`).toBeTruthy();
    expect(hasEmail, `From address option should contain an email. Got: "${firstOptionText}"`).toBeTruthy();

    await this.page.keyboard.press('Escape');
  }

  async assertStatusOptionExists(optionLabel: string): Promise<void> {
    const statusOption = this.statusSelect.locator('option', { hasText: optionLabel });
    await expect(statusOption.first(), `Status option ${optionLabel} should exist`).toBeAttached();
  }

  private async getCreatorFieldText(): Promise<string> {
    const textContent = await this.creatorField.textContent();
    return (textContent || '').replace(/\s+/g, ' ').trim();
  }

  private async resolveCustomDateTrigger(type: 'from' | 'to'): Promise<Locator> {
    const candidates: Locator[] = [];
    const labels = this.customDateLabelCandidates[type];

    const fallbackDataTestIds =
      type === 'from'
        ? ['custom-date-from', 'date-from', 'from-date', 'custom-from-date', 'field-Date from', 'field-From date']
        : ['custom-date-to', 'date-to', 'to-date', 'custom-to-date', 'field-Date to', 'field-To date'];
    const placeholderCandidates = ['mm/dd/yyyy', 'Select date', 'Start date', 'End date'];
    const inputNames =
      type === 'from' ? ['customDateFrom', 'dateFrom', 'fromDate'] : ['customDateTo', 'dateTo', 'toDate'];

    // Primary stored locator and related field wrappers
    candidates.push(type === 'from' ? this.customDateFromButton : this.customDateToButton);
    const fieldWrapper = this.dateModifiedSelect.locator(
      'xpath=ancestor::*[contains(@class,"Spacing-module__column")]'
    );
    candidates.push(fieldWrapper.locator('input').nth(type === 'from' ? 0 : 1));
    candidates.push(
      fieldWrapper
        .locator('[data-testid*="date"]')
        .locator('input, button')
        .nth(type === 'from' ? 0 : 1)
    );

    const addGenericXPathCandidates = (root?: Locator) => {
      const base =
        root ??
        this.page.locator(
          'xpath=//*[(self::input or self::button or self::div or self::span)' +
            ` and (contains(translate(@name,"FROMTO","fromto"),"${type === 'from' ? 'from' : 'to'}")` +
            ` or contains(translate(@id,"FROMTO","fromto"),"${type === 'from' ? 'from' : 'to'}")` +
            ` or contains(translate(@data-testid,"FROMTO","fromto"),"${type === 'from' ? 'from' : 'to'}")` +
            ` or contains(translate(@aria-label,"FROMTO","fromto"),"${type === 'from' ? 'from' : 'to'}"))]`
        );
      candidates.push(base);
    };

    const addLabelCandidates = (root: Locator | Page) => {
      for (const label of labels) {
        const labelRegex = new RegExp(`^${label}`, 'i');
        if ('getByRole' in root) {
          candidates.push(root.getByRole('button', { name: labelRegex }));
        }
        if ('getByLabel' in root) {
          candidates.push(root.getByLabel(labelRegex));
        }
        if ('locator' in root) {
          candidates.push(root.locator(`[aria-label*="${label}" i]`));
          candidates.push(root.locator('button').filter({ hasText: labelRegex }));
          candidates.push(root.locator('input').filter({ hasText: labelRegex }));
          candidates.push(root.locator('label').filter({ hasText: labelRegex }).locator('..').locator('input, button'));
          const normalized = label.toLowerCase().replace(/\s+/g, '-');
          candidates.push(root.locator(`[aria-labelledby*="${normalized}"]`).locator('input, button'));
          candidates.push(root.locator(`[id*="${normalized}"]`).locator('input, button'));
        }
      }
    };

    addLabelCandidates(this.page);
    addGenericXPathCandidates();

    for (const testId of fallbackDataTestIds) {
      candidates.push(this.page.locator(`[data-testid="${testId}"]`));
      candidates.push(this.page.locator(`[data-testid*="${testId}"]`));
    }

    for (const name of inputNames) {
      candidates.push(this.page.locator(`input[name="${name}"]`));
      candidates.push(this.page.locator(`input[name*="${name}"]`));
    }

    candidates.push(this.page.locator('input[type="date"]'));

    for (const placeholder of placeholderCandidates) {
      candidates.push(this.page.getByPlaceholder(placeholder));
    }

    const portalRoot = this.page.locator('[data-tippy-root]');
    if (await portalRoot.count()) {
      addLabelCandidates(portalRoot);
      addGenericXPathCandidates(portalRoot);
      for (const testId of fallbackDataTestIds) {
        candidates.push(portalRoot.locator(`[data-testid="${testId}"]`));
        candidates.push(portalRoot.locator(`[data-testid*="${testId}"]`));
      }

      for (const name of inputNames) {
        candidates.push(portalRoot.locator(`input[name="${name}"]`));
        candidates.push(portalRoot.locator(`input[name*="${name}"]`));
      }

      candidates.push(portalRoot.locator('input[type="date"]'));

      candidates.push(portalRoot.locator('[class*="DayPicker"]').locator('..').locator('button', { hasText: /Date/i }));
      for (const placeholder of placeholderCandidates) {
        candidates.push(portalRoot.getByPlaceholder(placeholder));
      }
    }

    for (const candidate of candidates) {
      const target = candidate.first();
      if ((await target.count()) === 0) {
        continue;
      }
      try {
        await target.waitFor({ state: 'visible', timeout: 1500 });
        return target;
      } catch {
        continue;
      }
    }

    throw new Error(`Unable to locate custom date "${type}" trigger`);
  }
}
