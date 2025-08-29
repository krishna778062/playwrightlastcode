import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudiencePage } from '@platforms/pages/abacPage/acgPage/audiencePage';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';

test.describe('Audience Category Testcases', { tag: [TestSuite.AUDIENCE, TestSuite.AUDIENCE_CATEGORY] }, () => {
  test(
    'Create category modal: Verify category name and description fields accept alphanumeric and special characters',
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
      await audiencePage.addCategoryModal.verifyCategoryNameInputAcceptsInput(
        'Test123 @#$ with Space and-Category_Name'
      );
      await audiencePage.addCategoryModal.verifyCategoryDescriptionInputAcceptsInput(
        'Description 123 @#$% with spaces and-special_chars'
      );
      await audiencePage.clickOnCloseButton();
    }
  );

  test(
    'Create category modal: Verify category name and description strips out input length > max length allowed',
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
      await audiencePage.addCategoryModal.verifyNameFieldMaxLength();
      await audiencePage.addCategoryModal.verifyDescriptionFieldMaxLength();
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

      // Verify Close button prevents category creation
      await audiencePage.verifyCategoryCloseButtonBehavior();
    }
  );

  test(
    'Verify alert message when duplicate category name is provided and verify presence of three options under option menu dropdown for category',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage, audienceCategoryManagementHelper }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35411', 'PS-35413'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const uniqueCategoryName = TestDataGenerator.generateCategoryName('001DuplicateTestCategory');

      await audiencePage.loadPage();

      // Create first category via API to establish duplicate scenario
      await audienceCategoryManagementHelper.createCategory(uniqueCategoryName, {
        description: 'Category created via API for duplicate test',
      });

      // Reload the page to see the API-created category
      await audiencePage.page.reload({ waitUntil: 'domcontentloaded' });

      // Attempt to create category with the same name via UI and verify alert message
      await audiencePage.attemptToCreateDuplicateCategory(uniqueCategoryName);
      await audiencePage.verifyNameAlreadyUsedError();
      await audiencePage.clickOnCloseButton();

      // Verify the presence of options in the category dropdown menu
      await audiencePage.verifyAllCategoryOptionsArePresent(uniqueCategoryName);
      await audiencePage.closeOpenDropdown();
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
      const categoryWithDescription = TestDataGenerator.generateCategoryName('001TestCategoryWithDesc');
      const categoryDescription = TestDataGenerator.generateRandomString();

      await audiencePage.loadPage();

      // Create category WITH description and verify creation
      await audiencePage.createCategoryWithNameAndDescription(categoryWithDescription, categoryDescription);
      await audiencePage.verifyToastMessageForCategoryOperation('created');

      // Clean up via UI since this was created via UI (testing UI workflow)
      await audiencePage.deleteCategoryByShowMore(categoryWithDescription);
      await audiencePage.verifyToastMessageForCategoryOperation('deleted');
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
      const categoryWithoutDescription = TestDataGenerator.generateCategoryName('001TestCategoryNoDesc');

      await audiencePage.loadPage();

      // Create category WITHOUT description and verify creation
      await audiencePage.createCategoryWithNameAndDescription(categoryWithoutDescription);
      await audiencePage.verifyToastMessageForCategoryOperation('created');

      // Clean up via UI since this was created via UI (testing UI workflow)
      await audiencePage.deleteCategoryByShowMore(categoryWithoutDescription);
      await audiencePage.verifyToastMessageForCategoryOperation('deleted');
    }
  );

  test(
    'Verify the appearance of Edit category modal, Save button behavior, and name field validation',
    { tag: [TestPriority.P2] },
    async ({ appManagerPage, audienceCategoryManagementHelper }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35417', 'PS-35416', 'PS-35412'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const testCategoryName = TestDataGenerator.generateCategoryName('001EditTestCategory');

      await audiencePage.loadPage();

      // Create a category via API to edit (without description so we can test "Add description" button)
      await audienceCategoryManagementHelper.createCategory(testCategoryName);

      // Reload the page to see the API-created category
      await audiencePage.page.reload({ waitUntil: 'domcontentloaded' });

      // Open Edit category modal and verify elements
      await audiencePage.openEditCategoryModal(testCategoryName);
      await audiencePage.editCategoryModal.verifyUIElementsOfCategoryModal();
      await audiencePage.editCategoryModal.verifyEditCategoryNameFieldValidation();

      // Verify field validations similar to Create category modal
      await audiencePage.editCategoryModal.verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial();
      await audiencePage.editCategoryModal.verifyNameFieldMaxLength();
      await audiencePage.editCategoryModal.verifyDescriptionFieldMaxLength();
      await audiencePage.editCategoryModal.removeDescriptionAndVerifyAbsence();

      // Close the Edit modal
      await audiencePage.editCategoryModal.clickCloseButton();

      // Note: Cleanup is handled automatically by the afterEach hook
    }
  );

  test(
    'Verify the presence of alert message when duplicate category name is provided in name field under Edit category popup',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage, audienceCategoryManagementHelper }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35415'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const firstCategoryName = TestDataGenerator.generateCategoryName('001EditDuplicateTest1');
      const secondCategoryName = TestDataGenerator.generateCategoryName('002EditDuplicateTest2');

      await audiencePage.loadPage();

      // Create two categories via API for the duplicate test
      await audienceCategoryManagementHelper.createCategory(firstCategoryName, {
        description: `Creating first category with name : ${firstCategoryName} via API for edit duplicate test`,
      });
      await audienceCategoryManagementHelper.createCategory(secondCategoryName, {
        description: `Creating second category with name : ${secondCategoryName} via API for edit duplicate test`,
      });

      // Reload the page to see the API-created categories
      await audiencePage.page.reload({ waitUntil: 'domcontentloaded' });
      // Open Edit modal for the second category and attempt duplicate name
      await audiencePage.attemptToSaveEditCategoryWithDuplicateName(secondCategoryName, firstCategoryName);
      await audiencePage.verifyNameAlreadyUsedError();
      await audiencePage.editCategoryModal.clickCloseButton();
    }
  );

  test('Edit category modal: validations and basic actions', { tag: [TestPriority.P0] }, async ({ appManagerPage }) => {
    tagTest(test.info(), {
      zephyrTestId: ['PS-35418', 'PS-35419', 'PS-35420', 'PS-35421', 'PS-35422'],
    });
    const audiencePage = new AudiencePage(appManagerPage);
    const categoryName = `NoDesc_${Date.now()}`;

    // Load the audience page
    await audiencePage.loadPage();
    await audiencePage.verifyThePageIsLoaded();

    // Step 1: Create category with no description
    await audiencePage.createCategoryWithNameAndDescription(categoryName);
    await audiencePage.verifyToastMessageForCategoryOperation('created');

    // Step 2: Click on Edit for that category from options menu dropdown
    await audiencePage.openEditCategoryModal(categoryName);

    // Step 3: Click on Add description and verify description field and delete (dustbin) icon presence
    await audiencePage.clickAddDescriptionAndVerify(true);

    // Step 4: Verify name field accepts alphabets, numbers, and special characters (and description as well)
    await audiencePage.verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(true);

    // Step 5: Verify the updated name length limit is <= 100 chars using existing reusable method
    await audiencePage.editCategoryModal.verifyNameFieldMaxLength();

    // Step 6: Verify the updated description length limit is <= 1024 chars
    await audiencePage.editCategoryModal.verifyDescriptionFieldMaxLength();

    // Close Edit modal and clean up category
    await audiencePage.editCategoryModal.clickCloseButton();
    await audiencePage.deleteCategoryByShowMore(categoryName);
    await audiencePage.verifyToastMessageForCategoryOperation('deleted');
  });

  test(
    'Verify category should not get updated when user clicks on Cancel or Close button under Edit category popup',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), { zephyrTestId: ['PS-35423', 'PS-35424'] });
      const audiencePage = new AudiencePage(appManagerPage);
      const categoryName = `EditDismiss_${Date.now()}`;

      // Setup: create a category
      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();
      await audiencePage.createCategoryWithNameAndDescription(categoryName);
      await audiencePage.verifyToastMessageForCategoryOperation('created');

      // Verify dismiss via Cancel and Close both prevent update using reusable helper
      await audiencePage.verifyEditDismissPreventsUpdate(categoryName, 'Cancel');
      await audiencePage.verifyEditDismissPreventsUpdate(categoryName, 'Close');

      // Cleanup
      await audiencePage.deleteCategoryByShowMore(categoryName);
      await audiencePage.verifyToastMessageForCategoryOperation('deleted');
    }
  );

  test('Edit category modal: Update actions', { tag: [TestPriority.P0] }, async ({ appManagerPage }) => {
    tagTest(test.info(), { zephyrTestId: ['PS-35425', 'PS-35426', 'PS-35428', 'PS-35427'] });
    const audiencePage = new AudiencePage(appManagerPage);
    const baseName = `EditUpdate_${Date.now()}`;
    const updatedName = `${baseName}_Renamed`;
    const oldDescriptionText = `Old description at ${new Date().toISOString()}`;
    const newDescriptionText = `Updated description at ${new Date().toISOString()}`;

    // Setup: create a category to edit
    await audiencePage.loadPage();
    await audiencePage.verifyThePageIsLoaded();
    await audiencePage.createCategoryWithNameAndDescription(baseName);
    await audiencePage.verifyToastMessageForCategoryOperation('created');

    // Step 1: Update name and verify
    await audiencePage.updateCategoryNameAndVerify(baseName, updatedName);

    // Step 2: Add description and verify
    await audiencePage.addDescriptionForCategoryAndVerifyInList(updatedName, oldDescriptionText);

    // Step 3: Update description and verify
    await audiencePage.updateDescriptionForCategoryAndVerifyInList(updatedName, oldDescriptionText, newDescriptionText);

    await audiencePage.removeDescriptionForCategoryAndVerifyInList(updatedName, newDescriptionText);

    // Cleanup
    await audiencePage.deleteCategoryByShowMore(updatedName);
    await audiencePage.verifyToastMessageForCategoryOperation('deleted');
  });
});
