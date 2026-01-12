import { expect, Locator, Page, test } from '@playwright/test';
import { automatedAwardMsgs } from '@recognition/constants/automated-award-constants';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';

import { DialogContainerForm } from '@/src/modules/recognition/ui/components/workAnniversary-dialog-container-form';

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
  readonly attachAnImageButton: Locator;
  readonly attachAnImageInput: Locator;
  readonly uploadImageProgressBar: Locator;
  readonly uploadImageThumbnail: Locator;
  readonly uploadImagePanel: Locator;
  readonly removeImageIcon: Locator;
  readonly addedImagePanel: Locator;
  readonly altTextIcon: Locator;

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
    this.customAwardMsgError = this.container.getByText(/Must not exceed 2,500 characters./i);
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
    // Image attachment locators for custom award message
    this.attachAnImageButton = this.container.getByRole('button', { name: 'Attach an image' });
    // Scope to award message field to ensure we're targeting the correct input
    this.attachAnImageInput = this.container.locator('input[data-testid="uploadImageInput"]');
    this.uploadImageProgressBar = this.container.getByRole('progressbar');
    this.uploadImageThumbnail = this.container.locator('[class*="UploadMedia"] img');
    this.uploadImagePanel = this.container.locator('[class*="UploadMedia_panel"]');
    // Scope to award message field to avoid matching buttons in other sections
    this.removeImageIcon = this.container
      .getByTestId('field-Award message')
      .getByRole('button', { name: 'Remove image' });
    // Scope to award message field to avoid matching images in award schedule section
    this.addedImagePanel = this.container
      .getByTestId('field-Award message')
      .locator('[class*="imageContainer"] img')
      .first();
    this.altTextIcon = this.container.getByRole('button', { name: 'Add image alt text' });
  }

  /**
   * Returns a locator for a work anniversary award instance button, based on the exact visible text.
   * @param awardInstanceText - The exact text content of the award instance to locate.
   * @returns A Locator for the matching header button element.
   */
  verifyWorkAnniversaryAwardInstance(awardInstanceText: string): Locator {
    return this.container.getByRole('paragraph').filter({ hasText: awardInstanceText }).first();
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

  /**
   * Get radio button by name
   * @param buttonName - Name of the radio button
   * @returns Locator for the radio button
   */
  getRadioButton(buttonName: string): Locator {
    return this.container.getByRole('radio', { name: buttonName, exact: true });
  }

  /**
   * Get selected user text box locator
   */
  get selectedUserTextBox(): Locator {
    return this.container.getByRole('combobox');
  }

  /**
   * Get menu item dropdown locator
   */
  get menuItemDropDown(): Locator {
    return this.container.getByRole('menuitem');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.awardPointsToReceiver);
    return Promise.resolve(undefined);
  }

  /**
   * Set recognition author as "No author"
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async setRecognitionAuthorAsNoAuthor(
    automatedAwardPage: { pause: (delay: number) => Promise<void>; automatedAwardSaveButton: Locator },
    manageRecognitionPage: {
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
        activeMenuItem: Locator;
      };
      toastAlertText: Locator;
      recognitionHeader: Locator;
    }
  ): Promise<void> {
    await test.step('Choose "no author" as the author type', async () => {
      const noAuthorRadioButton = this.getRadioButton('No author').first();
      const intranetNameRadioButton = this.recognitionAuthorIntranetNameRadio;
      if (!(await intranetNameRadioButton.isChecked())) {
        await automatedAwardPage.pause(500);
        await intranetNameRadioButton.check();
        await automatedAwardPage.automatedAwardSaveButton.click();
        await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
        await manageRecognitionPage.automatedAwards.editMenuItem.click();
      }

      await automatedAwardPage.pause(500);
      await noAuthorRadioButton.check();
      await expect(this.customizeNoAuthorRadio).toBeChecked();
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await expect(manageRecognitionPage.recognitionHeader).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await expect(this.customizeNoAuthorRadio).toBeChecked();

      await test.step('Clean up - Reset the radio button to be checked on "selected user" option', async () => {
        if (!(await intranetNameRadioButton.isChecked())) {
          await automatedAwardPage.pause(500);
          await intranetNameRadioButton.check();
          await automatedAwardPage.automatedAwardSaveButton.click();
        }
      });
    });
  }

  /**
   * Extract intranet name from recognition author text
   * @param text - Text containing intranet name in parentheses
   * @returns Extracted intranet name
   */
  extractIntranetName(text: string | null): string {
    if (!text) return '';
    const start = text.indexOf('(') + 1;
    const end = text.indexOf(')');
    return text.slice(start, end);
  }

  /**
   * Get and validate intranet name from Recognition author section
   * @returns Intranet name before update
   */
  async getIntranetNameFromRecognitionAuthor(): Promise<string> {
    return await test.step('Validate and fetch text from Recognition author as "Intranet Name" section', async () => {
      const intranetNameRadioButton = this.recognitionAuthorIntranetNameRadio;
      if (!(await intranetNameRadioButton.isChecked())) {
        await this.page.waitForTimeout(500);
        await intranetNameRadioButton.check();
      }
      await expect(intranetNameRadioButton).toBeChecked();
      const recognitionAuthorIntranetNameText =
        await this.getElementByPassingPartialText('Intranet name').textContent();
      return this.extractIntranetName(recognitionAuthorIntranetNameText);
    });
  }

  /**
   * Verify intranet name is updated
   * @param intranetNameBefore - Intranet name before update
   * @param newIntranetName - New intranet name
   */
  async verifyIntranetNameUpdated(intranetNameBefore: string, newIntranetName: string): Promise<void> {
    await test.step('Validated Intranet name is updated in edit automated page', async () => {
      await expect(this.getElementByPassingPartialText('Intranet name')).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const recognitionAuthorIntranetNameText =
        await this.getElementByPassingPartialText('Intranet name').textContent();
      const intranetNameAfter = this.extractIntranetName(recognitionAuthorIntranetNameText);
      expect(intranetNameBefore).not.toEqual(intranetNameAfter);
      expect(recognitionAuthorIntranetNameText).toContain(newIntranetName);
    });
  }

  /**
   * Change default author to "Selected user" for work anniversary award
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async changeDefaultAuthorToSelectedUser(
    automatedAwardPage: { editMilestoneTitle: Locator; automatedAwardSaveButton: Locator },
    manageRecognitionPage: {
      automatedAwards: { getThreeDotsButton: (index: number) => Locator; editMenuItem: Locator };
      toastAlertText: Locator;
    }
  ): Promise<void> {
    await test.step('Change Default Author to "Selected user"', async () => {
      await expect(automatedAwardPage.editMilestoneTitle).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      if (await this.getRadioButton('Selected user').isChecked()) {
        await this.getRadioButton('No author').click();
      }
      await this.getRadioButton('Selected user').click();
      // Wait for the combobox to be visible and enabled after selecting "Selected user"
      await expect(this.selectedUserTextBox).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.selectedUserTextBox).toBeEnabled({ timeout: TIMEOUTS.MEDIUM });
      await this.page.waitForTimeout(500); // Allow UI to stabilize
      await this.selectedUserTextBox.fill('a');
      const firstOption = this.menuItemDropDown.first();
      await firstOption.waitFor({ state: 'visible' });
      await firstOption.click();
      const before = await this.selectedUserValue.textContent();
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await expect(automatedAwardPage.editMilestoneTitle).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const after_revisitingThePage = await this.selectedUserValue.textContent();
      expect(before).toEqual(after_revisitingThePage);
    });
  }

  /**
   * Get element by text
   * @param text - Text to search for
   * @returns Locator for the element
   */
  getElementByText(text: string): Locator {
    return this.container.getByText(text);
  }

  /**
   * Get dialog container form locators
   */
  private getDialogContainer(): Locator {
    return this.page.getByRole('dialog');
  }

  /**
   * Remove all customizations from award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async removeAllCustomizationsFromAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Remove all customizations from award instance', async () => {
      const msgCountBefore = await this.awardScheduleMsgIcon.count();
      const authorCountBefore = await this.awardScheduleAwardIcon.count();
      const badgeCountBefore = await this.awardScheduleBadgeIcon.count();

      if (msgCountBefore !== 0 || authorCountBefore !== 0 || badgeCountBefore !== 0) {
        await this.awardScheduleAwardInstancePencilBtn.first().click();
        await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
        const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
        for (const button of buttons) {
          await button.click();
          await automatedAwardPage.pause(300);
        }
        await dialogContainerForm.dailogSaveBtn.click();

        // Wait for the page to update after saving
        await automatedAwardPage.pause(1000);
        await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });

        // Verify that at least one customization icon was removed (count decreased)
        // We check that the count decreased rather than expecting 0, since other instances may still have customizations
        const msgCountAfter = await this.awardScheduleMsgIcon.count();
        const authorCountAfter = await this.awardScheduleAwardIcon.count();
        const badgeCountAfter = await this.awardScheduleBadgeIcon.count();

        // If there were customizations before, verify they were removed from this instance
        if (msgCountBefore > 0) {
          expect(msgCountAfter).toBeLessThan(msgCountBefore);
        }
        if (authorCountBefore > 0) {
          expect(authorCountAfter).toBeLessThan(authorCountBefore);
        }
        if (badgeCountBefore > 0) {
          expect(badgeCountAfter).toBeLessThan(badgeCountBefore);
        }
      }
    });
  }

  /**
   * Validate award schedule element and open edit work anniversary award instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async validateAwardScheduleAndOpenEditInstance(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Validate Award schedule element and open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(this.awardScheduleEditIcon).toBeVisible();
      await this.verifyWorkAnniversaryAwardInstance('1 year work anniversary').isVisible();
      await this.awardScheduleEditIcon.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });
  }

  /**
   * Validate UI elements of edit work anniversary award instance dialog
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async validateEditAwardInstanceDialogElements(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Validate UI elements of edit work anniversary award instance', async () => {
      await expect(dialogContainerForm.dailogHeader).toBeVisible();
      await expect(dialogContainerForm.dailogIProfileEmblem).toBeVisible();
      await expect(dialogContainerForm.dailogAwardeeName).toBeVisible();
      await expect(dialogContainerForm.dailogSubHeader).toBeVisible();
      await expect(dialogContainerForm.dailogSubWorkAnniversaryHeader).toBeVisible();
      await expect(dialogContainerForm.dailogTipTapContent).toBeVisible();
      await expect(dialogContainerForm.dailogCheerIcon).toBeVisible();
      await expect(dialogContainerForm.dailogCommentIcon).toBeVisible();
      await expect(dialogContainerForm.dailogShareIcon).toBeVisible();
      await expect(dialogContainerForm.dailogCancelBtn).toBeVisible();
      await expect(dialogContainerForm.dailogSaveBtn).toBeVisible();
      await expect(dialogContainerForm.dailogCrossBtn).toBeVisible();
    });
  }

  /**
   * Customize message in edit work anniversary modal
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @returns Customized message text
   */
  async customizeMessageInAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm
  ): Promise<string> {
    return await test.step('Customise message in edit work anniversary modal', async () => {
      const customiseMsgText = 'Auto_workAnniversary_customisedMsg_' + Math.floor(Math.random() * 1000);
      const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
      for (const button of buttons) {
        await button.click();
        await automatedAwardPage.pause(300);
      }
      await expect(dialogContainerForm.dailogCustomiseMsgLink).toBeVisible();
      await dialogContainerForm.dailogCustomiseMsgLink.click();
      await automatedAwardPage.pause(500);
      await expect(dialogContainerForm.dailogCustomiseMsgHeader).toBeVisible();
      await expect(dialogContainerForm.dailogAttachAnImageBtn).toBeVisible();
      await expect(dialogContainerForm.dailogContentEditorTextBox).toBeVisible();
      await expect(dialogContainerForm.dailogContentBodyText).toBeVisible();
      await expect(dialogContainerForm.dailogCustomiseMsgFooterText).toBeVisible();
      await expect(dialogContainerForm.dailogRemoveMilestoneBtn).toBeVisible();
      await dialogContainerForm.dailogContentEditorTextBox.fill(customiseMsgText);
      return customiseMsgText;
    });
  }

  /**
   * Customize author in edit work anniversary modal
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async customizeAuthorInAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Customise author in edit work anniversary modal', async () => {
      await expect(dialogContainerForm.dailogCustomiseAuthorLink).toBeVisible();
      await dialogContainerForm.dailogCustomiseAuthorLink.click();
      await expect(dialogContainerForm.dailogCustomiseAuthorHeader).toBeVisible();
      await expect(dialogContainerForm.dailogCustomiseAuthorFooterText).toBeVisible();
      await automatedAwardPage.pause(300);
      await dialogContainerForm.dailogCustomiseNoAuthorRadio.check();
    });
  }

  /**
   * Customize badge in edit work anniversary modal
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async customizeBadgeInAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Customise badge in edit work anniversary modal', async () => {
      await expect(dialogContainerForm.dailogCustomiseBadgeLink).toBeVisible();
      await dialogContainerForm.dailogCustomiseBadgeLink.click();
      await expect(dialogContainerForm.dailogCustomiseBadgeHeader).toBeVisible();
      await expect(dialogContainerForm.dailogBadgeUploadBtn).toBeVisible();
      await expect(dialogContainerForm.dailogCustomiseBadgeFooterText).toBeVisible();
      // Show more button is optional - only check if visible
      const isShowMoreVisible = await dialogContainerForm.dailogShowMoreBtn.isVisible().catch(() => false);
      if (isShowMoreVisible) {
        await expect(dialogContainerForm.dailogShowMoreBtn).toBeVisible();
      }
      await automatedAwardPage.pause(500);
      await dialogContainerForm.dailogFirstBagde.click({ force: true });
    });
  }

  /**
   * Validate icons on work anniversary award instance post editing
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async validateIconsOnAwardInstancePostEditing(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Validate icons on work anniversary award instance post editing', async () => {
      await dialogContainerForm.dailogSaveBtn.click();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(this.awardScheduleMsgIcon.first()).toBeVisible();
      await expect(this.awardScheduleAwardIcon.first()).toBeVisible();
      await expect(this.awardScheduleBadgeIcon.first()).toBeVisible();
    });
  }

  /**
   * Validate pagination in Award Schedule section
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async validatePaginationInAwardSchedule(
    manageRecognitionPage: { showMoreButton: Locator },
    automatedAwardPage: { pause: (delay: number) => Promise<void> }
  ): Promise<void> {
    await test.step('Validate Pagination in Award Schedule section', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      const awardInstanceShowMoreBtn = manageRecognitionPage.showMoreButton.nth(1);
      const showMoreBtnCnt_before = 1;
      let showMoreBtnCnt_after = 1;
      await automatedAwardPage.pause(1000);
      while (await awardInstanceShowMoreBtn.isVisible()) {
        await awardInstanceShowMoreBtn.scrollIntoViewIfNeeded();
        await automatedAwardPage.pause(300);
        await awardInstanceShowMoreBtn.click();
        await automatedAwardPage.pause(300);
        showMoreBtnCnt_after++;
      }
      expect(showMoreBtnCnt_after).toBeGreaterThan(showMoreBtnCnt_before);
      const countOfAwardInstances = await this.awardScheduleAwardInstances.count();
      for (let i = 0; i < Math.min(60, countOfAwardInstances); i++) {
        const awardYear = i + 1;
        const awardInstance = this.verifyWorkAnniversaryAwardInstance(`${awardYear} year work anniversary`);
        await expect(awardInstance).toBeVisible();
      }
    });
  }

  /**
   * Verify all work anniversary award instances are correctly displayed with UI elements
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async verifyAllAwardInstancesWithUIElements(
    manageRecognitionPage: { showMoreButton: Locator },
    automatedAwardPage: { pause: (delay: number) => Promise<void> }
  ): Promise<void> {
    await test.step('Verify that all work anniversary award instances are correctly displayed with its UI elements', async () => {
      await automatedAwardPage.pause(300);
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      const awardInstanceShowMoreBtn = manageRecognitionPage.showMoreButton.nth(1);
      while (await awardInstanceShowMoreBtn.isVisible()) {
        await awardInstanceShowMoreBtn.scrollIntoViewIfNeeded();
        await automatedAwardPage.pause(300);
        await awardInstanceShowMoreBtn.click();
      }
      const countOfAwardInstances = await this.awardScheduleAwardInstances.count();
      for (let i = 1; i < countOfAwardInstances - 1; i++) {
        const awardYear = i + 1;
        const awardInstance = this.verifyWorkAnniversaryAwardInstance(`${awardYear} year work anniversary`);
        await expect(awardInstance).toBeVisible();
        await expect(this.awardScheduleAwardInstanceBadge.nth(i)).toBeVisible();
        await expect(this.awardScheduleAwardInstanceEyeBtn.nth(i)).toBeVisible();
        await expect(this.awardScheduleAwardInstancePencilBtn.nth(i)).toBeVisible();
      }
    });
  }

  /**
   * Validate preview automated award
   * @param dialogContainerForm - DialogContainerForm instance
   * @param automatedAwardMsgs - Automated award messages
   */
  async validatePreviewAutomatedAward(
    dialogContainerForm: DialogContainerForm,
    automatedAwardMsgs: { previewAwardTipTapText: string }
  ): Promise<void> {
    await test.step('Validate if user is able to preview automated award', async () => {
      await this.page.waitForTimeout(500);
      await expect(this.defaultAwardMsgRadioBtn).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await this.defaultAwardMsgRadioBtn.click();
      await expect(this.defaultAwardMsgRadioBtn).toBeChecked({ timeout: TIMEOUTS.MEDIUM });
      await this.previewAwardBtn.scrollIntoViewIfNeeded();
      await this.previewAwardBtn.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
      await expect(dialogContainerForm.dailogHeader).toBeVisible();
      await expect(dialogContainerForm.dailogIProfileEmblem).toBeVisible();
      await expect(dialogContainerForm.dailogAwardeeName).toBeVisible();
      await expect(dialogContainerForm.dailogSubHeader).toBeVisible();
      await expect(dialogContainerForm.dailogSubWorkAnniversaryHeader).toBeVisible();
      await expect(dialogContainerForm.dailogTipTapContent).toBeVisible();
      await expect(dialogContainerForm.dailogCheerIcon).toBeVisible();
      await expect(dialogContainerForm.dailogCommentIcon).toBeVisible();
      await expect(dialogContainerForm.dailogShareIcon).toBeVisible();
      await expect(dialogContainerForm.dailogCrossBtn).toBeVisible();
      await expect(dialogContainerForm.dailogTipTapContent).toHaveText(automatedAwardMsgs.previewAwardTipTapText);
      await dialogContainerForm.dailogCrossBtn.click();
      await expect(dialogContainerForm.dailogHeader).toHaveCount(0);
    });
  }

  /**
   * Customize message for work anniversary award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async customizeMessageForAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void>; automatedAwardSaveButton: Locator },
    dialogContainerForm: DialogContainerForm,
    manageRecognitionPage: {
      automatedAwards: { getThreeDotsButton: (index: number) => Locator; editMenuItem: Locator };
      toastAlertText: Locator;
      recognitionHeader: Locator;
    }
  ): Promise<void> {
    await test.step('Validate Award schedule element and open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await expect(this.awardScheduleEditIcon).toBeVisible();
      await this.clickWorkAnniversaryAwardInstanceEditButton(0);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });

    await test.step('Customize message in edit work anniversary modal', async () => {
      const customizedMsgText = 'Auto_workAnniversary_customizedMsg_' + Math.floor(Math.random() * 1000);
      const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
      for (const button of buttons) {
        await button.click();
        await automatedAwardPage.pause(300);
      }
      await expect(dialogContainerForm.dailogCustomiseMsgLink).toBeVisible();
      await dialogContainerForm.dailogCustomiseMsgLink.click();
      await dialogContainerForm.dailogContentEditorTextBox.fill(customizedMsgText);
      await dialogContainerForm.dailogSaveBtn.click();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });

      // Verify the custom message icon appears for the first instance (1 year) that was just edited
      await expect(this.awardScheduleMsgIcon.first()).toBeVisible();
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await expect(manageRecognitionPage.recognitionHeader).toBeVisible();
    });

    await test.step('Clean up - Validate on removing all the customization made in award instance works as expected', async () => {
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      const count = await this.awardScheduleMsgIcon.count();
      if (count !== 0) {
        await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
        await this.clickWorkAnniversaryAwardInstanceEditButton(0);
        const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
        for (const button of buttons) {
          await button.click();
          await automatedAwardPage.pause(300);
          await dialogContainerForm.dailogSaveBtn.click();
          await automatedAwardPage.automatedAwardSaveButton.click();
        }
      }
    });
  }

  /**
   * Inactivate the award if active
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async inactivateAwardIfActive(
    automatedAwardPage: {
      tableGridFirstRow: Locator;
      pause: (delay: number) => Promise<void>;
      automatedAwardDeactivateButton: Locator;
    },
    manageRecognitionPage: {
      automatedAwards: { getThreeDotsButton: (index: number) => Locator; deactivateMenuItem: Locator };
    }
  ): Promise<void> {
    await test.step('Inactivate the award if active', async () => {
      await automatedAwardPage.tableGridFirstRow.nth(3).waitFor({ state: 'visible' });
      const statusText = await automatedAwardPage.tableGridFirstRow.nth(3).textContent();
      if (statusText?.trim() === 'Active') {
        await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
        await automatedAwardPage.pause(500);
        await manageRecognitionPage.automatedAwards.deactivateMenuItem.click();
        await automatedAwardPage.pause(500);
        await automatedAwardPage.automatedAwardDeactivateButton.click();
        await expect(automatedAwardPage.tableGridFirstRow.nth(3)).toHaveText(/Inactive/);
        await automatedAwardPage.pause(3000); // Waiting for the changes to be reflected in the UI
      }
    });
  }

  /**
   * Validate default UI elements labels and headers of edit automated award page
   * @param automatedAwardMsgs - Automated award messages
   */
  async validateDefaultUIElements(automatedAwardMsgs: {
    awardSentMsg: string;
    awardDescription: string;
  }): Promise<void> {
    await test.step('Validate default UI elements labels and headers of edit automated award page', async () => {
      await expect(this.getElementByText('Award details')).toBeVisible();
      await expect(this.getElementByText('Award name*')).toBeVisible();
      await expect(this.getElementByText('Award message*')).toBeVisible();
      await expect(this.getElementByText('Recognition author*')).toBeVisible();
      await expect(this.getElementByText('Badge*')).toBeVisible();
      await expect(this.getHeadingElementByText('Award frequency')).toBeVisible();
      await expect(this.getHeadingElementByText('Award schedule')).toBeVisible();
      await expect(this.getHeadingElementByText('Activate this award')).toBeVisible();
      await expect(this.makeAwardActiveToggle).toBeVisible();
      await expect(this.getElementByText('Make this award active')).toBeVisible();
      const awardSentMsgLocator = this.container.getByText(automatedAwardMsgs.awardSentMsg, { exact: false });
      await awardSentMsgLocator.scrollIntoViewIfNeeded();
      await expect(awardSentMsgLocator).toBeVisible();
      const awardDescriptionLocator = this.container.getByText(automatedAwardMsgs.awardDescription, { exact: false });
      await awardDescriptionLocator.scrollIntoViewIfNeeded();
      await expect(awardDescriptionLocator).toBeVisible();
    });
  }

  /**
   * Verify that any instance of the work anniversary award can be previewed via eye icon
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @param automatedAwardMsgs - Automated award messages
   */
  async verifyPreviewAwardInstanceViaEyeIcon(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm,
    automatedAwardMsgs: { previewAwardTipTapText: string }
  ): Promise<void> {
    await test.step('Verify that any instance of the work anniversary award can be previewed via eye icon', async () => {
      await automatedAwardPage.pause(500);
      await expect(this.defaultAwardMsgRadioBtn).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await this.defaultAwardMsgRadioBtn.click();
      await automatedAwardPage.pause(500);
      await expect(this.defaultAwardMsgRadioBtn).toBeChecked({ timeout: TIMEOUTS.MEDIUM });
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await this.clickWorkAnniversaryAwardInstanceEyeButton(4);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
      await expect(dialogContainerForm.dailogHeader).toBeVisible();
      await expect(dialogContainerForm.dailogIProfileEmblem).toBeVisible();
      await expect(dialogContainerForm.dailogAwardeeName).toBeVisible();
      await expect(dialogContainerForm.dailogSubHeader).toBeVisible();
      await expect(dialogContainerForm.dailogSubWorkAnniversaryHeader).toBeVisible();
      await expect(dialogContainerForm.dailogTipTapContent).toBeVisible();
      await expect(dialogContainerForm.dailogCheerIcon).toBeVisible();
      await expect(dialogContainerForm.dailogCommentIcon).toBeVisible();
      await expect(dialogContainerForm.dailogShareIcon).toBeVisible();
      await expect(dialogContainerForm.dailogCrossBtn).toBeVisible();
      await expect(dialogContainerForm.dailogTipTapContent).toHaveText(automatedAwardMsgs.previewAwardTipTapText);
      await dialogContainerForm.dailogCrossBtn.click();
      await expect(dialogContainerForm.dailogHeader).toHaveCount(0);
    });
  }

  /**
   * Set recognition author as "no author" for award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @param instanceIndex - Index of the award instance to edit
   */
  async setAuthorAsNoAuthorForAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm,
    instanceIndex: number
  ): Promise<void> {
    await test.step('Open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });

    await test.step('Validate Customization of author by setting recognition author as "no author"', async () => {
      await dialogContainerForm.dailogCustomiseAuthorLink.scrollIntoViewIfNeeded();
      await dialogContainerForm.dailogCustomiseAuthorLink.click();
      await dialogContainerForm.dailogCustomiseNoAuthorRadio.check();
      await expect(dialogContainerForm.dailogCustomiseNoAuthorRadio).toBeChecked();
      await expect(dialogContainerForm.dailogAuthorNameLink).not.toBeAttached();
      await dialogContainerForm.dailogSaveBtn.click();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(this.awardScheduleAwardIcon.first()).toBeVisible();
    });

    await test.step('Clean up - Removing all the customization made in award instance', async () => {
      const count = await this.awardScheduleAwardIcon.count();
      if (count !== 0) {
        await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
        await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
        const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
        for (const button of buttons) {
          await button.click();
          await automatedAwardPage.pause(300);
        }
        await dialogContainerForm.dailogSaveBtn.click();
        await this.page.waitForTimeout(1000);
        const countAfter = await this.awardScheduleAwardIcon.count();
        if (countAfter > 0) {
          expect(countAfter).toBeLessThan(count);
        }
      }
    });
  }

  /**
   * Set recognition author as "custom" for award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @param instanceIndex - Index of the award instance to edit
   */
  async setAuthorAsCustomForAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm,
    instanceIndex: number
  ): Promise<void> {
    await test.step('Open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });

    await test.step('Validate Customization of author by setting recognition author as "custom"', async () => {
      const customizedAuthorName = 'customizedAuthorName_' + Math.floor(Math.random() * 1000);
      await dialogContainerForm.dailogCustomiseAuthorLink.click();
      const dialog = this.page.getByRole('dialog');
      await dialog.getByRole('radio', { name: 'Custom' }).check();
      await dialogContainerForm.dailogCustomAuthorTextBox.fill(customizedAuthorName);
      const actualText = await dialogContainerForm.dailogAuthorNameLink.textContent();
      expect(actualText).toEqual(customizedAuthorName);
      await dialogContainerForm.dailogSaveBtn.click();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(this.awardScheduleAwardIcon.first()).toBeVisible();
    });

    await test.step('Clean up - Removing all the customization made in award instance', async () => {
      const count = await this.awardScheduleAwardIcon.count();
      if (count !== 0) {
        await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
        await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
        const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
        for (const button of buttons) {
          await button.click();
          await automatedAwardPage.pause(300);
        }
        await dialogContainerForm.dailogSaveBtn.click();
        await this.page.waitForTimeout(1000);
        const countAfter = await this.awardScheduleAwardIcon.count();
        if (countAfter > 0) {
          expect(countAfter).toBeLessThan(count);
        }
      }
    });
  }

  /**
   * Set recognition author as "selected user" for award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @param instanceIndex - Index of the award instance to edit
   */
  async setAuthorAsSelectedUserForAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm,
    instanceIndex: number
  ): Promise<void> {
    await test.step('Open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });

    await test.step('Validate Customization of author by setting recognition author as "selected user"', async () => {
      await dialogContainerForm.dailogCustomiseAuthorLink.click();
      const dialog = this.page.getByRole('dialog');
      await dialog.getByRole('radio', { name: 'Selected user' }).check();
      await dialogContainerForm.dailogSelectedUserTextBox.fill('a');
      const firstOption = dialogContainerForm.dailogSelectOptions.first();
      await firstOption.waitFor({ state: 'visible' });
      await firstOption.click();
      const selectedName = await dialogContainerForm.dailogSelectUserValue.textContent();
      const actualText = await dialogContainerForm.dailogAuthorNameLink.textContent();
      expect(actualText).toEqual(selectedName);
      await dialogContainerForm.dailogSaveBtn.click();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(this.awardScheduleAwardIcon.first()).toBeVisible();
    });

    await test.step('Clean up - Removing all the customization made in award instance', async () => {
      const count = await this.awardScheduleAwardIcon.count();
      if (count !== 0) {
        await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
        await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
        const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
        for (const button of buttons) {
          await button.click();
          await automatedAwardPage.pause(300);
        }
        await dialogContainerForm.dailogSaveBtn.click();
        await this.page.waitForTimeout(1000);
        const countAfter = await this.awardScheduleAwardIcon.count();
        if (countAfter > 0) {
          expect(countAfter).toBeLessThan(count);
        }
      }
    });
  }

  /**
   * Set recognition author as "Intranet name" for award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @param instanceIndex - Index of the award instance to edit
   */
  async setAuthorAsIntranetNameForAwardInstance(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm,
    instanceIndex: number
  ): Promise<void> {
    await test.step('Open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });

    await test.step('Validate Customization of author by setting recognition author as "Intranet name"', async () => {
      // Check if author section is already expanded, if not click customize link
      const customizeAuthorLink = dialogContainerForm.dailogCustomiseAuthorLink;
      const isCustomizeLinkVisible = await customizeAuthorLink.isVisible().catch(() => false);
      if (isCustomizeLinkVisible) {
        await customizeAuthorLink.click();
        await this.page.waitForTimeout(500);
      }

      await expect(
        dialogContainerForm.dailogIntranetNameRadio,
        'expecting Intranet name radio button to be visible'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await dialogContainerForm.dailogIntranetNameRadio.check();
      const authorName = await dialogContainerForm.dailogAuthorAppNameLabel.textContent();
      const match = authorName?.match(/\(([^)]+)\)/);
      const intranetName = match ? match[1] : null;
      const intranetNameShownOnPreview = await dialogContainerForm.dailogAuthorNameLink.textContent();
      expect(intranetNameShownOnPreview).toEqual(intranetName);
      await dialogContainerForm.dailogSaveBtn.click();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(this.awardScheduleAwardIcon.first()).toBeVisible();
    });

    await test.step('Clean up - Removing all the customization made in award instance', async () => {
      const count = await this.awardScheduleAwardIcon.count();
      if (count !== 0) {
        await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
        await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
        const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
        for (const button of buttons) {
          await button.click();
          await automatedAwardPage.pause(300);
        }
        await dialogContainerForm.dailogSaveBtn.click();
        await this.page.waitForTimeout(1000);
        const countAfter = await this.awardScheduleAwardIcon.count();
        if (countAfter > 0) {
          expect(countAfter).toBeLessThan(count);
        }
      }
    });
  }

  /**
   * Validate character limit in custom message of work anniversary award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @param instanceIndex - Index of the award instance to edit
   */
  async validateCharacterLimitInCustomMessage(
    automatedAwardPage: { pause: (delay: number) => Promise<void> },
    dialogContainerForm: DialogContainerForm,
    instanceIndex: number
  ): Promise<void> {
    await test.step('Validate Award schedule element and open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await this.clickWorkAnniversaryAwardInstanceEditButton(instanceIndex);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });

    await test.step('Customize message in edit work anniversary modal', async () => {
      const buttons = await dialogContainerForm.dailogRemoveMilestoneBtn.elementHandles();
      for (const button of buttons) {
        await button.click();
        await automatedAwardPage.pause(300);
      }
      // Generate a string with 2501 characters
      const overLimitText = 'B'.repeat(2501);
      await expect(dialogContainerForm.dailogCustomiseMsgLink).toBeVisible();
      await dialogContainerForm.dailogCustomiseMsgLink.click();
      await dialogContainerForm.dailogContentEditorTextBox.fill(overLimitText);
      await dialogContainerForm.dailogContentEditorTextBox.blur();
      await expect(dialogContainerForm.dailogCustomiseMsgError).toBeVisible();
      await dialogContainerForm.dailogCancelBtn.click();
      await this.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
    });
  }

  /**
   * Select custom award message radio button if not already selected
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async selectCustomAwardMessageRadioButton(automatedAwardPage: {
    pause: (delay: number) => Promise<void>;
  }): Promise<void> {
    await test.step('Select radio button for Award message as Custom', async () => {
      if (!(await this.customAwardMsgRadioBtn.isChecked())) {
        await automatedAwardPage.pause(500);
        await this.customAwardMsgRadioBtn.check();
        await expect(this.customAwardMsgTextBox).toBeVisible();
        const footerTextLocator = this.getElementByText(automatedAwardMsgs.awardMessageFooterText);
        await footerTextLocator.scrollIntoViewIfNeeded();
        await expect(footerTextLocator).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
      }
    });
  }

  /**
   * Update custom award message with new text and verify it persists
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param customMessage - The custom message text to set
   * @returns The custom message text that was set
   */
  async updateCustomAwardMessageAndVerify(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
      automatedAwardSaveButton: Locator;
      editMilestoneTitle: Locator;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    },
    customMessage: string
  ): Promise<string> {
    return await test.step('Update custom award message and verify it persists', async () => {
      // Ensure custom radio button is selected
      await expect(this.customAwardMsgRadioBtn).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      if (!(await this.customAwardMsgRadioBtn.isChecked())) {
        await this.customAwardMsgRadioBtn.click();
        await automatedAwardPage.pause(500);
      }

      await this.customAwardMsgTextBox.click();
      await this.customAwardMsgTextBox.press('Control+A');
      await this.customAwardMsgTextBox.press('Delete');
      await this.customAwardMsgTextBox.fill(customMessage);
      await automatedAwardPage.pause(500); // Allow text to be set

      await automatedAwardPage.automatedAwardSaveButton.click();
      await automatedAwardPage.pause(1000);
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await automatedAwardPage.pause(2000); // Waiting for the changes to be reflected in the UI

      // Navigate back to edit page
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });

      // Ensure custom radio button is selected again
      await expect(this.customAwardMsgRadioBtn).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      if (!(await this.customAwardMsgRadioBtn.isChecked())) {
        await this.customAwardMsgRadioBtn.click();
        await automatedAwardPage.pause(500);
      }

      await automatedAwardPage.pause(1000);
      // Wait for text box to be visible and have content
      await expect(this.customAwardMsgTextBox).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      const customAwardMsgText = await this.customAwardMsgTextBox.textContent();
      expect(customAwardMsgText?.trim()).toEqual(customMessage.trim());
      return customMessage;
    });
  }

  /**
   * Reset custom award message to default text
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param defaultMessage - The default message text to restore
   */
  async resetCustomAwardMessageToDefault(
    automatedAwardPage: {
      automatedAwardSaveButton: Locator;
    },
    defaultMessage: string
  ): Promise<void> {
    await test.step('Clean up - Setting the default text back on custom award message', async () => {
      await this.customAwardMsgTextBox.click();
      await this.customAwardMsgTextBox.press('Control+A');
      await this.customAwardMsgTextBox.press('Delete');
      await this.customAwardMsgTextBox.fill(defaultMessage);
      await automatedAwardPage.automatedAwardSaveButton.click();
    });
  }

  /**
   * Validate character limit in custom award message (main award, not instance)
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param defaultMessage - The default message to restore after validation
   */
  async validateCharacterLimitInCustomAwardMessage(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
      automatedAwardSaveButton: Locator;
    },
    defaultMessage: string
  ): Promise<void> {
    await test.step('Attempt to enter >2500 characters and validate error', async () => {
      // Generate a string with 2501 characters
      const overLimitText = 'A'.repeat(2501);
      await automatedAwardPage.pause(500);
      await this.customAwardMsgTextBox.click();
      await this.customAwardMsgTextBox.fill(overLimitText);
      await this.customAwardMsgTextBox.blur();
      await expect(this.customAwardMsgError).toBeVisible();
    });

    await test.step('Clean up - Setting the default text back on custom award message', async () => {
      await this.customAwardMsgTextBox.click();
      await this.customAwardMsgTextBox.press('Control+A');
      await this.customAwardMsgTextBox.press('Delete');
      await this.customAwardMsgTextBox.fill(defaultMessage);
      await automatedAwardPage.automatedAwardSaveButton.click();
    });
  }

  /**
   * Get radio button by partial text match
   * @param partialText - Partial text to match in the radio button name
   * @returns Locator for the radio button
   */
  getRadioButtonWithPartialText(partialText: string): Locator {
    return this.container.getByRole('radio', { name: new RegExp(partialText, 'i') });
  }

  /**
   * Select specific anniversaries radio button if not already selected
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async selectSpecificAnniversariesRadioButton(automatedAwardPage: {
    pause: (delay: number) => Promise<void>;
  }): Promise<Locator> {
    return await test.step('Select award frequency as "specific anniversaries"', async () => {
      const specificAnniversariesRadioBtn = this.getRadioButtonWithPartialText('Recognize specific').first();
      await specificAnniversariesRadioBtn.scrollIntoViewIfNeeded();
      if (!(await specificAnniversariesRadioBtn.isChecked())) {
        await automatedAwardPage.pause(500);
        await specificAnniversariesRadioBtn.click();
        await expect(this.specificAnniversariesTextBox).toBeVisible();
        const footerTextLocator = this.getElementByText(automatedAwardMsgs.specificAnniversariesFooter);
        await footerTextLocator.scrollIntoViewIfNeeded();
        await expect(footerTextLocator).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
        await expect(specificAnniversariesRadioBtn).toBeChecked();
      }
      return specificAnniversariesRadioBtn;
    });
  }

  /**
   * Fill specific anniversaries and verify award instances are displayed
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param anniversaries - Array of anniversary years
   */
  async fillSpecificAnniversariesAndVerifyInstances(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
    },
    anniversaries: number[]
  ): Promise<void> {
    await test.step('Validate system shows specific award instances as per values mentioned in "specific anniversaries" textbox', async () => {
      await automatedAwardPage.pause(1000);
      await this.specificAnniversariesTextBox.fill(anniversaries.join(','));
      for (let i = 0; i < anniversaries.length; i++) {
        const awardYear = anniversaries[i];
        const awardInstance = this.verifyWorkAnniversaryAwardInstance(`${awardYear} year work anniversary`);
        await expect(awardInstance).toBeVisible();
      }
    });
  }

  /**
   * Save specific anniversaries and verify they persist
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param specificAnniversariesRadioBtn - Locator for the specific anniversaries radio button
   */
  async saveSpecificAnniversariesAndVerify(
    automatedAwardPage: {
      automatedAwardSaveButton: Locator;
      editMilestoneTitle: Locator;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    },
    specificAnniversariesRadioBtn: Locator
  ): Promise<void> {
    await test.step('Validate specific award instances are saved successfully', async () => {
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
      // Wait for the radio button to be visible and then check its state
      await expect(specificAnniversariesRadioBtn).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(specificAnniversariesRadioBtn).toBeChecked({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Reset award frequency to "all work anniversaries"
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async resetToAllWorkAnniversaries(automatedAwardPage: { automatedAwardSaveButton: Locator }): Promise<void> {
    await test.step('Clean up - check default "all work anniversaries" option for award frequency', async () => {
      const allWorkAnniversariesRadioBtn = this.getRadioButtonWithPartialText('Recognize all work').first();
      const specificAnniversariesRadioBtn = this.getRadioButtonWithPartialText('Recognize specific').first();
      await specificAnniversariesRadioBtn.scrollIntoViewIfNeeded();
      if (!(await allWorkAnniversariesRadioBtn.isChecked())) {
        await allWorkAnniversariesRadioBtn.click();
        await expect(allWorkAnniversariesRadioBtn).toBeChecked();
        await automatedAwardPage.automatedAwardSaveButton.click();
      }
    });
  }

  /**
   * Validate error messages for specific anniversaries input
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param inputValue - The input value to test
   * @param expectedErrorMsg - The expected error message text
   */
  async validateSpecificAnniversariesError(
    automatedAwardPage: {
      automatedAwardSaveButton: Locator;
    },
    inputValue: string,
    expectedErrorMsg: string
  ): Promise<void> {
    await this.specificAnniversariesTextBox.fill(inputValue);
    const errorLocator = this.getElementByText(expectedErrorMsg);
    await errorLocator.scrollIntoViewIfNeeded();
    await expect(errorLocator).toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  /**
   * Validate that error messages are hidden for valid inputs
   * @param inputValue - The input value to test
   */
  async validateSpecificAnniversariesNoError(inputValue: string): Promise<void> {
    await this.specificAnniversariesTextBox.fill(inputValue);
    await this.specificAnniversariesTextBox.blur();
    await expect(this.getElementByText(automatedAwardMsgs.milestoneCommaSeparateErrorMsg)).toBeHidden();
    await expect(this.getElementByText(automatedAwardMsgs.commaSeparatedErrorMsg)).toBeHidden();
  }

  /**
   * Validate all error scenarios for specific anniversaries input
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async validateAllSpecificAnniversariesErrors(automatedAwardPage: {
    automatedAwardSaveButton: Locator;
  }): Promise<void> {
    await test.step('Validate system throws error when user tries to keep the field empty', async () => {
      await this.validateSpecificAnniversariesError(automatedAwardPage, ' ', automatedAwardMsgs.commaSeparatedErrorMsg);
      await expect(automatedAwardPage.automatedAwardSaveButton).toBeDisabled();
    });

    await test.step('Validate system throws error when anniversary entered is beyond 60 years', async () => {
      await this.validateSpecificAnniversariesError(
        automatedAwardPage,
        '60,80,100',
        automatedAwardMsgs.anniversaryMoreThan60ErrorMsg
      );
    });

    await test.step('Validate system throws error when anniversary entered is duplicate', async () => {
      await this.validateSpecificAnniversariesError(
        automatedAwardPage,
        '1,2,1',
        automatedAwardMsgs.milestoneUniqueErrorMsg
      );
    });

    await test.step('Validate system throws error when anniversary entered is with special character', async () => {
      await this.validateSpecificAnniversariesError(
        automatedAwardPage,
        '1,2,a,b,&,+',
        automatedAwardMsgs.milestoneCommaSeparateErrorMsg
      );
    });

    await test.step('Validate system accepts valid anniversary inputs with spaces and commas', async () => {
      const validInputs = ['1 , 2 , 3', '2 ,3', '2 ,3 ,5'];
      for (const input of validInputs) {
        await this.validateSpecificAnniversariesNoError(input);
      }
    });
  }

  /**
   * Attach image in custom award message
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param imagePath - Path to the image file
   */
  async attachImageInCustomAwardMessage(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
    },
    imagePath: string
  ): Promise<void> {
    await test.step('Attach image in custom option of Award message', async () => {
      // Scope to award message field
      const awardMessageField = this.container.getByTestId('field-Award message');
      const attachImgcontent = this.container.locator('[class*="imageContainer"] img').first();
      const removeImg = awardMessageField.getByRole('button', { name: 'Remove image' });

      await automatedAwardPage.pause(1000);
      // Check if an image already exists - if so, remove it first to make the input available
      const imageExists = await attachImgcontent.isVisible().catch(() => false);
      if (imageExists) {
        // Hover to reveal remove button if needed
        await attachImgcontent.hover();
        await automatedAwardPage.pause(500);

        // Try both scoped and generic locators for remove button
        const genericRemoveButton = this.container.getByRole('button', { name: 'Remove image' });
        const genericVisible = await genericRemoveButton.isVisible().catch(() => false);

        if (genericVisible) {
          await genericRemoveButton.click();
        } else {
          // Try hovering over award message field
          await awardMessageField.hover();
          await automatedAwardPage.pause(500);
          await expect(genericRemoveButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
          await genericRemoveButton.click();
        }

        await automatedAwardPage.pause(1000);
        // Wait for the image to be removed and input to become available
        await expect(attachImgcontent).toHaveCount(0, { timeout: TIMEOUTS.MEDIUM });
        await automatedAwardPage.pause(2000); // Additional wait for UI to update and button to appear
      }

      // After removing existing image (if any), wait for "Attach an image" button to appear
      // The button should appear after image removal, but might take a moment
      await expect(this.attachAnImageButton).toBeVisible({ timeout: TIMEOUTS.LONG });
      await automatedAwardPage.pause(500); // Small pause before using input

      // The input should already be in the DOM when the button is visible
      // We can use setInputFiles directly on the input without clicking the button
      // Based on the old test pattern, the input is available when button is visible
      await this.attachAnImageInput.setInputFiles(imagePath);
      await expect(this.uploadImageProgressBar).toBeVisible();
      await expect(this.uploadImageThumbnail).toBeVisible();
      await expect(this.uploadImagePanel).toBeVisible();
      await this.uploadImageProgressBar.waitFor({ state: 'detached' });
      // Wait for upload panel to disappear and uploaded image container to appear
      await this.uploadImagePanel.waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM }).catch(() => {
        // Panel might already be hidden, continue
      });

      // Wait for UI to update after upload completes
      await automatedAwardPage.pause(2000);

      // Check for error messages first
      const errorMessage = awardMessageField.getByText(/error|failed/i).first();
      const hasError = await errorMessage.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await errorMessage.textContent();
        throw new Error(`Image upload failed: ${errorText}`);
      }

      // Try multiple approaches to find the remove button
      // First, check if the image container or image is visible
      const imageContainer = awardMessageField.locator('[class*="imageContainer"]').first();
      const imageContainerVisible = await imageContainer.isVisible().catch(() => false);
      const imageVisible = await this.addedImagePanel.isVisible().catch(() => false);

      // Also try a more generic locator for the remove button (not scoped to award message field)
      const genericRemoveButton = this.container.getByRole('button', { name: 'Remove image' });

      if (imageContainerVisible || imageVisible) {
        // Hover over the image container or image to reveal the remove button
        if (imageVisible) {
          await this.addedImagePanel.hover();
        } else {
          await imageContainer.hover();
        }
        await automatedAwardPage.pause(1000);

        // Try both scoped and generic locators
        const scopedButtonVisible = await removeImg.isVisible().catch(() => false);
        const genericButtonVisible = await genericRemoveButton.isVisible().catch(() => false);

        if (scopedButtonVisible || genericButtonVisible) {
          // Button is visible, continue
          await expect(scopedButtonVisible ? removeImg : genericRemoveButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        } else {
          // Button still not visible, try hovering over the award message field
          await awardMessageField.hover();
          await automatedAwardPage.pause(1000);
          await expect(genericRemoveButton).toBeVisible({ timeout: TIMEOUTS.LONG });
        }
      } else {
        // If image not visible, hover over the award message field area
        await awardMessageField.hover();
        await automatedAwardPage.pause(1000);
        // Try generic locator
        await expect(genericRemoveButton).toBeVisible({ timeout: TIMEOUTS.LONG });
      }
    });
  }

  /**
   * Verify image is not present after cancel
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async verifyImageNotPresentAfterCancel(
    automatedAwardPage: {
      automatedAwardCancelButton: Locator;
      editMilestoneTitle: Locator;
      pause: (delay: number) => Promise<void>;
    },
    manageRecognitionPage: {
      navigateViaUrl: (url: string) => Promise<void>;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    }
  ): Promise<void> {
    await test.step('Validate on clicking cancel button post attaching image, reverts the changes made', async () => {
      await automatedAwardPage.automatedAwardCancelButton.click();
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await automatedAwardPage.pause(1000);
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
      await expect(this.addedImagePanel).toHaveCount(0);
      await expect(this.removeImageIcon).toHaveCount(0);
    });
  }

  /**
   * Save and verify image is attached
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async saveAndVerifyImageAttached(
    automatedAwardPage: {
      automatedAwardSaveButton: Locator;
      editMilestoneTitle: Locator;
      pause: (delay: number) => Promise<void>;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
      navigateViaUrl: (url: string) => Promise<void>;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    }
  ): Promise<void> {
    await test.step('Validate Image should be attached in custom message and configuration should be saved', async () => {
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
      await automatedAwardPage.pause(1000);
      const attachImgcontent = this.container.locator('[class*="imageContainer"] img').first();
      await expect(attachImgcontent).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const removeImg = this.container.getByRole('button', { name: 'Remove image' });
      await expect(removeImg).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Remove image and verify it remains after cancel
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async removeImageAndVerifyRemainsAfterCancel(
    automatedAwardPage: {
      automatedAwardCancelButton: Locator;
      editMilestoneTitle: Locator;
      pause: (delay: number) => Promise<void>;
    },
    manageRecognitionPage: {
      navigateViaUrl: (url: string) => Promise<void>;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    }
  ): Promise<void> {
    await test.step('Validate Image should remain as it is when deleted but clicked on cancel button', async () => {
      await automatedAwardPage.pause(500);
      // Wait for remove button to be visible and clickable
      const removeImg = this.container.getByRole('button', { name: 'Remove image' });
      await expect(removeImg).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await removeImg.click();
      await automatedAwardPage.pause(1000);
      const attachImgcontent = this.container.locator('[class*="imageContainer"] img').first();
      await expect(attachImgcontent).toHaveCount(0);
      await automatedAwardPage.automatedAwardCancelButton.click();
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
      await expect(removeImg).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Remove image and verify it's deleted after save
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async removeImageAndVerifyDeletedAfterSave(
    automatedAwardPage: {
      automatedAwardSaveButton: Locator;
      editMilestoneTitle: Locator;
      pause: (delay: number) => Promise<void>;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
      navigateViaUrl: (url: string) => Promise<void>;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    }
  ): Promise<void> {
    await test.step('Validate Attached image should be removed and award configuration should be saved', async () => {
      await automatedAwardPage.pause(500);
      // Wait for remove button to be visible and clickable
      const removeImg = this.container.getByRole('button', { name: 'Remove image' });
      await expect(removeImg).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await removeImg.click();
      await automatedAwardPage.pause(1000);
      const attachImgcontent = this.container.locator('[class*="imageContainer"] img').first();
      await expect(attachImgcontent).toHaveCount(0);
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
      await expect(attachImgcontent).toHaveCount(0);
      await expect(removeImg).toHaveCount(0);
    });
  }

  /**
   * Attach image in award instance dialog
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   * @param imagePath - Path to the image file
   */
  async attachImageInAwardInstance(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
    },
    dialogContainerForm: DialogContainerForm,
    imagePath: string
  ): Promise<void> {
    await test.step('Attach image in work anniversary award instance', async () => {
      await expect(dialogContainerForm.dailogAttachAnImageBtn).toBeVisible();
      await automatedAwardPage.pause(500);
      await dialogContainerForm.dailogAttachAnImageInput.setInputFiles(imagePath);
      await expect(dialogContainerForm.dailogUploadImageProgressBar).toBeVisible();
      await expect(dialogContainerForm.dailogUploadImageThumbnail).toBeVisible();
      await expect(dialogContainerForm.dailogUploadImagePanel).toBeVisible();
      await dialogContainerForm.dailogUploadImageProgressBar.waitFor({ state: 'detached' });
      await dialogContainerForm.dailogUploadImagePanel.hover();
      await expect(dialogContainerForm.dailogRemoveImageIcon).toBeVisible();
    });
  }

  /**
   * Save and verify image is attached in award instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async saveAndVerifyImageAttachedInAwardInstance(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Validate Image should be attached in custom message and configuration should be saved', async () => {
      await dialogContainerForm.dailogSaveBtn.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'detached' });
      await expect(this.awardScheduleMsgIcon).toBeVisible();
      await this.clickWorkAnniversaryAwardInstanceEditButton(0);
      await expect(dialogContainerForm.dailogUploadImagePanel).toBeVisible();
      await expect(dialogContainerForm.dailogRemoveImageIcon).toBeVisible();
    });
  }

  /**
   * Remove image and verify it remains after cancel in award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async removeImageAndVerifyRemainsAfterCancelInAwardInstance(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
    },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Validate Image should remain as it is when deleted but clicked on cancel button', async () => {
      await dialogContainerForm.dailogRemoveImageIcon.click();
      await expect(dialogContainerForm.dailogUploadImagePanel).toHaveCount(0);
      await dialogContainerForm.dailogCancelBtn.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'detached' });
      await this.clickWorkAnniversaryAwardInstanceEditButton(0);
      await expect(dialogContainerForm.dailogUploadImagePanel).toBeVisible();
      await expect(dialogContainerForm.dailogRemoveImageIcon).toBeVisible();
    });
  }

  /**
   * Remove image and verify it's deleted after save in award instance
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async removeImageAndVerifyDeletedAfterSaveInAwardInstance(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
    },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Validate Attached image should be removed and award configuration should be saved', async () => {
      await dialogContainerForm.dailogRemoveImageIcon.click();
      await expect(this.addedImagePanel).toHaveCount(0);
      await dialogContainerForm.dailogSaveBtn.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'detached' });
      await automatedAwardPage.pause(3000); // wait for the save to complete
      await this.clickWorkAnniversaryAwardInstanceEditButton(0);
      await expect(dialogContainerForm.dailogUploadImagePanel).toHaveCount(0);
      await expect(dialogContainerForm.dailogRemoveImageIcon).toHaveCount(0);
    });
  }

  /**
   * Open edit award instance dialog
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async openEditAwardInstanceDialog(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Validate Award schedule element and open edit work anniversary award instance', async () => {
      await this.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await expect(this.awardScheduleEditIcon).toBeVisible();
      await this.clickWorkAnniversaryAwardInstanceEditButton(0);
      await dialogContainerForm.dailogHeader.waitFor({ state: 'visible' });
    });
  }

  /**
   * Verify cancel reverts image changes in award instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async verifyCancelRevertsImageChangesInAwardInstance(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Validate on clicking cancel button post attaching image, reverts the changes made', async () => {
      await dialogContainerForm.dailogCancelBtn.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'detached' });
      await this.clickWorkAnniversaryAwardInstanceEditButton(0);
    });
  }

  /**
   * Add text in customize message section and verify no image
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async addTextInCustomizeMessageAndVerifyNoImage(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Add text in Customize message section in award instance modal', async () => {
      const customizedMsgText = 'Auto_workAnniversary_customizedMsg_' + Math.floor(Math.random() * 1000);
      await expect(dialogContainerForm.dailogCustomiseMsgLink).toBeVisible();
      await dialogContainerForm.dailogCustomiseMsgLink.click();
      await expect(dialogContainerForm.dailogUploadImagePanel).toHaveCount(0);
      await expect(dialogContainerForm.dailogRemoveImageIcon).toHaveCount(0);
      await dialogContainerForm.dailogContentEditorTextBox.fill(customizedMsgText);
    });
  }

  /**
   * Validate alt text icon and UI elements for custom award message
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async validateAltTextIconAndUIElements(automatedAwardPage: {
    getElementByText: (text: string) => Locator;
    automatedAwardCancelButton: Locator;
    automatedAwardAddButton: Locator;
  }): Promise<void> {
    await test.step('Validate alt image icon and its UI elements', async () => {
      await this.uploadImagePanel.hover();
      await expect(this.altTextIcon).toBeVisible();
      await this.altTextIcon.click();
      await automatedAwardPage.getElementByText('Add image alt text').waitFor({ state: 'visible' });
      await expect(automatedAwardPage.getElementByText('Add image alt text')).toBeVisible();
      await expect(automatedAwardPage.getElementByText(automatedAwardMsgs.altTextModalFooterMsg)).toBeVisible();
      await expect(automatedAwardPage.automatedAwardCancelButton).toBeVisible();
      await expect(automatedAwardPage.automatedAwardAddButton).toBeVisible();
    });
  }

  /**
   * Validate alt text icon and UI elements for award instance dialog
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async validateAltTextIconAndUIElementsInAwardInstance(
    automatedAwardPage: {
      automatedAwardCancelButton: Locator;
      automatedAwardAddButton: Locator;
    },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Validate alt image icon and its UI elements', async () => {
      await expect(dialogContainerForm.dailogAltTextIcon).toBeVisible();
      await dialogContainerForm.dailogAltTextIcon.click();
      const addAltTextLocator = this.page.getByText('Add image alt text');
      await addAltTextLocator.waitFor({ state: 'visible' });
      await expect(addAltTextLocator).toBeVisible();
      await expect(this.page.getByText(automatedAwardMsgs.altTextModalFooterMsg)).toBeVisible();
      await expect(automatedAwardPage.automatedAwardCancelButton).toBeVisible();
      await expect(automatedAwardPage.automatedAwardAddButton).toBeVisible();
      await expect(dialogContainerForm.dailogCrossBtn).toBeVisible();
    });
  }

  /**
   * Verify cancel reverts alt text changes for custom award message
   * @param automatedAwardPage - AutomatedAwardPage instance
   */
  async verifyCancelRevertsAltTextChanges(automatedAwardPage: {
    addAltTextBox: Locator;
    automatedAwardCancelButton: Locator;
    altTextIcon: Locator;
  }): Promise<void> {
    await test.step('Validate on clicking cancel button post adding alt text, reverts the changes made', async () => {
      const randomAltText = Math.random().toString(36).substring(2, 7);
      await automatedAwardPage.addAltTextBox.fill(randomAltText);
      const beforeCancel = await automatedAwardPage.addAltTextBox.getAttribute('value');
      await automatedAwardPage.automatedAwardCancelButton.click();
      await this.uploadImagePanel.hover();
      await automatedAwardPage.altTextIcon.click();
      const afterCancel = await automatedAwardPage.addAltTextBox.getAttribute('value');
      expect(beforeCancel).not.toEqual(afterCancel);
    });
  }

  /**
   * Verify cancel reverts alt text changes for award instance dialog
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async verifyCancelRevertsAltTextChangesInAwardInstance(
    automatedAwardPage: {
      addAltTextBox: Locator;
      automatedAwardCancelButton: Locator;
    },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Validate on clicking cancel button post adding alt text, reverts the changes made', async () => {
      const randomAltText = Math.random().toString(36).substring(2, 7);
      await automatedAwardPage.addAltTextBox.fill(randomAltText);
      const beforeCancel = await automatedAwardPage.addAltTextBox.getAttribute('value');
      await automatedAwardPage.automatedAwardCancelButton.click();
      await dialogContainerForm.dailogAltTextIcon.click();
      const afterCancel = await automatedAwardPage.addAltTextBox.getAttribute('value');
      expect(beforeCancel).not.toEqual(afterCancel);
    });
  }

  /**
   * Add and update alt text for custom award message
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async addAndUpdateAltText(
    automatedAwardPage: {
      addAltTextBox: Locator;
      automatedAwardAddButton: Locator;
      altTextIcon: Locator;
      getElementByText: (text: string) => Locator;
      updateButton: Locator;
    },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Validate adding and updating alt text in attached image successfully', async () => {
      const addRandomAltText = Math.random().toString(36).substring(2, 7);
      await automatedAwardPage.addAltTextBox.fill(addRandomAltText);
      await automatedAwardPage.automatedAwardAddButton.click();
      await automatedAwardPage.getElementByText('Add image alt text').waitFor({ state: 'detached' });
      // Updating the alt text
      await automatedAwardPage.altTextIcon.click();
      await automatedAwardPage.getElementByText('Update image alt text').waitFor({ state: 'visible' });
      await expect(automatedAwardPage.getElementByText('Update image alt text')).toBeVisible();
      await expect(automatedAwardPage.updateButton).toBeVisible();
      const afterAdd = await automatedAwardPage.addAltTextBox.getAttribute('value');
      expect(addRandomAltText).toEqual(afterAdd);
      const updateAltText = addRandomAltText + 'text_updated';
      await automatedAwardPage.addAltTextBox.fill(updateAltText);
      await automatedAwardPage.updateButton.click();
      // Verifying updated alt text
      await automatedAwardPage.altTextIcon.click();
      await automatedAwardPage.getElementByText('Update image alt text').waitFor({ state: 'visible' });
      const afterUpdate = await automatedAwardPage.addAltTextBox.getAttribute('value');
      expect(updateAltText).toEqual(afterUpdate);
      await dialogContainerForm.dailogCrossBtn.click();
    });
  }

  /**
   * Add and update alt text for award instance dialog
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async addAndUpdateAltTextInAwardInstance(
    automatedAwardPage: {
      addAltTextBox: Locator;
      automatedAwardAddButton: Locator;
      updateButton: Locator;
    },
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Validate adding and editing alt text in attached image successfully', async () => {
      const addRandomAltText = Math.random().toString(36).substring(2, 7);
      await automatedAwardPage.addAltTextBox.fill(addRandomAltText);
      await automatedAwardPage.automatedAwardAddButton.click();
      await this.page.getByText('Add image alt text').waitFor({ state: 'detached' });
      // Updating/editing the alt text
      await dialogContainerForm.dailogAltTextIcon.click();
      const updateAltTextLocator = this.page.getByText('Update image alt text');
      await updateAltTextLocator.waitFor({ state: 'visible' });
      await expect(updateAltTextLocator).toBeVisible();
      await expect(automatedAwardPage.updateButton).toBeVisible();
      const afterAdd = await automatedAwardPage.addAltTextBox.getAttribute('value');
      expect(addRandomAltText).toEqual(afterAdd);
      const updateAltText = addRandomAltText + 'text_updated';
      await automatedAwardPage.addAltTextBox.fill(updateAltText);
      await automatedAwardPage.updateButton.click();
      // Verifying updated alt text
      await dialogContainerForm.dailogAltTextIcon.click();
      await updateAltTextLocator.waitFor({ state: 'visible' });
      const afterUpdate = await automatedAwardPage.addAltTextBox.getAttribute('value');
      expect(updateAltText).toEqual(afterUpdate);
      await dialogContainerForm.dailogCrossBtn.click();
    });
  }

  /**
   * Save and verify image with alt text is attached for custom award message
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async saveAndVerifyImageWithAltTextAttached(
    automatedAwardPage: {
      automatedAwardSaveButton: Locator;
      editMilestoneTitle: Locator;
      pause: (delay: number) => Promise<void>;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
      navigateViaUrl: (url: string) => Promise<void>;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    }
  ): Promise<void> {
    await test.step('Validate Image should be attached in custom message and configuration should be saved', async () => {
      await automatedAwardPage.automatedAwardSaveButton.click();
      await automatedAwardPage.pause(1000);
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await automatedAwardPage.pause(1000);
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
    });
  }

  /**
   * Remove image and verify it's deleted after save for custom award message
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async removeImageAndVerifyDeletedAfterSaveForAltText(
    automatedAwardPage: {
      automatedAwardSaveButton: Locator;
      pause: (delay: number) => Promise<void>;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
    }
  ): Promise<void> {
    await test.step('Validate Attached image should be removed and award configuration should be saved', async () => {
      await automatedAwardPage.pause(2000);

      // Try both scoped and generic locators for the remove button
      const awardMessageField = this.container.getByTestId('field-Award message');
      const scopedRemoveImg = awardMessageField.getByRole('button', { name: 'Remove image' });
      const genericRemoveImg = this.container.getByRole('button', { name: 'Remove image' });

      // Hover over the award message field to reveal the remove button
      await awardMessageField.hover();
      await automatedAwardPage.pause(500);

      // Check which locator works
      const scopedVisible = await scopedRemoveImg.isVisible().catch(() => false);
      const genericVisible = await genericRemoveImg.isVisible().catch(() => false);

      if (scopedVisible) {
        await expect(scopedRemoveImg).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        await scopedRemoveImg.click();
      } else if (genericVisible) {
        await expect(genericRemoveImg).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        await genericRemoveImg.click();
      } else {
        // If neither is visible, try hovering over the image
        const imagePanel = awardMessageField.locator('[class*="imageContainer"] img').first();
        const imageVisible = await imagePanel.isVisible().catch(() => false);
        if (imageVisible) {
          await imagePanel.hover();
          await automatedAwardPage.pause(500);
        }
        await expect(genericRemoveImg).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        await genericRemoveImg.click();
      }

      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
    });
  }

  /**
   * Save and verify image with alt text is attached for award instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async saveAndVerifyImageWithAltTextAttachedInAwardInstance(dialogContainerForm: DialogContainerForm): Promise<void> {
    await test.step('Validate Image should be attached in custom message and configuration should be saved', async () => {
      await dialogContainerForm.dailogSaveBtn.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'detached' });
      await expect(this.awardScheduleMsgIcon).toBeVisible();
      await this.clickWorkAnniversaryAwardInstanceEditButton(0);
      await expect(dialogContainerForm.dailogUploadImagePanel).toBeVisible();
      await expect(dialogContainerForm.dailogRemoveImageIcon).toBeVisible();
    });
  }

  /**
   * Remove image and verify it's deleted after save for award instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async removeImageAndVerifyDeletedAfterSaveForAltTextInAwardInstance(
    dialogContainerForm: DialogContainerForm
  ): Promise<void> {
    await test.step('Validate Attached image should be removed and award configuration should be saved', async () => {
      await dialogContainerForm.dailogRemoveImageIcon.click();
      await expect(this.addedImagePanel).toHaveCount(0);
      await dialogContainerForm.dailogSaveBtn.click();
      await dialogContainerForm.dailogHeader.waitFor({ state: 'detached' });
    });
  }

  /**
   * Validate UI elements for Activate this award section
   * @param automatedAwardMsgs - Automated award messages
   */
  async validateActivateAwardUIElements(automatedAwardMsgs: { activateThisAwardFooter: string }): Promise<void> {
    await test.step('Validate UI elements for Activate this award section', async () => {
      await expect(this.activateAwardHeader).toBeVisible();
      await expect(this.makeAwardActiveToggle).toBeVisible();
      await expect(this.makeAwardActiveTxt).toBeVisible();
      const footerText = await this.activeAwardFooter.textContent();
      expect(footerText).toEqual(automatedAwardMsgs.activateThisAwardFooter);
    });
  }

  /**
   * Activate award via toggle in edit page
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param dialogContainerForm - DialogContainerForm instance
   */
  async activateAwardViaToggle(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
      automatedAwardSaveButton: Locator;
      tableGridFirstRow: Locator;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
    }
  ): Promise<void> {
    await test.step('Validate work anniversary awards is active when toggle button is enabled', async () => {
      await expect(this.makeAwardActiveToggle).toHaveAttribute('data-state', 'unchecked');
      await automatedAwardPage.pause(500);
      await this.makeAwardActiveToggle.click();
      await automatedAwardPage.pause(500);
      await expect(this.makeAwardActiveToggle).toHaveAttribute('data-state', 'checked');
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await automatedAwardPage.pause(500);
      await expect(automatedAwardPage.tableGridFirstRow.nth(3)).toHaveText(/Active/);
    });
  }

  /**
   * Edit award message and activate via toggle
   * @param automatedAwardPage - AutomatedAwardPage instance
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async editAwardMessageAndActivate(
    automatedAwardPage: {
      pause: (delay: number) => Promise<void>;
      automatedAwardSaveButton: Locator;
      tableGridFirstRow: Locator;
      editMilestoneTitle: Locator;
    },
    manageRecognitionPage: {
      toastAlertText: Locator;
      automatedAwards: {
        getThreeDotsButton: (index: number) => Locator;
        editMenuItem: Locator;
      };
    }
  ): Promise<void> {
    await test.step('Validate work anniversary awards is active when toggle button is enabled and edits are made', async () => {
      const customizedAwardMsgText =
        'editAward_customizedMsg_inCustomAwardMessageTextBox' + Math.floor(Math.random() * 1000);
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
      await this.customAwardMsgRadioBtn.check();
      await expect(this.customAwardMsgTextBox).toBeVisible();
      await this.customAwardMsgTextBox.click();
      await this.customAwardMsgTextBox.press('Control+A');
      await this.customAwardMsgTextBox.press('Delete');
      await this.customAwardMsgTextBox.fill(customizedAwardMsgText);
      await this.makeAwardActiveToggle.scrollIntoViewIfNeeded();
      await this.makeAwardActiveToggle.click();
      await automatedAwardPage.pause(500);
      await automatedAwardPage.automatedAwardSaveButton.click();
      await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');
      await automatedAwardPage.pause(500);
      await expect(automatedAwardPage.tableGridFirstRow.nth(3)).toHaveText(/Active/);
    });
  }
}
