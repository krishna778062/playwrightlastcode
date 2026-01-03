import { expect, Locator, Page } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';

import { TestDataGenerator, TIMEOUTS } from '@/src/core';

export class MilestoneAwardInstance extends DialogBox {
  private dialog: Locator;
  private dialogCancelBtn: Locator;
  private dialogCloseButton: Locator;
  private dialogSaveBtn: Locator;
  private heading: Locator;
  private confettiBox: Locator;
  private confettiBoxIcon: Locator;
  private confettiBoxAnniversaryHeading: Locator;
  private confettiBoxAnniversaryMessageText: Locator;
  private customMessagePlusButton: Locator;
  private customAuthorPlusButton: Locator;
  private customBadgePlusButton: Locator;
  private customAwardPointsPlusButton: Locator;
  private removeCustomMessageButton: Locator;
  private removeCustomAuthorButton: Locator;
  private removeCustomBadgeButton: Locator;
  private removeCustomAwardPointsButton: Locator;
  private customMessageInputBox: Locator;
  private customAuthorRadioButton: Locator;
  private customAuthorUserInputBox: Locator;
  private customAwardPointToReceiversSwitch: Locator;
  customAwardPointsInputBox: Locator;

  private suggesterContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.dialog = page.locator('div [role="dialog"] > div');
    this.dialogCloseButton = this.dialog.getByRole('button', { name: 'Close' });
    this.dialogCancelBtn = this.dialog.getByRole('button', { name: 'Cancel' });
    this.dialogSaveBtn = this.dialog.locator('button[aria-label="Save milestone instance"]');

    this.heading = this.dialog.locator('h2[class*="Dialog-module__title"] > span');
    this.confettiBox = this.dialog.locator('div[class*="ConfettiWrapper_confetti"]');
    this.confettiBoxIcon = this.confettiBox.locator('[data-testid="award-icon"]');
    this.confettiBoxAnniversaryHeading = this.confettiBox.locator('h2');
    this.confettiBoxAnniversaryMessageText = this.confettiBox.locator('div[class="Tiptap_tiptapContent"] p');

    this.customMessagePlusButton = this.dialog.locator('button[aria-label="Customize milestone instance message"]');
    this.customAuthorPlusButton = this.dialog.locator('button[aria-label="Customize milestone instance author"]');
    this.customBadgePlusButton = this.dialog.locator('button[aria-label="Customize milestone instance badge"]');
    this.customAwardPointsPlusButton = this.dialog.locator(
      'button[aria-label="Customize milestone instance award points"]'
    );

    this.removeCustomMessageButton = this.dialog.locator(
      'button[aria-label="Remove milestone instance message customization"]'
    );
    this.removeCustomAuthorButton = this.dialog.locator(
      'button[aria-label="Remove milestone instance author customization"]'
    );
    this.removeCustomBadgeButton = this.dialog.locator(
      'button[aria-label="Remove milestone instance badge customization"]'
    );
    this.removeCustomAwardPointsButton = this.dialog.locator(
      'button[aria-label="Remove milestone instance award points customization"]'
    );

    this.customMessageInputBox = this.dialog.locator('div[class="tiptap ProseMirror"][contenteditable="true"]');
    this.customAuthorRadioButton = this.dialog.locator('input[id="instanceAuthor_typeUSER"]');
    this.customAuthorUserInputBox = this.dialog.locator('input[role="combobox"]');
    this.customAwardPointToReceiversSwitch = this.dialog.getByRole('switch', { name: 'Award points to receivers' });
    this.customAwardPointsInputBox = this.dialog.locator('input[id="anniversaryPoints"]');

    this.suggesterContainer = this.page.locator('div[role="listbox"]');
  }

  async validateTheAwardInstanceModalIsOpened(anniversaryInstance: number): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.container, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: 'Waiting for milestone award instance dialog to be visible',
    });
    const headingText = await this.heading.textContent();
    if (headingText?.trim() !== `${anniversaryInstance + 1} year work anniversary`) {
      throw new Error(
        `Expected heading to be '${anniversaryInstance + 1} year work anniversary' but found '${headingText}'`
      );
    }
  }

  async closeTheAwardInstanceModal(): Promise<void> {
    await this.dialogCloseButton.click();
  }

  async saveTheChangesInAwardInstanceModal() {
    await this.dialogSaveBtn.click();
  }

  /**
   * This method returns a locator for the suggested item.
   * @param identifier - The identifier can be a string or a number.
   * @returns {Locator} - The locator for the option.
   */
  getOption(identifier: string | number): Locator {
    if (typeof identifier === 'string') {
      return this.suggesterContainer.getByText(identifier);
    } else {
      return this.suggesterContainer.locator('[role="option"]').nth(identifier);
    }
  }

  /**
   * Ensure toggle enabled, change points, verify plus/minus behavior, then save.
   * @param page - The Playwright page object
   */
  async enableAndEditPointsInDialogBox() {
    const dialogContainerForm = this.page.locator('[role="dialog"][data-state="open"] > div');
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

  async validateTheRemoveButton(customOptions: string) {
    if (customOptions === 'customAwardPoints') {
      await this.verifier.verifyCountOfElementsIsEqualTo(this.removeCustomAwardPointsButton, 1, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        assertionMessage: 'Remove milestone instance award points customization button is visible',
      });
    } else if (customOptions === 'customBadge') {
      await this.verifier.verifyCountOfElementsIsEqualTo(this.removeCustomBadgeButton, 1, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        assertionMessage: 'Remove milestone instance award points customization button is visible',
      });
    } else if (customOptions === 'customMessage') {
      await this.verifier.verifyCountOfElementsIsEqualTo(this.removeCustomMessageButton, 1, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        assertionMessage: 'Remove milestone instance award points customization button is visible',
      });
    } else if (customOptions === 'customAuthor') {
      await this.verifier.verifyCountOfElementsIsEqualTo(this.removeCustomAuthorButton, 1, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        assertionMessage: 'Remove milestone instance award points customization button is visible',
      });
    }
  }

  async clickOnTheRemoveButton(customAwardPoints: string) {
    if (customAwardPoints === 'customAwardPoints') {
      await this.clickOnElement(this.removeCustomAwardPointsButton, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        stepInfo: 'Waiting for milestone award instance dialog to be visible',
      });
    } else if (customAwardPoints === 'customBadge') {
      await this.clickOnElement(this.removeCustomBadgeButton, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        stepInfo: 'Waiting for milestone award instance dialog to be visible',
      });
    } else if (customAwardPoints === 'customMessage') {
      await this.clickOnElement(this.removeCustomMessageButton, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        stepInfo: 'Waiting for milestone award instance dialog to be visible',
      });
    } else if (customAwardPoints === 'customAuthor') {
      await this.clickOnElement(this.removeCustomAuthorButton, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
        stepInfo: 'Waiting for milestone award instance dialog to be visible',
      });
    }
  }

  async enterCustomMessageInTiptapEditor(customMessageText: string) {
    await this.clickOnElement(this.customMessagePlusButton, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: 'Waiting for milestone award instance dialog to be visible',
    });
    await this.verifier.waitUntilElementIsVisible(this.customMessageInputBox, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: 'Waiting for milestone award instance dialog to be visible',
    });
    await this.fillInElement(this.customMessageInputBox, customMessageText, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: `Typing the ${customMessageText} in message`,
    });
  }

  async enterTheCustomAuthorNameInAwardInstance(customAuthor: string) {
    await this.clickOnElement(this.customAuthorPlusButton, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: 'Waiting for milestone award instance dialog to be visible',
    });
    await this.verifier.waitUntilElementIsVisible(this.customAuthorRadioButton, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: 'Waiting for milestone award instance dialog to be visible',
    });
    await this.customAuthorRadioButton.check();
    await this.fillInElement(this.customAuthorUserInputBox, customAuthor, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: `Typing the ${customAuthor} in author input box`,
    });
    await this.suggesterContainer.waitFor({ state: 'visible' });
    await this.getOption(customAuthor).first().click();
  }

  async setTheCustomBadgeInAwardInstanceModal(customBadge: number) {
    await this.clickOnElement(this.customBadgePlusButton, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: 'Waiting for milestone award instance dialog to be visible',
    });
    const badgeOption = this.dialog.locator(`input[name="awardIcon"]`).nth(customBadge);
    await this.clickOnElement(badgeOption, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
      stepInfo: `Selecting the badge option ${customBadge} in award instance modal`,
    });
  }

  async setTheCustomPointsInAwardInstanceModal(customPoints: number | null) {
    if (
      !(await this.verifier.isTheElementVisible(this.customAwardPointToReceiversSwitch, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      }))
    ) {
      await this.customAwardPointsPlusButton.click();
    }
    if (customPoints === null) {
      const isChecked = await this.customAwardPointToReceiversSwitch.getAttribute('aria-checked');
      if (isChecked === 'true') {
        await this.customAwardPointToReceiversSwitch.uncheck();
      }
    } else if (customPoints === 0) {
      const isChecked = await this.customAwardPointToReceiversSwitch.getAttribute('aria-checked');
      if (isChecked === 'true') {
        await this.customAwardPointToReceiversSwitch.uncheck();
      }
    } else {
      const isChecked = await this.customAwardPointToReceiversSwitch.getAttribute('aria-checked');
      if (isChecked === 'false') {
        await this.customAwardPointToReceiversSwitch.check();
      }
      await this.customAwardPointsInputBox.fill(String(customPoints));
    }
  }
}
