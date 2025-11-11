import { expect, Locator, Page } from '@playwright/test';
import { getQuery } from '@rewards/utils/dbQuery';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import fs from 'fs';
import path from 'path';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';
import { CSVUtils } from '@core/utils/csvUtils';
import { executeQuery } from '@core/utils/dbUtils';

export class WorkAnniversaryPage extends BasePage {
  readonly tableGridFirstRow: Locator;
  readonly tableGridFirstActionButton: Locator;
  readonly tableHeaders: Locator;

  // Edit Work Anniversary Page Locators
  readonly editMileStoneContainer: Locator;
  private editMileStonePageHeader: Locator;
  private editMileStoneWrapper: Locator;
  private awardDetailsHeader: Locator;
  private workAnniversarySaveChangesButton: Locator;
  private awardPointsToReceiverContainer: Locator;
  private awardPointsToReceiverSwitch: Locator;
  private awardPointInput: Locator;
  private awardPointPlus: Locator;
  private awardPointMinus: Locator;

  // AwardInstance
  private awardInstancesContainer: Locator;
  private awardIconInScheduleList: Locator;
  private awardTextInScheduleList: Locator;
  private awardInstanceEditButton: Locator;
  private awardInstanceEditPreviewButton: Locator;
  private showMoreButton: Locator;
  private badgeContainer: Locator;
  private badgeOptions: Locator;

  // Modal
  private awardInstanceEditModal: Locator;
  private awardInstanceModalHeading: Locator;
  private awardInstanceCustomizeButtons: Locator;
  private awardInstanceRemoveCustomizationButtons: Locator;
  private awardInstanceSaveButton: Locator;
  private awardInstanceCancelButton: Locator;
  private modalBadgeContainer: Locator;
  private modalBadgeOptions: Locator;
  private modalCustomMessageContainer: Locator;
  private modalCustomMessageInput: Locator;
  private modalAwardPointsToReceiversSwitch: Locator;
  private modalAwardPointsToReceiversInput: Locator;

  // Preview window
  private previewWindowModal: Locator;
  private previewWindowModalBadgeIconOutline: Locator;
  private previewWindowModalBadgePointText: Locator;
  private previewWindowModalBadgePointTooltipIcon: Locator;
  private previewWindowModalBadgePointTooltipText: Locator;
  private firstWorkAnniversaryPost: Locator;
  private workAnniversaryPostBadgeIconOutline: Locator;
  private workAnniversaryPostBadgePointText: Locator;
  private workAnniversaryPostBadgePointTooltipIcon: Locator;
  private workAnniversaryPostBadgePointTooltipText: Locator;

  /**
   * This class represents automated award page in manage Recognition
   * @param page - The Playwright page object
   */
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);

    this.tableGridFirstRow = page.locator('[data-testid*="dataGridRow"] td p');
    this.tableGridFirstActionButton = page.locator('[data-testid*="dataGridRow"] td button[aria-label="Show more"]');
    this.tableHeaders = page.locator('[class*="Table-module__table"] thead button > div');

    // Edit Work Anniversary Page Locators
    this.editMileStoneContainer = page.locator('[data-testid="pageContainer-page"]');
    this.editMileStonePageHeader = this.editMileStoneContainer.locator('h1');
    this.workAnniversarySaveChangesButton = this.editMileStoneContainer.getByRole('button', { name: 'Save changes' });
    this.editMileStoneWrapper = this.editMileStoneContainer.locator('[class*="AutomatedAward_wrapper"]');
    this.awardDetailsHeader = this.editMileStoneWrapper.locator('header h2').first();

    // Badge container
    this.badgeContainer = this.editMileStoneWrapper.locator('[data-testid="field-Badge"]');
    this.badgeOptions = this.badgeContainer.getByRole('radio');

    // Award Points to Receiver
    this.awardPointsToReceiverContainer = this.editMileStoneWrapper.locator(
      '//span[text()="Award points to receivers"]/ancestor::div[3]'
    );
    this.awardPointsToReceiverSwitch = this.awardPointsToReceiverContainer.getByRole('switch');
    this.awardPointInput = this.awardPointsToReceiverContainer.locator('[id="anniversaryPoints"]');
    this.awardPointPlus = this.awardPointsToReceiverContainer.locator('button[aria-label="Plus"]');
    this.awardPointMinus = this.awardPointsToReceiverContainer.locator('button[aria-label="Minus"]');

    // Award Instances
    this.awardInstancesContainer = this.editMileStoneWrapper.locator(
      '//header//following::div/div[contains(@class,"Panel-module__panel")]'
    );
    this.awardIconInScheduleList = this.awardInstancesContainer.locator(
      '[class*="FrequencyAndSchedule_milestoneAwardIcon"] svg text'
    );
    this.awardTextInScheduleList = this.awardInstancesContainer.locator(
      '[class*="FrequencyAndSchedule_milestoneAwardIcon"]+p'
    );
    this.awardInstanceEditButton = this.awardInstancesContainer.locator('[aria-label*="Edit"]');
    this.awardInstanceEditPreviewButton = this.awardInstancesContainer.locator('[aria-label*="Preview"]');
    this.showMoreButton = page.locator('div[class*="FrequencyAndSchedule_milestoneListMoreButton"] button');

    // Award Instance Edit Modal
    this.awardInstanceEditModal = page.locator('[role="dialog"][data-state="open"] > div');
    this.awardInstanceModalHeading = this.awardInstanceEditModal.locator('h2 > span');
    this.awardInstanceCustomizeButtons = this.awardInstanceEditModal.locator(
      '[aria-label*="Customize milestone instance"]'
    );
    this.awardInstanceRemoveCustomizationButtons = this.awardInstanceEditModal.locator(
      '[aria-label*="Remove milestone instance"]'
    );
    this.modalAwardPointsToReceiversSwitch = this.awardInstanceEditModal.getByRole('switch', {
      name: 'Award points to receivers',
    });
    this.modalAwardPointsToReceiversInput = this.awardInstanceEditModal.locator('input[id="anniversaryPoints"]');
    this.modalCustomMessageContainer = this.awardInstanceEditModal.locator('[class="recognition-tiptapfield"]');
    this.modalCustomMessageInput = this.modalCustomMessageContainer.locator('div[data-testid="tiptap-content"]');
    this.awardInstanceSaveButton = this.awardInstanceEditModal.getByRole('button', { name: 'Save' });
    this.awardInstanceCancelButton = this.awardInstanceEditModal.getByRole('button', { name: 'Cancel' });
    this.modalBadgeContainer = this.awardInstanceEditModal.locator('[data-testid="field-Badge"]');
    this.modalBadgeOptions = this.awardInstanceEditModal.getByRole('radio');

    // Preview window
    this.previewWindowModal = page.locator('[role="dialog"][data-state="open"] > div');
    this.previewWindowModalBadgeIconOutline = this.previewWindowModal.locator(
      '[data-testid="award-icon"] div[class*="UI_outline"]'
    );
    this.previewWindowModalBadgePointText = this.previewWindowModal.locator('button[class*="UI_pill"] p');
    this.previewWindowModalBadgePointTooltipIcon = this.previewWindowModal.locator('button[class*="UI_pill"] i');
    this.previewWindowModalBadgePointTooltipText = this.previewWindowModal.locator('[id*="tippy"] p');

    // First post of Work Anniversary
    this.firstWorkAnniversaryPost = page.locator('[class*="Recognition_panelInner"]');
    this.workAnniversaryPostBadgeIconOutline = this.firstWorkAnniversaryPost.locator(
      '[data-testid="award-icon"] div[class*="UI_outline"]'
    );
    this.workAnniversaryPostBadgePointText = this.firstWorkAnniversaryPost.locator('button[class*="UI_pill"] p');
    this.workAnniversaryPostBadgePointTooltipIcon = this.firstWorkAnniversaryPost.locator('button[class*="UI_pill"] i');
    this.workAnniversaryPostBadgePointTooltipText = this.firstWorkAnniversaryPost.locator('[id*="tippy"] p');
  }

  /**
   * visit(): visit the work anniversary page
   */
  async visit(): Promise<void> {
    await this.page.goto('/manage/recognition/milestones');
    await expect(this.tableGridFirstRow.last()).toBeVisible();
  }

  /**
   * Clicks on a menu item with visible text
   * @param page - The Playwright page object
   * @param menuItemText - The text of the menu item to click
   */
  async clickOnMenuItemWithVisibleText(page: Page, menuItemText: string) {
    const menu = page.getByRole('menu', { name: 'More' });
    await menu.getByRole('menuitem').last().waitFor({ state: 'attached', timeout: 5000 });
    const option = menu.getByRole('menuitem').locator(`div:has-text("${menuItemText}")`);
    await option.first().waitFor({ state: 'attached', timeout: 15000 });
    await option.first().click({ force: true });
  }

  /**
   * validateAllTheTableElements(): validating all the columns in the table, Row data is greater than 3
   * means(it has atleast 3 column data i.e. Award name, Times awarded, Last awarded etc..)
   */
  async validateAllTheTableElements() {
    await this.verifier.waitUntilElementIsVisible(this.tableGridFirstRow.last());
    const headers: string[] = await this.tableHeaders.allTextContents();
    expect(headers).toEqual(['Award', 'Times awarded', 'Last awarded', 'Status', 'Created', 'Edited']);
    const tableData: string[] = await this.tableGridFirstRow.allTextContents();
    expect(tableData.length).toBeGreaterThan(3);
    await expect(this.tableGridFirstActionButton).toBeVisible();
  }

  /**
   * clickOnTheEditWorkAnniversaryButton(): Click on the first row's action button and click on the Edit button in the dropdown
   * and verify the Edit milestone container is visible
   */
  async clickOnTheEditWorkAnniversaryButton(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.tableGridFirstRow.last());
    await this.tableGridFirstActionButton.click();
    await this.clickOnMenuItemWithVisibleText(this.page, 'Edit');
  }

  async validateTheElementsInEditWorkAnniversaryPage() {
    await this.verifier.verifyElementHasText(this.editMileStonePageHeader, 'Edit milestone');
    await this.verifier.verifyTheElementIsVisible(this.editMileStoneWrapper);
    await this.verifier.verifyElementHasText(this.awardDetailsHeader, 'Award details');
    await this.verifier.verifyTheElementIsVisible(this.awardPointsToReceiverContainer);
    await this.verifier.verifyTheElementIsVisible(this.awardPointsToReceiverSwitch);
    const switchChecked = await this.getElementAttribute(this.awardPointsToReceiverSwitch, 'aria-checked');
    if (switchChecked === 'true') {
      await this.verifier.verifyTheElementIsVisible(this.awardPointInput);
      await this.verifier.verifyTheElementIsVisible(this.awardPointPlus);
      await this.verifier.verifyTheElementIsVisible(this.awardPointMinus);
    }
  }

  async selectTheDefaultBadgeInWorkAnniversary(index: number = 0): Promise<void> {
    const currentSelectedBadge = await this.badgeOptions.nth(index).isChecked();
    if (!currentSelectedBadge) {
      await this.badgeOptions.nth(index).click();
    }
  }

  async validateTheYearNumberInAwardBadgeForDefaultBadge() {
    const texts = await this.awardIconInScheduleList.allTextContents();
    const awardNumbers = texts
      .map(t => (t ?? '').trim())
      .filter(t => t.length > 0)
      .map(t => parseInt(t, 10));
    expect(awardNumbers).toEqual([1, 2, 3, 4, 5, 6]);
    await this.showMoreButton.last().click();
    const textsAfter = await this.awardIconInScheduleList.allTextContents();
    const awardNumbersAfter = textsAfter
      .map(t => (t ?? '').trim())
      .filter(t => t.length > 0)
      .map(t => parseInt(t, 10));
    expect(awardNumbersAfter).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  }

  async validateTheYearNumberInAwardInstanceLabels() {
    let texts = await this.awardTextInScheduleList.allTextContents();
    const awardNumbersAll = texts.flatMap(t => {
      const matches = (t ?? '').match(/\d+/g);
      return matches ? matches.map(s => Number(s)) : [];
    });
    expect(awardNumbersAll).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    await this.showMoreButton.last().click();
    texts = await this.awardTextInScheduleList.allTextContents();
    const awardNumbersAfter = texts.flatMap(t => {
      const matches = (t ?? '').match(/\d+/g);
      return matches ? matches.map(s => Number(s)) : [];
    });
    expect(awardNumbersAfter).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  }

  async disableTheAwardPointsToReceiverIfEnabled() {
    await expect(this.awardPointsToReceiverSwitch).toBeVisible();
    if ((await this.awardPointsToReceiverSwitch.getAttribute('aria-checked')) === 'true') {
      await this.awardPointsToReceiverSwitch.uncheck();
    }
  }

  async removeTheAwardInstanceCustomValues(awardInstanceIndex: number = 0) {
    await this.awardInstanceEditButton.nth(awardInstanceIndex).click();
    await expect(this.awardInstanceEditModal).toBeVisible();
    await expect(this.awardInstanceModalHeading).toHaveText(`${awardInstanceIndex + 1} year work anniversary`);
    const editCustomizationButtonsCount = await this.awardInstanceCustomizeButtons.count();
    expect(editCustomizationButtonsCount).toBeLessThanOrEqual(4);
    let removeButtonsCount = await this.awardInstanceRemoveCustomizationButtons.count();
    if (removeButtonsCount > 0) {
      while (removeButtonsCount > 0) {
        await this.awardInstanceRemoveCustomizationButtons.nth(0).click();
        removeButtonsCount = await this.awardInstanceRemoveCustomizationButtons.count();
      }
      await expect(this.awardInstanceRemoveCustomizationButtons).toHaveCount(0);
      await expect(this.awardInstanceSaveButton).toBeEnabled();
      await this.awardInstanceSaveButton.click();
    } else {
      await this.awardInstanceCancelButton.click();
    }
  }

  async cleanUpTheDataIfAlreadySet(): Promise<void> {
    await this.disableTheAwardPointsToReceiverIfEnabled();
    await this.removeTheAwardInstanceCustomValues(0);
    await this.removeTheAwardInstanceCustomValues(1);
    await this.removeTheAwardInstanceCustomValues(2);
    await this.removeTheAwardInstanceCustomValues(3);
    await this.saveTheWorkAnniversaryChanges();
  }

  async setTheDefaultPointsInWorkAnniversary(number: number) {
    await expect(this.awardPointsToReceiverSwitch).toBeVisible();
    if ((await this.awardPointsToReceiverSwitch.getAttribute('aria-checked')) === 'false') {
      await this.awardPointsToReceiverSwitch.check();
      await this.awardPointInput.fill(String(number));
    }
  }

  async clickOnPreviewAwardButtonAndValidateThePoints(points: number = 0) {
    await this.editMileStoneWrapper.locator('button', { hasText: 'Preview award' }).click();
    const previewModal = this.page.locator('[role="dialog"][data-state="open"] > div');
    await expect(previewModal).toBeVisible();
    await expect(this.previewWindowModalBadgeIconOutline).toBeVisible();
    const rewardPointText = await this.previewWindowModalBadgePointText.textContent();
    const pointLabel = points === Number('1') ? 'point' : 'points';
    expect(rewardPointText).toContain(`${points} ${pointLabel}`);
    await expect(this.previewWindowModalBadgePointTooltipIcon).toBeVisible();
    await this.previewWindowModalBadgePointTooltipIcon.click();
    await expect(this.previewWindowModalBadgePointTooltipText).toBeVisible();
    const rewardPointsInfoTooltipText = await this.previewWindowModalBadgePointTooltipText.textContent();
    const tooltipStrings = [
      'Only visible to you, your manager and app administrators',
      'Only visible to recipients, their managers and app administrators',
    ];
    expect(tooltipStrings).toContain(rewardPointsInfoTooltipText);
    await this.clickOnElement(this.previewWindowModal.locator('h2[class*="Typography-module__heading1"]'));
    await expect(this.previewWindowModalBadgePointTooltipText).not.toBeVisible();
    await previewModal.getByRole('button', { name: 'Close' }).click();
    await expect(previewModal).toBeHidden();
  }

  async editTheWorkAnniversaryInstanceAndSetThePoints(
    instanceIndex: number = 0,
    points: number = 0,
    customBadges: number = 0
  ) {
    await this.awardInstanceEditButton.nth(instanceIndex).click();
    await expect(this.awardInstanceEditModal).toBeVisible();
    await expect(this.awardInstanceModalHeading).toHaveText(`${instanceIndex + 1} year work anniversary`);
    if (customBadges !== undefined || customBadges !== 0) {
      const countOfCustomizationOptions = await this.awardInstanceCustomizeButtons.count();
      await this.awardInstanceCustomizeButtons.nth(countOfCustomizationOptions - 2).click();
      await expect(this.modalBadgeOptions.last()).toBeVisible();
      await this.modalBadgeOptions.nth(customBadges).click();
    }
    await this.awardInstanceCustomizeButtons.last().click();
    if (points == null) {
      await this.awardInstanceCancelButton.click();
    } else if (points === 0) {
      if ((await this.modalAwardPointsToReceiversSwitch.getAttribute('aria-checked')) === 'true') {
        await this.modalAwardPointsToReceiversSwitch.uncheck();
      }
      await this.awardInstanceSaveButton.click();
    } else {
      if ((await this.modalAwardPointsToReceiversSwitch.getAttribute('aria-checked')) === 'false') {
        await this.modalAwardPointsToReceiversSwitch.check();
        await this.modalAwardPointsToReceiversInput.fill(String(points));
        await this.awardInstanceSaveButton.click();
      }
    }
  }

  async saveTheWorkAnniversaryChanges() {
    await expect(this.workAnniversarySaveChangesButton).toBeVisible({ timeout: 5000 });
    const saveChangesIsEnabled = await this.workAnniversarySaveChangesButton.isEnabled();
    if (saveChangesIsEnabled) {
      await this.workAnniversarySaveChangesButton.click();
      // Note: Toast message validation should be handled by the calling test
      await this.clickOnTheEditWorkAnniversaryButton();
    }
  }

  async validateTheWorkAnniversaryRecognitionPost(
    recognitionResults: {
      recognitionId: string;
      year: number;
    }[],
    year?: number,
    point?: number
  ): Promise<void> {
    for (const result of recognitionResults) {
      const { recognitionId, year } = result;
      let expectedPoints: number | null = null;
      if (year === 1) expectedPoints = 20;
      else if (year === 2)
        expectedPoints = null; // no points
      else if (year === 3) expectedPoints = 30;

      await this.page.goto(`/recognition/recognition/${recognitionId}`);
      await expect(this.firstWorkAnniversaryPost).toBeVisible();
      if (expectedPoints === null) {
        await expect(this.workAnniversaryPostBadgeIconOutline).not.toBeVisible();
        await expect(this.workAnniversaryPostBadgePointText).not.toBeVisible();
      } else {
        const rewardPointText = await this.workAnniversaryPostBadgePointText.textContent();
        expect(rewardPointText).toContain(`${expectedPoints}`);
        await expect(this.workAnniversaryPostBadgePointTooltipIcon).toBeVisible();
        await this.workAnniversaryPostBadgePointTooltipIcon.click();
        await expect(this.workAnniversaryPostBadgePointTooltipText).toBeVisible();
        const rewardPointsInfoTooltipText = await this.workAnniversaryPostBadgePointTooltipText.textContent();
        const tooltipStrings = [
          'Only visible to you, your manager and app administrators',
          'Only visible to recipients, their managers and app administrators',
        ];
        expect(tooltipStrings).toContain(rewardPointsInfoTooltipText);
        await this.clickOnElement(this.firstWorkAnniversaryPost.locator('h2[class*="Typography-module__heading1"]'));
        await expect(this.workAnniversaryPostBadgePointTooltipText).not.toBeVisible();
      }
    }
  }

  /**
   * Validate the work anniversary post for specific points and custom badge
   * @param recognitionResults
   * @param point
   * @param customBadge (not mandatory, if true it will validate the custom badge else default badge)
   */
  async validateTheWorkAnniversaryRecognitionPostWithSpecificPoints(
    recognitionResults: any,
    point?: number,
    customBadge?: boolean
  ): Promise<void> {
    for (const result of recognitionResults) {
      const { recognitionId } = result;
      await this.page.goto(`/recognition/recognition/${recognitionId}`);
      await expect(this.firstWorkAnniversaryPost).toBeVisible();
      if (customBadge) {
        await expect(this.firstWorkAnniversaryPost.locator('[class*="UI_round"] svg > text')).not.toBeVisible();
      }
      if (point === null || point == 0) {
        await expect(this.workAnniversaryPostBadgeIconOutline).not.toBeVisible();
        await expect(this.workAnniversaryPostBadgePointText).not.toBeVisible();
      } else {
        const rewardPointText = await this.workAnniversaryPostBadgePointText.textContent();
        expect(rewardPointText).toContain(`${point}`);
        await expect(this.workAnniversaryPostBadgePointTooltipIcon).toBeVisible();
        await this.workAnniversaryPostBadgePointTooltipIcon.click();
        await expect(this.workAnniversaryPostBadgePointTooltipText).toBeVisible();
        const rewardPointsInfoTooltipText = await this.workAnniversaryPostBadgePointTooltipText.textContent();
        const tooltipStrings = [
          'Only visible to you, your manager and app administrators',
          'Only visible to recipients, their managers and app administrators',
        ];
        expect(tooltipStrings).toContain(rewardPointsInfoTooltipText);
        await this.clickOnElement(this.firstWorkAnniversaryPost.locator('h2[class*="Typography-module__heading1"]'));
        await expect(this.workAnniversaryPostBadgePointTooltipText).not.toBeVisible();
      }
    }
  }

  async deleteAllExistingWorkAnniversaryForTheUserIds(userIds: string[], tenantId: string) {
    // Original implementation from reference file:
    const userIdsString = userIds.map(id => `'${id}'`).join(', ');
    const query = getQuery('selectRecognitionsByUserAndTenant');
    const result = await executeQuery(
      query.replace('userIdsString', userIdsString).replace('tenantCode', tenantId),
      'recognition'
    );
    if (result.length > 0) {
      const recognitionIds = result.map((row: any) => row.recognitionId);
      for (const recognitionId of recognitionIds) {
        const queryForDeletion = `
          BEGIN;
          -- 1. UserRecognitionScore
          DELETE FROM "UserRecognitionScore"
          WHERE "recognitionId" = '${recognitionId}'::uuid
          RETURNING *;
          -- 2. ActivitySync
          DELETE FROM "ActivitySync"
          WHERE "recognitionId" = '${recognitionId}'::uuid
          RETURNING *;
          -- 3. Recipient
          DELETE FROM "Recipient"
          WHERE "recognitionId" = '${recognitionId}'::uuid
          RETURNING *;
          -- 4. Share
          DELETE FROM "Share"
          WHERE "recognitionId" = '${recognitionId}'::uuid
          RETURNING *;
          -- 5. Recognition
          DELETE FROM "Recognition" r
          WHERE r."id" = '${recognitionId}'::uuid
          RETURNING *;
          -- 6. Commit the changes
          COMMIT;
        `;
        console.log('queryForDeletion:\n ', queryForDeletion);
        console.log(await executeQuery(queryForDeletion, 'recognition'));
      }
    }
  }

  async setTheUserIdsStartDateAsCurrentDate(userIds: any[], tenantId: string): Promise<void> {
    const userIdsString = userIds.map(id => `'${id}'`).join(', ');
    const query = getQuery('setTheStartUtcDateToTheUsers');
    await executeQuery(query.replace('userIdsString', userIdsString).replace('tenantCode', tenantId), 'recognition');
  }

  async setTheStartDateForUsersForWorkAnniversary(userId: any, number: number, tenantId: string) {
    // Original implementation from reference file:
    const query = getQuery('setTheStartUtcDateToTheUserByIncreasingYears');
    return await executeQuery(
      query
        .replace('userIdsString', `'${userId}'`) // wrap in quotes for SQL
        .replace('tenantCode', tenantId)
        .replace('numberOfYears', number.toString()),
      'recognition'
    );
  }

  async getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds: any[], tenantId: string): Promise<any> {
    // Original implementation from reference file:
    const userIdsString = userIds.map(id => `'${id}'`).join(', ');
    const query = getQuery('selectRecognitionsByUserAndTenant');
    return await executeQuery(
      query.replace('userIdsString', userIdsString).replace('tenantCode', tenantId),
      'recognition'
    );
  }

  async validateTheCSVDataForPointsGiven(points: number, message: string) {
    // Original implementation from reference file:
    const manageRecognitionPage = new ManageRewardsOverviewPage(this.page);
    await manageRecognitionPage.loadPage();
    await manageRecognitionPage.verifyThePageIsLoaded();
    await manageRecognitionPage.activityPointsGivenTable.click({ force: true });
    // ✅ Trigger and capture download
    const [download] = await Promise.all([
      manageRecognitionPage.page.waitForEvent('download'),
      manageRecognitionPage.activityTableDownloadCSVButton.click(),
    ]);
    // ✅ Save in downloads folder
    const csvFilePath = path.resolve('./downloads', download.suggestedFilename());
    await download.saveAs(csvFilePath);
    // ✅ Validate last row column value
    let validationResult = await CSVUtils.validateRowValue('last', 14, 'APPROVED', csvFilePath);
    expect(validationResult.isMatch, `Expected "APPROVED" but got "${validationResult.actualValue}"`).toBeTruthy();
    validationResult = await CSVUtils.validateRowValue('last', 12, String(points), csvFilePath);
    expect(validationResult.isMatch, `Expected ${points} but got "${validationResult.actualValue}"`).toBeTruthy();
    validationResult = await CSVUtils.validateRowValue('last', 15, message, csvFilePath);
    expect(validationResult.isMatch, `Expected ${message} but got "${validationResult.actualValue}"`).toBeTruthy();
    fs.unlinkSync(csvFilePath);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.tableGridFirstRow.last(), {
      timeout: 10000,
      stepInfo: 'Wait for the table to be visible on Work Anniversary page',
    });
    return Promise.resolve(undefined);
  }
}
