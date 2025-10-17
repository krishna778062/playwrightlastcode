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
}

export interface IManageTopicsPageAssertions {
  verifyErroToastMessage: () => Promise<void>;
  verifyToastMessage: (expectedMessage: string) => Promise<void>;
  verifyingTheSearhcedTopicIsVisible: (topicName: string) => Promise<void>;
  verifyingNothingToShowHereText: () => Promise<void>;
}
export class ManageTopicsPage extends BasePage {
  private manageTopicsComponent: ManageTopicsComponent;
  private addTopicComponent: AddTopicComponent;
  private editTopicComponent: EditTopicComponent;
  readonly searchingTopic: Locator = this.page.locator('[aria-label="Search topics…"]');
  readonly verifiedTheSearhcedTopic: Locator = this.page.locator('[data-testid="dataGridRow"]').first();
  readonly clickingOnSearchButton: Locator = this.page.locator('.SearchField-submit');
  readonly nothingToShowHereText: Locator = this.page.locator('div').filter({ hasText: /^Nothing to show here$/ });

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
    await test.step('Verify governance page is visible', async () => {
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
    (this.verifiedTheSearhcedTopic.filter({ hasText: topicName }),
      {
        assertionMessage: `Verify the searched topic is visible`,
      });
  }

  async verifyingNothingToShowHereText(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.nothingToShowHereText, {
      assertionMessage: `Verify the nothing to show here text is visible`,
    });
  }
}
