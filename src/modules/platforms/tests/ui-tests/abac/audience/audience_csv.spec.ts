import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { AUDIENCE_TEST_DATA } from '../../../test-data/audience-test-data';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { AudiencePage } from '@/src/modules/platforms/ui/pages/abacPage/acgPage/audiencePage';

test.describe('audience CSV Upload Testcases', { tag: [TestSuite.AUDIENCE, TestSuite.AUDIENCE_CSV] }, () => {
  test(
    'cSV Upload: Verify user can fill audience name, description, select category, upload CSV file, and create audience',
    { tag: [TestPriority.P1, `@ABAC`, `@acg`] },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33624', 'PS-33625', 'PS-33628'],
      });

      const audiencePage = new AudiencePage(appManagerFixture.page);
      const uniqueCategoryName = TestDataGenerator.generateCategoryName('CSV_TestCategory');
      const uniqueAudienceName = TestDataGenerator.generateAudienceName('CSV_TestAudience');
      const audienceDescription = TestDataGenerator.generateRandomString('CSV audience description');

      await audiencePage.loadPage();

      // Step 1: Create category via API
      await appManagerFixture.audienceCategoryManagementHelper.createCategory(uniqueCategoryName, {
        description: 'Category created via API for CSV test',
      });

      // Step 2: Load audience page and reload to see API-created category
      await audiencePage.page.reload({ waitUntil: 'domcontentloaded' });

      // Step 3: Open Create Audience with CSV modal
      await audiencePage.openCreateAudienceWithCsvModal();

      // Step 4: Fill audience name
      await audiencePage.csvUploadModal.fillAudienceName(uniqueAudienceName);

      // Step 5: Add description
      await audiencePage.csvUploadModal.clickAddDescription();
      await audiencePage.csvUploadModal.addAudienceDescription(audienceDescription);

      // Step 6: Select category from dropdown
      await audiencePage.csvUploadModal.selectCategory(uniqueCategoryName);

      // Step 7: Upload CSV file using framework method
      await audiencePage.csvUploadModal.uploadCsvFile(AUDIENCE_TEST_DATA.CSV_FILES.VALID_AUDIENCE);

      // Step 8: Click Create button to submit the form
      await audiencePage.csvUploadModal.clickCreate();
    }
  );

  test(
    'cSV Upload Error Validation: Verify error messages for missing name, invalid CSV format, and download example CSV',
    { tag: [TestPriority.P1, `@ABAC`, `@acg`] },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33632', 'PS-33630', 'PS-33629', 'PS-33627'],
      });

      const audiencePage = new AudiencePage(appManagerFixture.page);

      await audiencePage.loadPage();

      // Step 1: Open Create Audience with CSV modal
      await audiencePage.openCreateAudienceWithCsvModal();

      // Step 4: Test name required validation
      // Click on name input then click elsewhere to trigger validation
      await audiencePage.csvUploadModal.triggerNameValidation();
      await audiencePage.csvUploadModal.verifyErrorMessage('Name is a required field');

      // Step 5: Test category missing validation
      await audiencePage.csvUploadModal.triggerCategoryValidation();
      await audiencePage.csvUploadModal.verifyErrorMessage('Category is a required field');

      // Step 6: Test invalid CSV format validation (without selecting category)
      await audiencePage.csvUploadModal.uploadCsvFile(AUDIENCE_TEST_DATA.CSV_FILES.INVALID_SITES);
      await audiencePage.csvUploadModal.verifyErrorMessage('CSV format is incorrect.');

      // Step 7: Test download example CSV functionality (with auto cleanup)
      await audiencePage.csvUploadModal.clickDownloadExampleCsv();

      // Step 8: Cancel the modal to clean up
      await audiencePage.csvUploadModal.clickCancelButton(
        audiencePage.csvUploadModal.cancelButton,
        'Click Cancel button to close CSV upload modal'
      );
    }
  );

  test(
    'cSV Upload: Verify blank CSV file validation error',
    { tag: [TestPriority.P1, `@ABAC`, `@acg`] },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33633'],
      });

      const audiencePage = new AudiencePage(appManagerFixture.page);

      await audiencePage.loadPage();
      await audiencePage.openCreateAudienceWithCsvModal();

      // Step 1: Upload blank/empty CSV file (no need to fill other fields for error validation)
      await audiencePage.csvUploadModal.uploadCsvFile(AUDIENCE_TEST_DATA.CSV_FILES.EMPTY_CSV);
      await audiencePage.csvUploadModal.verifyErrorMessage('CSV file cannot be empty');

      // Step 2: Cancel the modal to clean up
      await audiencePage.csvUploadModal.clickCancelButton(
        audiencePage.csvUploadModal.cancelButton,
        'Click Cancel button to close CSV upload modal'
      );
    }
  );

  test(
    'cSV Upload: Verify user can add new category during CSV upload process',
    { tag: [TestPriority.P1, `@ABAC`, `@acg`] },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33626'],
      });

      const audiencePage = new AudiencePage(appManagerFixture.page);
      const uniqueAudienceName = TestDataGenerator.generateAudienceName('CSV_NewCategoryTest');
      const newCategoryName = TestDataGenerator.generateCategoryName('CSV_CreatedCategory');
      const audienceDescription = TestDataGenerator.generateRandomString('CSV audience with new category');

      await audiencePage.loadPage();

      // Step 1: Open Create Audience with CSV modal (without creating category first)
      await audiencePage.openCreateAudienceWithCsvModal();

      // Step 2: Fill audience name
      await audiencePage.csvUploadModal.fillAudienceName(uniqueAudienceName);

      // Step 3: Add description
      await audiencePage.csvUploadModal.clickAddDescription();
      await audiencePage.csvUploadModal.addAudienceDescription(audienceDescription);

      // Step 4: Create new category on-the-fly using existing selectCategory method
      await audiencePage.csvUploadModal.selectCategory(newCategoryName);

      // Step 5: Upload valid CSV file
      await audiencePage.csvUploadModal.uploadCsvFile(AUDIENCE_TEST_DATA.CSV_FILES.VALID_AUDIENCE);

      // Step 6: Click Create button to submit
      await audiencePage.csvUploadModal.clickCreate();

      // Step 7: Wait for creation to complete
      await audiencePage.page.waitForTimeout(3000);

      // Step 8: Verify new category was created using API
      const categoryId = await appManagerFixture.identityManagementHelper.identityService.getCategoryId(
        newCategoryName,
        100
      );
      expect(categoryId, `Category "${newCategoryName}" should be created during CSV upload`).toBeTruthy();

      // Step 9: Register the existing category for cleanup (don't create duplicate)
      appManagerFixture.audienceCategoryManagementHelper.registerCategoryForCleanup(categoryId, newCategoryName);
    }
  );
});
