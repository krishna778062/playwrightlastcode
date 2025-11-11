import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';
import { BaseActionUtil } from '@core/utils/baseActionUtil';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { AddTopicComponent } from '@/src/modules/content/ui/components/addTopicComponent';
import { EditTopicComponent } from '@/src/modules/content/ui/components/editTopicComponent';
import { ManageTopicsComponent } from '@/src/modules/content/ui/components/manageTopicsComponent';

export interface IManageTopicsPageActions {
  clickOnAddTopic: () => Promise<void>;
  clickOnEditTopic: () => Promise<void>;
  fillTopicName: (topicName: string) => Promise<void>;
  clickOnAddButton: () => Promise<void>;
  editTopicName: (topicName: string) => Promise<void>;
  clickOnUpdateButton: () => Promise<void>;
  searchingTopicInSearchBar: (topicName: string) => Promise<void>;
  searchAndVerifyMultipleTopics: (topicNames: string[]) => Promise<void>;
  openingSearchedTopic: (topicName: string) => Promise<void>;
  clickOnDeleteTopic: () => Promise<void>;
  clickCancelButton: () => Promise<void>;
  getTopicNameFromList: () => Promise<string>;
}

export interface IManageTopicsPageAssertions {
  verifyErroToastMessage: () => Promise<void>;
  verifyToastMessage: (expectedMessage: string) => Promise<void>;
  verifyingTheSearhcedTopicIsVisible: (topicName: string) => Promise<void>;
  verifyingNothingToShowHereText: () => Promise<void>;
  verifyDeleteTopicPopupIsVisible: () => Promise<void>;
  verifyTopicIsVisible: (topicName: string) => Promise<void>;
}
export class ManageTopicsPage extends BasePage implements IManageTopicsPageActions, IManageTopicsPageAssertions {
  private manageTopicsComponent: ManageTopicsComponent;
  private addTopicComponent: AddTopicComponent;
  private editTopicComponent: EditTopicComponent;
  readonly searchingTopic: Locator = this.page.locator('[aria-label="Search topics…"]');
  readonly verifiedTheSearhcedTopic: Locator = this.page.locator('[data-testid="dataGridRow"]').first();
  readonly clickingOnSearchButton: Locator = this.page.locator('.SearchField-submit');
  readonly nothingToShowHereText: Locator = this.page.locator('div').filter({ hasText: /^Nothing to show here$/ });
  readonly clickingOnCrossSearchButton: Locator = this.page.locator('[aria-label="Clear"]');
  // readonly clickingOnTopicHeading: Locator = this.page.getByRole('cell', { name: 'Topic' });
  // readonly clickingOnTopicHeading: Locator = this.page.locator('.Table-cell').first();
  // readonly clickingOnTopicHeading: this.page.locator('tr.Table-row a.Tag-text.type--500.type--b3.u-cursorPointer');

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_TOPICS_SCREEN);
    this.manageTopicsComponent = new ManageTopicsComponent(page);
    this.addTopicComponent = new AddTopicComponent(page);
    this.editTopicComponent = new EditTopicComponent(page);
  }

  get actions(): IManageTopicsPageActions {
    return this;
  }

  get assertions(): IManageTopicsPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage topics page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageTopicsComponent.manageTopicsHeading, {
        assertionMessage: 'Manage topics page should be visible',
      });
    });
  }
  async clickOnAddTopic(): Promise<void> {
    await test.step('Clicking on add topic', async () => {
      await this.manageTopicsComponent.clickOnAddTopic();
    });
  }

  async clickOnEditTopic(): Promise<void> {
    await test.step('Clicking on edit topic', async () => {
      await this.manageTopicsComponent.clickOnEditTopic();
    });
  }

  async searchAndVerifyMultipleTopics(topicNames: string[]): Promise<void> {
    await test.step(`Searching and verifying ${topicNames.length} topics`, async () => {
      if (topicNames.length === 0) {
        throw new Error('Topic names array is empty');
      }

      for (let i = 0; i < topicNames.length; i++) {
        const topicName = topicNames[i];
        if (!topicName) {
          throw new Error(`Topic name at index ${i} is empty or undefined`);
        }

        await test.step(`Verifying topic ${i + 1}/${topicNames.length}: "${topicName}"`, async () => {
          // Clear previous search if not the first iteration
          if (i > 0) {
            await this.clickOnElement(this.clickingOnCrossSearchButton);
          }

          // Search for the topic
          await this.searchingTopicInSearchBar(topicName);

          // Verify the topic is visible
          await this.verifyingTheSearhcedTopicIsVisible(topicName);

          console.log(`✓ Successfully verified topic ${i + 1}/${topicNames.length}: "${topicName}"`);
        });
      }
    });
  }
  async verifyErroToastMessage(): Promise<void> {
    const baseActionUtil = new BaseActionUtil(this.page);
    await baseActionUtil.verifyToastMessageIsVisibleWithText(
      'Could not edit Topic - Only character spacing and capitalization allowed',
      {
        stepInfo: 'Verify the changes confirmation toast message is visible',
      }
    );
  }

  async fillTopicName(topicName: string): Promise<void> {
    await this.addTopicComponent.fillTopicName(topicName);
  }

  async clickOnAddButton(): Promise<void> {
    await this.addTopicComponent.clickOnAddButton();
  }

  async editTopicName(topicName: string): Promise<void> {
    await this.editTopicComponent.editTopicName(topicName);
  }

  async clickOnUpdateButton(): Promise<void> {
    await this.editTopicComponent.clickOnUpdateButton();
  }

  async verifyToastMessage(expectedMessage: string): Promise<void> {
    const baseActionUtil = new BaseActionUtil(this.page);
    await baseActionUtil.verifyToastMessageIsVisibleWithText(expectedMessage);
  }

  async searchingTopicInSearchBar(topicName: string): Promise<void> {
    await this.searchingTopic.fill(topicName);
    await this.clickOnElement(this.clickingOnSearchButton);
  }

  async verifyingTheSearhcedTopicIsVisible(topicName: string): Promise<void> {
    await test.step(`Verifying topic "${topicName}" is visible in search results`, async () => {
      const topicLocator = this.verifiedTheSearhcedTopic.filter({ hasText: topicName });
      await this.verifier.verifyTheElementIsVisible(topicLocator, {
        assertionMessage: `Topic "${topicName}" should be visible in search results`,
      });
    });
  }

  async verifyingNothingToShowHereText(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.nothingToShowHereText, {
      assertionMessage: `Verify the nothing to show here text is visible`,
    });
  }

  async openingSearchedTopic(topicName: string): Promise<void> {
    await test.step('Opening the searched topic', async () => {
      await this.clickOnElement(this.page.getByRole('link', { name: topicName }));
      // await this.page.keyboard.press('Tab');
      // await this.page.keyboard.press('Enter');
    });
  }

  async clickOnDeleteTopic(): Promise<void> {
    await test.step('Clicking on delete topic from option menu', async () => {
      await this.manageTopicsComponent.clickOnDeleteTopic();
    });
  }

  async verifyDeleteTopicPopupIsVisible(): Promise<void> {
    await test.step('Verify delete topic popup is visible', async () => {
      await this.manageTopicsComponent.verifyDeleteTopicPopupIsVisible();
    });
  }

  async clickCancelButton(): Promise<void> {
    await test.step('Clicking on Cancel button in delete topic popup', async () => {
      await this.manageTopicsComponent.clickCancelButton();
    });
  }

  async verifyTopicIsVisible(topicName: string): Promise<void> {
    await test.step(`Verify topic ${topicName} is visible`, async () => {
      const topicLocator = this.page
        .getByRole('link', { name: topicName })
        .or(this.page.locator(`text=${topicName}`))
        .first();
      await this.verifier.verifyTheElementIsVisible(topicLocator, {
        assertionMessage: `Topic "${topicName}" should be visible`,
      });
    });
  }

  async getTopicNameFromList(): Promise<string> {
    return await this.manageTopicsComponent.getTopicNameFromList();
  }
}
