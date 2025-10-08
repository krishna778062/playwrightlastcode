import { Locator, Page, test } from '@playwright/test';

import { AnalyticsFiltersComponent } from '@/src/modules/data-engineering/components/analyticsFiltersComponent';
import { AnalyticsBasePage } from '@/src/modules/data-engineering/pages/analyticsBasePage';

export class AppAdoptionPage extends AnalyticsBasePage {
  readonly filters: AnalyticsFiltersComponent;
  readonly adoptionTab: Locator;
  /**
   * Returns the widget header locator for a given widget title.
   * @param title - Widget title text.
   * @returns Locator scoped to the widget header.
   */
  readonly getWidgetByTitle: (title: string) => Locator;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl ?? '');
    this.filters = new AnalyticsFiltersComponent(page);
    this.adoptionTab = this.page.getByRole('tab', { name: 'Adoption' }).first();
    this.getWidgetByTitle = (title: string) =>
      this.page
        .locator('[class*="Widget-module__header"]', { has: this.page.locator('h3', { hasText: title }) })
        .first();
  }

  /**
   * Verifies the App Adoption page has loaded by asserting Adoption tab visibility.
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify App Adoption page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.adoptionTab, {
        assertionMessage: 'Adoption tab should be visible when App Adoption page loads',
      });
    });
  }

  /**
   * Navigates to Analytics > App and opens the Adoption tab.
   */
  async navigateToAppAdoption(): Promise<void> {
    await test.step('Navigate: SideNav > Analytics > App > Adoption', async () => {
      await this.clickOnAppAnalyticsButton();
      await this.clickOnAdoptionTab();
    });
  }

  /**
   * Clicks the Adoption tab on the App Analytics dashboard.
   */
  async clickOnAdoptionTab() {
    await test.step('Click Adoption tab', async () => {
      await this.clickOnElement(this.adoptionTab);
    });
  }

  /**
   * Verifies a widget with the given title is visible.
   * @param title - Widget title text.
   */
  async verifyWidgetVisible(title: string) {
    await test.step(`Verify widget "${title}" is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getWidgetByTitle(title), {
        assertionMessage: `Widget with title "${title}" should be visible`,
      });
    });
  }

  /**
   * Verifies that common filters (Department, Location, Company name, People Category, Period) are visible.
   */
  async verifyCommonFiltersVisible() {
    await test.step('Verify common filters are visible', async () => {
      await this.filters.verifyFiltersAreVisible();
    });
  }

  /**
   * Applies a filter by opening the dialog and selecting the provided option.
   * @param label - Filter label (e.g., "Department").
   * @param optionText - Option to select.
   */
  async applyFilter(label: string, optionText: string) {
    await test.step(`Apply filter: ${label} => ${optionText}`, async () => {
      await this.filters.applyFilter(label, optionText);
    });
  }

  /**
   * Verifies that the specified filter dialog opens and shows core controls.
   * @param label - Filter label.
   */
  async verifyFilterDialogUI(label: string) {
    await test.step(`Verify filter dialog UI: ${label}`, async () => {
      await this.filters.verifyFilterDialogUI(label);
    });
  }

  /**
   * Verifies the Period filter dialog lists all expected period options.
   * @param label - The Period filter label (e.g., "Period").
   */
  async verifyFilterPeriodUI(label: string) {
    await test.step('Verify Period filter UI', async () => {
      await this.filters.verifyFilterPeriodUI(label);
    });
  }

  /**
   * Opens a filter and collects the visible option texts.
   * @param label - Filter label.
   * @returns List of option texts.
   */
  async getFilterOptionTexts(label: string): Promise<string[]> {
    return await test.step(`Get filter option texts: ${label}`, async () => {
      return await this.filters.getOptionTexts(label);
    });
  }
}
