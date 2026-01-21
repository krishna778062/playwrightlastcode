import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class PeopleBlockComponent extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  // Block selection
  readonly peopleBlockButton: Locator;

  // Text elements
  readonly selectPeopleText: Locator;

  // Browse button
  readonly browseButton: Locator;

  // Sidebar search elements
  readonly sidebarPersonSearchCombobox: Locator;
  readonly listRadio: Locator;
  readonly cardsRadio: Locator;
  readonly avatarsRadio: Locator;

  readonly newsletterTemplateBlock: Locator;
  readonly peopleModalHeading: Locator;
  readonly cardListing: Locator;
  readonly avatarContainers: Locator;

  readonly personCard: (personName: string) => Locator;
  readonly personMenuItem: (personName: string) => Locator;
  readonly personInList: (personName: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    // Block selection - the People block in the blocks panel
    this.peopleBlockButton = this.page.locator('[data-chockablock-item-id="People"]');

    // Text elements (using partial match for flexibility)
    this.selectPeopleText = this.page.getByText('Select people', { exact: false });

    // Browse button - use exact match to avoid matching other buttons
    this.browseButton = this.page.getByRole('button', { name: 'Browse', exact: true });

    // Sidebar search elements
    // Scope to the sidebar containing "People" heading and "Browse" button, then find the combobox
    // This works regardless of whether a person is selected or not
    const peopleSidebar = this.page
      .locator('div')
      .filter({ has: this.page.getByRole('heading', { name: 'People', level: 3 }) })
      .filter({ has: this.page.getByRole('button', { name: 'Browse', exact: true }) });
    this.sidebarPersonSearchCombobox = peopleSidebar.locator('input[role="combobox"]');
    this.listRadio = this.page.getByRole('radio', { name: 'List' });
    this.cardsRadio = this.page.getByRole('radio', { name: 'Cards' });
    this.avatarsRadio = this.page.getByRole('radio', { name: 'Avatars' });

    // Newsletter template block
    this.newsletterTemplateBlock = this.page.locator('div[class*="Block_inner"]').first();
    this.peopleModalHeading = this.page.getByRole('dialog').getByRole('heading', { name: 'People', level: 1 });
    this.cardListing = this.newsletterTemplateBlock.locator('[data-testid="cardListing"]');
    this.avatarContainers = this.newsletterTemplateBlock
      .locator('div')
      .filter({ has: this.page.locator('img[alt]') })
      .filter({ has: this.page.locator('p') });

    this.personCard = (personName: string) =>
      this.newsletterTemplateBlock.locator("table[class*='TableGrid_tableGrid']").getByText(personName);
    this.personMenuItem = (personName: string) =>
      this.page.getByRole('menuitem', { name: new RegExp(personName, 'i') }).first();
    this.personInList = (personName: string) =>
      this.newsletterTemplateBlock.locator('p').getByText(personName, { exact: true }).first();
  }

  /**
   * Clicks the People block to add it to the newsletter
   */
  async clickPeopleBlock(): Promise<void> {
    await test.step('Click People block', async () => {
      await this.clickOnElement(this.peopleBlockButton, {
        stepInfo: 'Click People block to add it to the newsletter',
      });
    });
  }

  /**
   * Asserts that the People block is displayed in the sidebar
   */
  async assertPeopleBlockIsDisplayed(): Promise<void> {
    await test.step('Assert People block is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.selectPeopleText, {
        assertionMessage: 'People block should be displayed with "Select people to add to newsletter" text',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Clicks the Browse button to open the people modal
   */
  async clickBrowse(): Promise<void> {
    await test.step('Click Browse button', async () => {
      await this.clickOnElement(this.browseButton, {
        stepInfo: 'Click Browse button to open people modal',
      });
    });
  }

  /**
   * Asserts that the People modal is displayed
   */
  async assertPeopleModalIsDisplayed(): Promise<void> {
    await test.step('Assert People modal is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.peopleModalHeading, {
        assertionMessage: 'People modal should be visible',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Asserts that people are displayed as cards in the newsletter
   * @param personName - The name of the person to verify
   */
  async assertPeopleAreDisplayedAsCards(personName: string): Promise<void> {
    await test.step(`Assert person ${personName} is displayed as a card`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.personCard(personName), {
        assertionMessage: `Person ${personName} should be displayed in the newsletter as a card`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Enters a person name in the sidebar search field
   * @param personName - The person name to search for
   */
  async enterPersonNameInSidebarSearchField(personName: string): Promise<void> {
    await test.step(`Enter person name in sidebar search: ${personName}`, async () => {
      await this.clickOnElement(this.sidebarPersonSearchCombobox, {
        stepInfo: 'Click sidebar person search field',
      });
      await this.fillInElement(this.sidebarPersonSearchCombobox, personName, {
        stepInfo: `Enter person name: ${personName}`,
      });
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Selects a person name from the dropdown menu
   * @param personName - The person name to select
   */
  async selectPersonName(personName: string): Promise<void> {
    await test.step(`Select person: ${personName}`, async () => {
      await this.clickOnElement(this.personMenuItem(personName), {
        stepInfo: `Click on person menu item: ${personName}`,
      });
    });
  }

  /**
   * Checks the List radio button in the sidebar (only if not already checked)
   */
  async checkList(): Promise<void> {
    await test.step('Check List radio button', async () => {
      // Only click if not already checked
      const isChecked = await this.listRadio.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.listRadio, {
          stepInfo: 'Click List radio button',
        });
      }
      await expect(this.listRadio, 'List radio should be checked').toBeChecked();
    });
  }

  /**
   * Asserts that a person is displayed as a list item in the newsletter
   * @param personName - The name of the person to verify
   */
  async assertPeopleAreDisplayedAsList(personName: string): Promise<void> {
    await test.step(`Assert person ${personName} is displayed as a list item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.personInList(personName), {
        assertionMessage: `Person ${personName} should be displayed in the newsletter as a list item`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Clears the sidebar search field and types a new person name
   * @param newPersonName - The new person name to search for
   */
  async sideBarSearchFieldClearAndTypeAgain(newPersonName: string): Promise<void> {
    await test.step(`Clear search and type: ${newPersonName}`, async () => {
      await this.sidebarPersonSearchCombobox.clear();
      await this.fillInElement(this.sidebarPersonSearchCombobox, newPersonName, {
        stepInfo: `Enter person name: ${newPersonName}`,
      });
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Checks the Cards radio button in the sidebar (only if not already checked)
   */
  async checkCards(): Promise<void> {
    await test.step('Check Cards radio button', async () => {
      // Only click if not already checked
      const isChecked = await this.cardsRadio.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.cardsRadio, {
          stepInfo: 'Click Cards radio button',
        });
      }
      await expect(this.cardsRadio, 'Cards radio should be checked').toBeChecked();
    });
  }

  /**
   * Verifies that multiple people are displayed as cards with correct names
   * @param personNames - Array of person names to verify
   */
  async selectAndVerifyPeopleNames(personNames: string[]): Promise<void> {
    await test.step(`Verify ${personNames.length} people are displayed as cards`, async () => {
      const actualCount = await this.cardListing.count();
      expect(
        actualCount,
        `Should have at least ${personNames.length} cards, found ${actualCount}`
      ).toBeGreaterThanOrEqual(personNames.length);

      for (const personName of personNames) {
        const boldParagraph = this.cardListing
          .locator('p')
          .filter({
            has: this.page.locator('text=' + personName),
          })
          .first();

        await this.verifier.verifyTheElementIsVisible(boldParagraph, {
          assertionMessage: `Person "${personName}" should be displayed in cards view`,
          timeout: TIMEOUTS.SHORT,
        });
      }
    });
  }

  /**
   * Checks the Avatars radio button in the sidebar (only if not already checked)
   */
  async checkAvatars(): Promise<void> {
    await test.step('Check Avatars radio button', async () => {
      // Only click if not already checked
      const isChecked = await this.avatarsRadio.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.avatarsRadio, {
          stepInfo: 'Click Avatars radio button',
        });
      }
      await expect(this.avatarsRadio, 'Avatars radio should be checked').toBeChecked();
    });
  }

  /**
   * Verifies that people are displayed as avatars in the newsletter
   * Avatars view shows only images and names (no roles or locations)
   */
  async assertPeopleAreDisplayedAsAvatars(): Promise<void> {
    await test.step('Verify people are displayed as avatars', async () => {
      await this.verifier.verifyTheElementIsVisible(this.avatarContainers.first(), {
        assertionMessage: 'People should be displayed as avatars in the newsletter',
        timeout: TIMEOUTS.MEDIUM,
      });

      const avatarCount = await this.avatarContainers.count();
      expect(avatarCount, 'Should have at least 3 avatars displayed').toBeGreaterThanOrEqual(3);
    });
  }

  async assertFirstPersonCardIsDisplayed(): Promise<void> {
    await test.step('Assert first person card is displayed', async () => {
      const firstPersonCard = this.newsletterTemplateBlock
        .locator("table[class*='TableGrid_tableGrid']")
        .getByRole('cell')
        .first();

      await this.verifier.verifyTheElementIsVisible(firstPersonCard, {
        assertionMessage: 'Selected person should be displayed in newsletter',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
