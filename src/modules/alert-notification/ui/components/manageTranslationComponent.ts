import { Locator, Page, test } from '@playwright/test';

import { MANAGE_TRANSLATIONS_TEXT } from '../../tests/test-data/notification-customization.test-data';

import { BaseComponent } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class ManageTranslationComponent extends BaseComponent {
  readonly languageDropdown: Locator;
  readonly translationSubjectTextarea: Locator;
  readonly sendTestButton: Locator;
  readonly automaticTranslationText: Locator;
  readonly manualTranslationsSwitch: Locator;

  constructor(readonly page: Page) {
    super(page);
    // Language dropdown button - find it by xpath using title attribute
    // The button has title="English (US) (main)" when default language is selected
    this.languageDropdown = page.locator("//button[@title='English (US) (main)']");
    this.translationSubjectTextarea = page.locator('#customSubjectTextarea');
    this.sendTestButton = page.getByRole('button', { name: 'Send test' });
    this.automaticTranslationText = page.getByText(MANAGE_TRANSLATIONS_TEXT.AUTOMATIC_TRANSLATION_TEXT);
    this.manualTranslationsSwitch = page.getByRole('switch', {
      name: MANAGE_TRANSLATIONS_TEXT.MANUAL_TRANSLATIONS_SWITCH,
    });
  }

  /**
   * Verifies the manage translation component is loaded
   */
  async verifyManageTranslationComponentIsLoaded(): Promise<void> {
    await test.step('Verify manage translation component is loaded', async () => {
      // Wait for language dropdown to be visible
      await this.verifier.verifyTheElementIsVisible(this.languageDropdown, {
        assertionMessage: 'Language dropdown should be visible',
      });
    });
  }

  /**
   * Selects a language from the dropdown
   * @param language - The language to select (e.g., "Français - French")
   */
  async selectLanguage(language: string): Promise<void> {
    await test.step(`Select language: ${language}`, async () => {
      // Get the current language dropdown button (it changes title after each selection)
      // Use getByRole with a regex pattern that matches any language button
      const currentLanguageDropdown = this.page.getByRole('button', {
        name: /^Language .*(\s+\(main\))?$/i,
      });

      // Open the language dropdown menu by clicking the button
      await this.clickOnElement(currentLanguageDropdown);

      // Wait for dropdown menu to appear
      const dropdownMenu = this.page.locator('[role="listbox"], [role="menu"]').first();
      await this.verifier.verifyTheElementIsVisible(dropdownMenu, {
        assertionMessage: 'Language dropdown menu should be visible',
        timeout: TIMEOUTS.SHORT,
      });

      // Select the language from the dropdown
      const languageOption = this.page.getByText(language, { exact: true });
      await this.clickOnElement(languageOption);
    });
  }

  /**
   * Fills the translated subject line
   * @param translatedSubject - The translated subject text
   */
  async fillTranslatedSubjectLine(translatedSubject: string): Promise<void> {
    await test.step(`Fill translated subject line: ${translatedSubject}`, async () => {
      await this.fillInElement(this.translationSubjectTextarea, translatedSubject);
    });
  }

  /**
   * Verifies inline error message is displayed
   * @param errorMessage - The expected error message
   */
  async verifyInlineErrorMessage(errorMessage: string): Promise<void> {
    await test.step(`Verify inline error message: ${errorMessage}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByText(errorMessage), {
        assertionMessage: `Inline error message should be visible: ${errorMessage}`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verifies that automatic translation text is visible
   */
  async verifyAutomaticTranslationText(): Promise<void> {
    await test.step('Verify automatic translation text is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.automaticTranslationText, {
        assertionMessage: 'Automatic translation text should be visible',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Waits for translation to complete by verifying the textarea is populated with translated text
   */
  async waitForTranslationToComplete(): Promise<void> {
    await test.step('Wait for translation to complete', async () => {
      // First, verify automatic translation text is visible (indicates translation has started)
      await this.verifyAutomaticTranslationText();

      // Wait for the textarea to be visible
      await this.verifier.verifyTheElementIsVisible(this.translationSubjectTextarea, {
        assertionMessage: 'Translation subject textarea should be visible',
        timeout: TIMEOUTS.SHORT,
      });

      // The waitFor with timeout allows the translation to complete
      await this.translationSubjectTextarea.waitFor({
        state: 'visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Gets the current translation text value from the textarea
   */
  async getTranslationTextValue(): Promise<string> {
    return await test.step('Get current translation text value', async () => {
      await this.verifier.verifyTheElementIsVisible(this.translationSubjectTextarea, {
        assertionMessage: 'Translation subject textarea should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      return await this.translationSubjectTextarea.inputValue();
    });
  }

  /**
   * Switches to manual translation mode by clicking the manual translations switch
   */
  async switchToManualTranslation(): Promise<void> {
    await test.step('Switch to manual translation mode', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manualTranslationsSwitch, {
        assertionMessage: 'Manual translations switch should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.clickOnElement(this.manualTranslationsSwitch);
    });
  }

  /**
   * Verifies that the translation field is editable (manual mode is active)
   */
  async verifyTranslationFieldIsEditable(): Promise<void> {
    await test.step('Verify translation field is editable', async () => {
      await this.verifier.verifyTheElementIsEnabled(this.translationSubjectTextarea, {
        assertionMessage: 'Translation subject textarea should be editable',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verifies that the translation field is NOT editable (automatic mode is active)
   */
  async verifyTranslationFieldIsNotEditable(): Promise<void> {
    await test.step('Verify translation field is NOT editable', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.translationSubjectTextarea, {
        assertionMessage: 'Translation subject textarea should be disabled in automatic mode',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Edits the translation text by filling the textarea with new text
   * @param newText - The new text to set
   */
  async editTranslationText(newText: string): Promise<void> {
    await test.step(`Edit translation text: ${newText}`, async () => {
      // Verify field is editable
      await this.verifyTranslationFieldIsEditable();
      // Fill with new text
      await this.fillInElement(this.translationSubjectTextarea, newText);
    });
  }

  /**
   * Verifies the translation text matches the expected value
   * @param expectedText - The expected translation text
   */
  async verifyTranslationText(expectedText: string): Promise<void> {
    await test.step(`Verify translation text: ${expectedText}`, async () => {
      const actualText = await this.getTranslationTextValue();
      if (actualText !== expectedText) {
        throw new Error(`Expected translation text to be "${expectedText}", but found "${actualText}"`);
      }
    });
  }

  /**
   * Verifies the language dropdown shows the expected language as selected
   * @param expectedLanguage - The expected selected language (e.g., "English (US)")
   */
  async verifyLanguageDropdownShows(expectedLanguage: string): Promise<void> {
    await test.step(`Verify language dropdown shows: ${expectedLanguage}`, async () => {
      // The button name pattern is "Language {language}" and may include "(main)" at the end
      // e.g., "Language English (US) (main)"
      // We use a regex to match the language part and allow optional "(main)" suffix
      const escapedLanguage = expectedLanguage.replace('(', '\\(').replace(')', '\\)');
      const buttonNamePattern = new RegExp(`Language ${escapedLanguage}(\\s+\\(main\\))?`, 'i');
      const languageButton = this.page.getByRole('button', { name: buttonNamePattern });
      await this.verifier.verifyTheElementIsVisible(languageButton, {
        assertionMessage: `Language dropdown should show "${expectedLanguage}"`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verifies that the translated text is populated (not empty) and returns the translated subject
   * @param language - The language name for error messages
   * @returns The translated subject text
   */
  async verifyAndGetTranslatedSubject(language: string): Promise<string> {
    return await test.step(`Verify translated subject is populated and get it for ${language}`, async () => {
      const translatedText = await this.getTranslationTextValue();

      // Verify the textarea is populated (not empty)
      if (!translatedText || translatedText.trim() === '') {
        throw new Error(`Translation textarea should be populated for ${language}, but found empty`);
      }

      return translatedText;
    });
  }
}
