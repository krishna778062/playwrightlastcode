import { expect, Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';

export class EditAutomatedAwardPage extends BasePage {
  readonly container: Locator;
  awardScheduleEditIcon: Locator;
  awardScheduleMsgIcon: Locator;
  awardSchedulePointIcon: Locator;
  awardScheduleAwardIcon: Locator;
  awardScheduleBadgeIcon: Locator;
  awardScheduleAwardInstances: Locator;
  awardScheduleAwardInstanceEyeBtn: Locator;
  awardScheduleAwardInstancePencilBtn: Locator;
  awardScheduleAwardInstanceBadge: Locator;
  previewAwardBtn: Locator;
  activateAwardHeader: Locator;
  makeAwardActiveToggle: Locator;
  makeAwardActiveTxt: Locator;
  activeAwardFooter: Locator;
  customAwardMsgRadioBtn: Locator;
  customAwardMsgTextBox: Locator;
  selectedUserValue: Locator;
  customizeNoAuthorRadio: Locator;
  recognitionAuthorIntranetNameRadio: Locator;
  specificAnniversariesTextBox: Locator;
  defaultAwardMsgRadioBtn: Locator;
  customAwardMsgError: Locator;
  readonly awardPointContainer: Locator;
  readonly awardPointsToReceiver: Locator;
  readonly pointInputBox: Locator;
  readonly plusButton: Locator;
  readonly minusButton: Locator;
  private pointInputError: Locator;
  readonly awardIconInScheduleList: Locator;
  readonly awardTextInScheduleList: Locator;
  readonly removeCustomPoint: Locator;

  /**
   * This class represents edit work anniversary page
   * @param page - The Playwright page object
   */
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    this.container = page.locator('[data-testid="pageContainer-page"]');
    this.awardScheduleEditIcon = this.container.locator('[data-testid="i-edit"]').first();
    this.awardScheduleMsgIcon = this.container.getByRole('button', { name: 'custom message' });
    this.awardScheduleAwardIcon = this.container.getByRole('button', { name: 'custom author' });
    this.awardScheduleBadgeIcon = this.container.getByRole('button', { name: 'custom badge' });
    this.awardScheduleAwardInstances = this.container.getByText('year work anniversary');
    this.awardScheduleAwardInstanceEyeBtn = this.container.locator('[data-testid="i-eyeOpen"]');
    this.awardScheduleAwardInstancePencilBtn = this.container.locator('[data-testid="i-edit"]');
    this.awardScheduleAwardInstanceBadge = this.container.locator('[class*="milestoneAwardIcon"]');
    this.previewAwardBtn = this.container.getByRole('button', { name: 'Preview award' });
    this.activateAwardHeader = this.container.getByRole('heading', { name: 'Activate this award' });
    this.makeAwardActiveToggle = this.container.getByRole('switch', { name: 'Make this award active' });
    this.makeAwardActiveTxt = this.container.getByText('Make this award active');
    this.activeAwardFooter = this.container.getByText('This award will turn on and');
    this.defaultAwardMsgRadioBtn = this.container
      .getByTestId('field-Award message')
      .getByRole('radio', { name: 'Default' });
    this.customAwardMsgRadioBtn = this.container
      .getByTestId('field-Award message')
      .getByRole('radio', { name: 'Custom' });
    this.customAwardMsgTextBox = page.locator('[class*="tiptap ProseMirror"]');
    this.selectedUserValue = this.container.locator('[class*="MultiValueLabelWithIcon"]').first();
    this.customizeNoAuthorRadio = this.container.getByRole('radio', { name: 'No author' });
    this.recognitionAuthorIntranetNameRadio = this.container.getByRole('radio', { name: /Intranet name/ });
    this.specificAnniversariesTextBox = this.container.locator('input#frequencyValue');
    this.customAwardMsgError = this.container.getByText(/Must not exceed 2500 characters./i);
    this.awardPointsToReceiver = page.getByRole('switch', { name: 'Award points to receivers' });
    this.awardPointContainer = page.locator('div[class*="MilestonePoints_milestonePoints"]');
    this.pointInputBox = this.awardPointContainer.locator('input[type="number"][name="anniversaryPoints"]');
    this.plusButton = this.awardPointContainer.getByRole('button', { name: 'Plus' });
    this.minusButton = this.awardPointContainer.getByRole('button', { name: 'Minus' });
    this.pointInputError = page.locator('div[class*="Field-module__error"] p[role="alert"]');
    this.awardSchedulePointIcon = page.locator('[aria-label="Milestone instance with custom award points"]');
    this.awardIconInScheduleList = page.locator('[class*="FrequencyAndSchedule_milestoneAwardIcon"] svg text');
    this.awardTextInScheduleList = page.locator('[class*="FrequencyAndSchedule_milestoneAwardIcon"]+p');
    this.removeCustomPoint = page.locator('[aria-label="Remove milestone instance award points customization"]');
  }

  /**
   * Returns a locator for a work anniversary award instance button, based on the exact visible text.
   * @param awardInstanceText - The exact text content of the award instance to locate.
   * @returns A Locator for the matching header button element.
   */
  verifyWorkAnniversaryAwardInstance(awardInstanceText: string): Locator {
    return this.container.getByText(awardInstanceText, { exact: true });
  }

  /**
   * This method returns a locator for an edit button based on the given index text.
   * @param editButtonIndex - The exact index of edit button to locate.
   * @returns - A Locator for the specified edit button element.
   */
  clickWorkAnniversaryAwardInstanceEditButton(editButtonIndex: number): Promise<void> {
    return this.container.locator(`[data-testid="i-edit"]`).nth(editButtonIndex).click();
  }

  /**
   * This method returns a locator for an eye button based on the given index text.
   * @param eyeButtonIndex - The exact index of eye button to locate.
   * @returns - A Locator for the specified eye button element.
   */
  clickWorkAnniversaryAwardInstanceEyeButton(eyeButtonIndex: number): Promise<void> {
    return this.container.locator(`[data-testid="i-eyeOpen"]`).nth(eyeButtonIndex).click();
  }

  /**
   * This method returns a locator for an element based on partial or regex-based text matching.
   * @param text - Partial string or regular expression to match the element's text content.
   * @returns - A Locator for the element matching the given text.
   */
  getElementByPassingPartialText(text: string | RegExp): Locator {
    return this.container.getByText(text);
  }

  /**
   * Returns a specified number of unique random values from a range of 1 to the given maximum.
   * This method creates an array of numbers from 1 to the specified upper limit, shuffles the array and returns the first
   * @param {number} maxRangeValue - The upper limit of the number range (inclusive).
   * @param {number} quantityToPick - The number of unique random numbers to select.
   * @returns {number[]} An array containing the specified number of unique random numbers.
   */
  pickUniqueRandomNumbers(quantityToPick: number, maxRangeValue: number): number[] {
    if (quantityToPick > maxRangeValue) {
      throw new Error('The quantity of numbers to pick cannot exceed the maximum range value.');
    }
    const numbers = Array.from({ length: maxRangeValue }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers.slice(0, quantityToPick);
  }

  /**
   * Ensure toggle enabled, change points, verify plus/minus behavior, then save.
   * @param newValue numeric value to enter into the input
   */
  async enableAndEditPoints() {
    await this.awardPointsToReceiver.waitFor({ state: 'visible' });
    const ariaChecked = await this.awardPointsToReceiver.getAttribute('aria-checked');
    const isEnabled = ariaChecked === 'true' || ariaChecked === 'checked';
    if (!isEnabled) {
      await this.awardPointsToReceiver.click();
      await expect(this.awardPointsToReceiver).toHaveAttribute('aria-checked', /^(true|checked)$/);
      await this.pointInputBox.waitFor({ state: 'visible' });
    }

    const storedValueRaw = await this.pointInputBox.inputValue();
    const storedValue = Number(storedValueRaw || '0');
    const newValue = TestDataGenerator.getRandomNo(1, 20, storedValue);
    await this.pointInputBox.fill(String(newValue));
    await expect(this.pointInputBox).toHaveValue(String(newValue));
    await this.plusButton.waitFor({ state: 'visible' });
    await this.plusButton.click();
    await expect(this.pointInputBox).toHaveValue(String(newValue + 1));
    await this.minusButton.waitFor({ state: 'visible' });
    await this.minusButton.click();
    await expect(this.pointInputBox).toHaveValue(String(newValue));
  }

  private async getNumericInputValue(): Promise<number> {
    const raw = await this.pointInputBox.inputValue();
    // Keep only digits and optional leading minus; fallback to 0
    const numeric = raw?.match(/-?\d+/)?.[0] ?? '0';
    return Number(numeric);
  }

  /**
   * 3) Try to add any alphanumeric input (e.g., "12A") and assert it's not accepted.
   * We enter the value, blur (Tab) and then verify the stored numeric value does not contain letters.
   *
   * @param candidate the string to type (e.g., "12A")
   */
  async verifyTheErrorForInvalidInput(candidate: number) {
    await this.awardPointsToReceiver.waitFor({ state: 'visible' });
    const ariaChecked = await this.awardPointsToReceiver.getAttribute('aria-checked');
    const isEnabled = ariaChecked === 'true' || ariaChecked === 'checked';
    if (!isEnabled) {
      await this.awardPointsToReceiver.click();
      await expect(this.awardPointsToReceiver).toHaveAttribute('aria-checked', /^(true|checked)$/);
      await this.pointInputBox.waitFor({ state: 'visible' });
    }
    await this.pointInputBox.waitFor({ state: 'attached' });
    const before = await this.getNumericInputValue();
    await this.pointInputBox.clear({ force: true });
    await this.pointInputBox.fill(String(candidate));
    await this.pointInputBox.blur();
    await expect(this.pointInputError).toBeVisible();
    await expect(this.pointInputError).toHaveText('Please enter a number between 1 and 100000');
  }

  /**
   * Ensure toggle enabled, change points, verify plus/minus behavior, then save.
   * @param page - The Playwright page object
   */
  async enableAndEditPointsInDialogBox(page: Page) {
    const dialogContainerForm = page.locator('[role="dialog"][data-state="open"] > div');
    const dialogCustomizeAwardPoints = dialogContainerForm
      .locator('[aria-label*="Customize milestone instance"]')
      .last();
    const awardPointsToReceiver = dialogContainerForm.getByRole('switch', { name: 'Award points to receivers' });
    const pointInputBox = dialogContainerForm.locator('input[id="anniversaryPoints"]');
    const plusButton = dialogContainerForm.locator('button[aria-label="Plus"]');
    const minusButton = dialogContainerForm.locator('button[aria-label="Minus"]');

    if (await this.verifier.verifyTheElementIsVisible(dialogCustomizeAwardPoints)) {
      await dialogCustomizeAwardPoints.click();
    }
    const ariaChecked = await awardPointsToReceiver.getAttribute('aria-checked');
    const isEnabled = ariaChecked === 'true' || ariaChecked === 'checked';

    if (!isEnabled) {
      await awardPointsToReceiver.click();
      await expect(awardPointsToReceiver).toHaveAttribute('aria-checked', /^(true|checked)$/);
    }

    const storedValueRaw = await pointInputBox.inputValue();
    const storedValue = Number(storedValueRaw || '0');
    const newValue = TestDataGenerator.getRandomNo(1, 20, storedValue);
    await pointInputBox.fill(String(newValue));
    await expect(pointInputBox).toHaveValue(String(newValue));
    await plusButton.waitFor({ state: 'visible' });
    await plusButton.click();
    await expect(pointInputBox).toHaveValue(String(newValue + 1));
    await minusButton.waitFor({ state: 'visible' });
    await minusButton.click();
    await expect(pointInputBox).toHaveValue(String(newValue));
  }

  /**
   * Disable the custom point in dialog box
   * @param page - The Playwright page object
   */
  async disableTheCustomPoint(page: Page) {
    if (await this.verifier.isTheElementVisible(this.awardPointsToReceiver)) {
      await this.awardPointsToReceiver.click();
    }
    const ariaChecked = await this.awardPointsToReceiver.getAttribute('aria-checked');
    const isEnabled = ariaChecked === 'true' || ariaChecked === 'checked';

    if (isEnabled) {
      await this.awardPointsToReceiver.click();
      await expect(this.awardPointsToReceiver).toHaveAttribute('aria-checked', /^(false|unchecked)$/);
    }
  }

  /**
   * Remove the custom point in dialog box
   * @param page - The Playwright page object
   */
  async removeTheCustomPoint(page: Page) {
    if (await this.verifier.isTheElementVisible(this.awardPointsToReceiver)) {
      await this.awardPointsToReceiver.click();
    }
    const ariaChecked = await this.awardPointsToReceiver.getAttribute('aria-checked');
    const isEnabled = ariaChecked === 'true' || ariaChecked === 'checked';

    if (isEnabled) {
      await this.awardPointsToReceiver.click();
      await expect(this.awardPointsToReceiver).toHaveAttribute('aria-checked', /^(false|unchecked)$/);
    }

    if (await this.verifier.isTheElementVisible(this.removeCustomPoint)) {
      await this.removeCustomPoint.click();
      await expect(this.awardPointsToReceiver).not.toBeVisible();
    }
  }

  /**
   * Gets the heading element by text
   * @param text - The text to search for
   * @returns A Locator for the heading element
   */
  getHeadingElementByText(text: string): Locator {
    return this.container.getByRole('heading', { name: text });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.awardPointsToReceiver);
    return Promise.resolve(undefined);
  }
}
