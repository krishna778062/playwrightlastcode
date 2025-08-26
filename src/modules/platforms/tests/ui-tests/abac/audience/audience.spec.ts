import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { AudienceCategoryManagementHelper } from '@core/helpers/audienceCategoryManagementHelper';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudiencePage } from '@platforms/pages/abacPage/acgPage/audiencePage';

// Helper function to generate unique category names with consistent timestamp-based naming
function generateCategoryName(prefix: string = 'TestCategory'): string {
  return `${prefix}_${Date.now()}`;
}

// Helper function to generate test description with timestamp
function generateTestDescription(description: string = 'Test description for category'): string {
  return `${description} created at ${new Date().toISOString()}`;
}

test.describe('Audience Testcases', { tag: [TestSuite.AUDIENCE] }, () => {
  let categoryHelper: AudienceCategoryManagementHelper;

  // Initialize the category helper before each test
  test.beforeEach(async ({ appManagerApiClient }) => {
    categoryHelper = new AudienceCategoryManagementHelper(appManagerApiClient);
  });

  // Clean up all categories created during tests
  test.afterEach(async () => {
    if (categoryHelper) {
      await categoryHelper.cleanup();
    }
  });
  test(
    'Create category modal: validations and basic actions',
    { tag: [TestPriority.P2] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: [
          'PS-35395',
          'PS-35396',
          'PS-35397',
          'PS-35398',
          'PS-35399',
          'PS-35400',
          'PS-35401',
          'PS-35403',
          'PS-35404',
          'PS-35406',
        ],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      await audiencePage.loadPage();
      await audiencePage.openCreateCategoryModal();
      await audiencePage.verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial();
      await audiencePage.verifyNameFieldMaxLength();
      await audiencePage.verifyDescriptionFieldMaxLength();
      await audiencePage.clickAddDescriptionAndVerify();
      await audiencePage.removeDescriptionAndVerifyAbsence();
      await audiencePage.clickOnCloseButton();
    }
  );

  test(
    'Verify category should not get created when user clicks on Cancel button',
    { tag: [TestPriority.P2] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35407'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Verify Cancel button prevents category creation
      await audiencePage.verifyCategoryCancelButtonBehavior();
    }
  );

  test(
    'Verify category should not get created when user clicks on Close button',
    { tag: [TestPriority.P2] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35408'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Verify Close button prevents category creation
      await audiencePage.verifyCategoryCloseButtonBehavior();
    }
  );

  test(
    'Verify alert message when duplicate category name is provided and verify presence of three options under option menu dropdown for category',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35411', 'PS-35413'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const uniqueCategoryName = generateCategoryName('001DuplicateTestCategory');

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create first category via API to establish duplicate scenario
      await categoryHelper.createCategory(uniqueCategoryName, {
        description: 'Category created via API for duplicate test',
      });

      // Reload the page to see the API-created category
      await audiencePage.page.reload();
      await audiencePage.page.waitForLoadState('domcontentloaded');

      // Attempt to create category with the same name via UI and verify alert message
      await audiencePage.attemptToCreateDuplicateCategory(uniqueCategoryName);
      await audiencePage.verifyNameAlreadyUsedError();
      await audiencePage.clickOnCloseButton();

      // Verify the presence of options in the category dropdown menu
      await audiencePage.verifyAllCategoryOptionsArePresent(uniqueCategoryName);
      await audiencePage.closeOpenDropdown();

      // Note: Cleanup is handled automatically by the afterEach hook
    }
  );

  test(
    'Verify category WITH description should get created when user clicks on Add button under Create category popup',
    { tag: [TestPriority.P1] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35410'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const categoryWithDescription = generateCategoryName('001TestCategoryWithDesc');
      const categoryDescription = generateTestDescription();

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create category WITH description and verify creation
      await audiencePage.createCategoryWithNameAndDescription(categoryWithDescription, categoryDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('created');

      // Clean up via UI since this was created via UI (testing UI workflow)
      await audiencePage.deleteCategoryByShowMore(categoryWithDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');
    }
  );

  test(
    'Verify category WITHOUT description should get created when user clicks on Add button under Create category popup',
    { tag: [TestPriority.P1] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35409'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const categoryWithoutDescription = generateCategoryName('001TestCategoryNoDesc');

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create category WITHOUT description and verify creation
      await audiencePage.createCategoryWithNameAndDescription(categoryWithoutDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('created');

      // Clean up via UI since this was created via UI (testing UI workflow)
      await audiencePage.deleteCategoryByShowMore(categoryWithoutDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');
    }
  );

  test(
    'Verify the appearance of Edit category modal, Save button behavior, and name field validation',
    { tag: [TestPriority.P2] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35417', 'PS-35416', 'PS-35412'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const testCategoryName = generateCategoryName('001EditTestCategory');

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create a category via API to edit (without description so we can test "Add description" button)
      await categoryHelper.createCategory(testCategoryName);

      // Reload the page to see the API-created category
      await audiencePage.page.reload();
      await audiencePage.page.waitForLoadState('domcontentloaded');

      // Open Edit category modal and verify elements
      await audiencePage.openEditCategoryModal(testCategoryName);
      await audiencePage.verifyEditCategoryModalElements();
      await audiencePage.verifyEditCategoryNameFieldValidation();

      // Verify field validations similar to Create category modal
      await audiencePage.verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(true);
      await audiencePage.verifyNameFieldMaxLength(true);
      await audiencePage.verifyDescriptionFieldMaxLength(true);
      await audiencePage.clickAddDescriptionAndVerify(true);
      await audiencePage.removeDescriptionAndVerifyAbsence(true);

      // Close the Edit modal
      await audiencePage.clickOnCloseButton({ isEditModal: true });

      // Note: Cleanup is handled automatically by the afterEach hook
    }
  );

  test(
    'Verify the presence of alert message when duplicate category name is provided in name field under Edit category popup',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35415'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const firstCategoryName = generateCategoryName('001EditDuplicateTest1');
      const secondCategoryName = generateCategoryName('002EditDuplicateTest2');

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create two categories via API for the duplicate test
      await categoryHelper.createCategory(firstCategoryName, {
        description: 'Categories created via API for edit duplicate test',
      });
      await categoryHelper.createCategory(secondCategoryName, {
        description: 'Categories created via API for edit duplicate test',
      });

      // Reload the page to see the API-created categories
      await audiencePage.page.reload();
      await audiencePage.page.waitForLoadState('domcontentloaded');

      // Open Edit modal for the second category and attempt duplicate name
      await audiencePage.attemptToSaveEditCategoryWithDuplicateName(secondCategoryName, firstCategoryName);
      await audiencePage.verifyNameAlreadyUsedError();
      await audiencePage.clickOnCloseButton({ isEditModal: true });

      // Note: Cleanup is handled automatically by the afterEach hook
    }
  );
});
