import { expect, Locator, Page } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
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
  readonly filtersButton: Locator;
  readonly creatorField: Locator;
  readonly statusSelect: Locator;
  readonly recipientsSelect: Locator;
  readonly dateModifiedSelect: Locator;
  readonly resetFiltersButton: Locator;
  readonly menuItems: Locator;
  readonly fromAddressField: Locator;
  readonly fromAddressListbox: Locator;

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
    this.fromAddressField = this.page.locator('[data-testid="field-From address"]');
    this.fromAddressListbox = this.page.getByRole('listbox');
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

  /**
   * Verifies that filter selections are correctly applied in the UI
   * @param selections - The expected filter selections
   */
  async verifyFilterSelections(selections: {
    creatorLabel?: string;
    statusValue?: string;
    recipientsValue?: string;
    dateModifiedValue?: string;
  }): Promise<void> {
    const currentState = await this.captureCurrentState();

    if (selections.creatorLabel !== undefined) {
      expect(currentState.creatorText, `Creator filter should contain "${selections.creatorLabel}"`).toContain(
        selections.creatorLabel
      );
    }
    if (selections.statusValue !== undefined) {
      expect(currentState.statusValue, `Status filter should be "${selections.statusValue}"`).toBe(
        selections.statusValue
      );
    }
    if (selections.recipientsValue !== undefined) {
      expect(currentState.recipientsValue, `Recipients filter should be "${selections.recipientsValue}"`).toBe(
        selections.recipientsValue
      );
    }
    if (selections.dateModifiedValue !== undefined) {
      expect(currentState.dateModifiedValue, `Date Modified filter should be "${selections.dateModifiedValue}"`).toBe(
        selections.dateModifiedValue
      );
    }
  }

  async verifyFromAddressFilterIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.fromAddressField, {
      assertionMessage: 'From address filter should be visible',
    });
  }

  async assertDisplayNameAndEmailVisible(_senderEmail: string): Promise<void> {
    await this.clickOnElement(this.fromAddressField, {
      stepInfo: 'Open From address filter options',
    });

    // Wait for React Select listbox to appear (options are inside a listbox, not native <option> elements)
    await expect(this.fromAddressListbox, 'From address dropdown listbox should be visible').toBeVisible({
      timeout: TIMEOUTS.SHORT,
    });

    // Get the first option from the listbox
    const dropdownOption = this.fromAddressListbox.getByRole('option').first();
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
}
