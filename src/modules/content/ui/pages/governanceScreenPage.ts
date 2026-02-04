import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export class GovernanceScreenPage extends BasePage {
  // Governance locators (moved from GovernanceComponent)
  private baseActionUtil: BaseActionUtil;
  readonly clickOnTimelineButton: Locator;
  readonly clickOnDefaultModeButton: Locator;
  readonly clickOnTimelineAndCommentsOnContentButton: Locator;
  readonly clickOnSaveButton: Locator;
  readonly timelineAndFeed: Locator;
  readonly timelineFeedEnabled: Locator;
  readonly successToastMessage: (message: string) => Locator;
  readonly clickOnContentSubmissions: Locator;
  readonly clickOnSave: Locator;
  readonly clickOnContentValidationPeriodTime: Locator;
  readonly clickOnCustomFeedPlaceholder: Locator;
  readonly customFeedPlaceholderInput: Locator;
  readonly makePlaceholderDefaultButton: Locator;
  readonly feedPlaceholderHeading: Locator;
  readonly contentSubmissionsHeading: Locator;
  readonly contentSubmissionsDescription: Locator;
  readonly contentSubmissionsEnableRadio: Locator;
  readonly contentSubmissionsDisableRadio: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
    this.baseActionUtil = new BaseActionUtil(page);

    this.clickOnTimelineButton = page.getByText('Timeline', { exact: true });
    this.clickOnDefaultModeButton = page.getByRole('radio', { name: 'Timeline, comments on content' });
    this.clickOnTimelineAndCommentsOnContentButton = page.getByRole('radio', { name: 'Timeline and comments on' });
    this.timelineFeedEnabled = page.locator('#feedMode_timeline_comment_post');
    this.clickOnSaveButton = page.getByRole('button', { name: 'Save' });
    this.timelineAndFeed = page.getByRole('heading', { name: 'Timeline & feed' });
    this.successToastMessage = (message: string) => this.page.locator('div[class*="Toast-module"]').getByText(message);
    this.clickOnContentSubmissions = this.page.locator('#contentSubmissions');
    this.clickOnSave = this.page.getByRole('button', { name: 'Save' });
    this.clickOnContentValidationPeriodTime = page.locator('#autoGovValidationPeriod');
    this.clickOnCustomFeedPlaceholder = page.getByRole('radio', { name: 'Custom' });
    this.customFeedPlaceholderInput = this.page.locator('#customFeedPlaceholderText');
    this.makePlaceholderDefaultButton = page.getByRole('radio', { name: 'Default (Share your thoughts' });
    this.feedPlaceholderHeading = page.getByRole('heading', { name: 'Feed placeholder' });
    this.contentSubmissionsHeading = page.getByRole('heading', { name: 'Content submissions' });
    this.contentSubmissionsDescription = page.getByText(
      'Allow users to contribute content across the platform. Each site can then configure who can submit and how submissions are approved.'
    );
    // Locate radio buttons within the Content submissions section
    // Strategy: Find the parent container that holds both the heading/description and the radio buttons
    // The structure is typically: container > [heading, description, group with radio buttons]
    // Go up two levels from heading to get the section container
    const contentSubmissionsSection = this.contentSubmissionsHeading.locator('..').locator('..');
    // Find radio buttons within this section
    this.contentSubmissionsEnableRadio = contentSubmissionsSection.getByRole('radio', { name: 'Enable' }).first();
    this.contentSubmissionsDisableRadio = contentSubmissionsSection.getByRole('radio', { name: 'Disable' }).first();
  }
  async verifyFeedPlaceholderSettingIsVisible(): Promise<void> {
    await test.step('Verify Feed placeholder setting section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.feedPlaceholderHeading, {
        assertionMessage: 'Feed placeholder setting section should be visible',
      });
    });
  }

  async verifyFeedPlaceholderSettingIsNotVisible(): Promise<void> {
    await test.step('Verify Feed placeholder setting section is not visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.feedPlaceholderHeading, {
        assertionMessage: 'Feed placeholder setting section should not be visible',
      });
    });
  }

  async verifyFeedPlaceholderPositionedBelowTimelineFeed(): Promise<void> {
    await test.step('Verify Feed placeholder is positioned below Timeline & Feed heading', async () => {
      // Verify both elements are visible
      await this.verifier.verifyTheElementIsVisible(this.timelineAndFeed, {
        assertionMessage: 'Timeline & Feed heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.feedPlaceholderHeading, {
        assertionMessage: 'Feed placeholder heading should be visible',
      });

      // Verify positioning: Feed placeholder should appear after Timeline & Feed in DOM
      const timelineAndFeedBox = await this.timelineAndFeed.boundingBox();
      const feedPlaceholderBox = await this.feedPlaceholderHeading.boundingBox();

      if (timelineAndFeedBox && feedPlaceholderBox) {
        // Check if Feed placeholder is positioned below Timeline & Feed (higher Y coordinate)
        if (feedPlaceholderBox.y < timelineAndFeedBox.y) {
          throw new Error(
            'Feed placeholder heading should be positioned below Timeline & Feed heading, but it appears above'
          );
        }
      }
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.timelineAndFeed, {
        assertionMessage: 'Governance page should be visible',
      });
    });
  }

  async clickOnTimelineFeedEnabled(): Promise<void> {
    await test.step('Clicking on timeline feed enabled if not already checked', async () => {
      const isChecked = await this.timelineFeedEnabled.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.timelineFeedEnabled);
        await this.clickOnElement(this.clickOnSaveButton);
        await this.verifier.verifyTheElementIsVisible(this.successToastMessage('Saved changes successfully'), {
          assertionMessage: 'Timeline feed should be enabled',
        });
      } else {
        console.log('Timeline feed is already enabled, skipping click');
      }
    });
  }
  async clickOnTimelineFeedDisabled(): Promise<void> {
    await test.step('Clicking on timeline feed disabled if not already checked', async () => {
      const isChecked = await this.clickOnTimelineButton.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.clickOnTimelineButton);
        await this.clickOnElement(this.clickOnSaveButton);
        await this.verifier.verifyTheElementIsVisible(this.successToastMessage('Saved changes successfully'), {
          assertionMessage: 'Timeline feed should be enabled',
        });
      }
    });
  }
  async disableContentSubmissions(message: string): Promise<void> {
    await test.step('Clicking on content submissions checkbox', async () => {
      const outerHTML = await this.clickOnContentSubmissions.evaluate(el => el.outerHTML);
      const isChecked = outerHTML.includes('checked');
      if (isChecked === false) {
        console.log('Content submissions is already disabled');
        return;
      }
      await this.clickOnElement(this.clickOnContentSubmissions);
      await this.clickOnElement(this.clickOnSaveButton);
      await this.baseActionUtil.verifyToastMessageIsVisibleWithText(message, {
        stepInfo: 'Verify the changes confirmation toast message is visible',
      });
    });
  }

  async selectContentValidationPeriodTime(time: string): Promise<void> {
    await test.step('Clicking on content validation period time', async () => {
      await this.clickOnElement(this.clickOnContentValidationPeriodTime);
      await this.clickOnContentValidationPeriodTime.selectOption(time);
      await this.clickOnElement(this.clickOnSave);
    });
  }

  async enableContentSubmissions(message: string): Promise<void> {
    await test.step('Clicking on content submissions checkbox', async () => {
      const outerHTML = await this.clickOnContentSubmissions.evaluate(el => el.outerHTML);
      const isChecked = outerHTML.includes('checked');
      if (isChecked === true) {
        console.log('Content submissions is already enabled');
        return;
      }
      await this.clickOnElement(this.clickOnContentSubmissions);
      await this.clickOnElement(this.clickOnSaveButton);
      await this.baseActionUtil.verifyToastMessageIsVisibleWithText(message, {
        stepInfo: 'Verify the changes confirmation toast mess age is visible',
      });
    });
  }
  async selectTimelineFeedSettingsAsTimeline(): Promise<void> {
    await test.step('Selecting timeline feed as timeline', async () => {
      const isChecked = await this.clickOnTimelineButton.isChecked();
      if (isChecked === true) {
        console.log('Timeline feed is already selected');
        return;
      }
      await this.clickOnElement(this.clickOnTimelineButton);
      await this.clickOnElement(this.clickOnSaveButton);
      await this.verifier.verifyTheElementIsVisible(this.successToastMessage('Saved changes successfully'), {
        assertionMessage: 'Timeline feed should be selected as timeline mode',
      });
    });
  }
  async selectTimelineFeedSettingsAsDefaultMode(): Promise<void> {
    await test.step('Selecting timeline feed as default mode', async () => {
      const isChecked = await this.clickOnDefaultModeButton.isChecked();
      if (isChecked === false) {
        await this.clickOnElement(this.clickOnDefaultModeButton);
        await this.clickOnElement(this.clickOnSaveButton);
        await this.verifier.verifyTheElementIsVisible(this.successToastMessage('Saved changes successfully'), {
          assertionMessage: 'Timeline feed should be selected as default mode',
        });
      }
    });
  }
  async selectTimelineFeedSettingsAsTimelineAndCommentsOnContent(): Promise<void> {
    await test.step('Selecting timeline feed as timeline and comments on content', async () => {
      const isChecked = await this.clickOnTimelineAndCommentsOnContentButton.isChecked();
      if (isChecked === true) {
        console.log('Timeline and comments on content feed is already selected');
        return;
      }
      await this.clickOnElement(this.clickOnTimelineAndCommentsOnContentButton);
      await this.clickOnElement(this.clickOnSaveButton);
      await this.verifier.verifyTheElementIsVisible(this.successToastMessage('Saved changes successfully'), {
        assertionMessage: 'Timeline and comments on content feed should be selected',
      });
    });
  }

  async updateTheCustomFeedPlaceholder(placeholder: string): Promise<void> {
    await test.step('Updating the custom feed placeholder', async () => {
      // Select Custom radio button if not already selected
      const isCustomSelected = await this.clickOnCustomFeedPlaceholder.isChecked();
      if (!isCustomSelected) {
        await this.clickOnElement(this.clickOnCustomFeedPlaceholder);
      }
      const existingText = await this.customFeedPlaceholderInput.inputValue();
      if (existingText === placeholder) {
        console.log('Custom feed placeholder is already set to the same text');
        return;
      } else {
        console.log('Custom feed placeholder is not set to the same text, updating it');
        // Clear and set the placeholder text
        await this.fillInElement(this.customFeedPlaceholderInput, placeholder);
        await this.clickOnElement(this.clickOnSaveButton);
        await this.baseActionUtil.verifyToastMessageIsVisibleWithText('Saved changes successfully', {
          stepInfo: 'Verify the changes confirmation toast message is visible',
        });
      }
    });
  }

  async makePlaceholderDefault(): Promise<void> {
    await test.step('Making the placeholder default', async () => {
      const isDefaultSelected = await this.makePlaceholderDefaultButton.isChecked();
      if (!isDefaultSelected) {
        await this.clickOnElement(this.makePlaceholderDefaultButton);
        await this.clickOnElement(this.clickOnSaveButton);
        await this.baseActionUtil.verifyToastMessageIsVisibleWithText('Saved changes successfully', {
          stepInfo: 'Verify the changes confirmation toast message is visible',
        });
      }
    });
  }

  async verifyContentSubmissionsUI(): Promise<void> {
    await test.step('Verify Content Submissions UI is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentSubmissionsHeading, {
        assertionMessage: 'Content Submissions heading should be visible',
      });
    });
  }

  async verifyContentSubmissionsDescription(): Promise<void> {
    await test.step('Verify Content Submissions description contains expected text', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentSubmissionsDescription, {
        assertionMessage:
          'Content Submissions description should contain: "Allow users to contribute content across the platform. Each site can then configure who can submit and how submissions are approved."',
      });
    });
  }

  async verifyContentSubmissionsRadioButtons(): Promise<void> {
    await test.step('Verify Enable and Disable radio buttons are displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentSubmissionsEnableRadio, {
        assertionMessage: 'Enable radio button should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.contentSubmissionsDisableRadio, {
        assertionMessage: 'Disable radio button should be visible',
      });
    });
  }
}
