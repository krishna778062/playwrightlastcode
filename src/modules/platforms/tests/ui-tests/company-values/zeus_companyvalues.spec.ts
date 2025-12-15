import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { PAGE_STATES } from '@platforms/constants';
import {
  COMPANY_VALUE_BUTTONS,
  COMPANY_VALUE_ERROR_MESSAGES,
  COMPANY_VALUE_MENU_OPTIONS,
  COMPANY_VALUE_MODAL_TEXT,
  COMPANY_VALUE_SUCCESS_MESSAGES,
  COMPANY_VALUE_TEST_DATA,
  COMPANY_VALUE_VALIDATION_STRINGS,
} from '@platforms/constants/companyValues';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { CompanyValuePage } from '@platforms/ui/pages/companyValues/companyValue';

test.describe(
  'company Values Tests',
  {
    tag: ['@companyValues', '@zeus', '@Platform_Services', '@Zulu'],
  },
  () => {
    test(
      'verify whether user is able to create company values',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-818'],
          description: 'Verify that user is able to create company values',
        });

        const companyValuePage = new CompanyValuePage(zuluAppManagerPage);
        const randomSuffix = faker.string.alpha({ length: 5, casing: 'upper' });
        const companyValue = `${COMPANY_VALUE_TEST_DATA.BASE_NAME}${randomSuffix}`;
        const description = COMPANY_VALUE_TEST_DATA.DESCRIPTION;

        await companyValuePage.loadPage();
        await companyValuePage.createCompanyValue(companyValue, description);
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.ADDED);
        await companyValuePage.verifyPresenceOfCompanyValueWithDescription(companyValue, description);
      }
    );

    test(
      'verify that User can Enable Disable company value and unable to edit company value when company value is disabled',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-809', 'PS-810', 'PS-835', 'PS-6306'],
          description:
            'Verify that User can Enable Disable company value and unable to edit company value when company value is disabled',
        });

        const companyValuePage = new CompanyValuePage(zuluAppManagerPage);
        const randomSuffix = faker.string.alpha({ length: 5, casing: 'upper' });
        const companyValue = `${COMPANY_VALUE_TEST_DATA.BASE_NAME}${randomSuffix}`;
        const description = COMPANY_VALUE_TEST_DATA.DESCRIPTION;

        await companyValuePage.loadPage();
        await companyValuePage.createCompanyValue(companyValue, description);
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.ADDED);

        // Reload page to ensure the newly created company value is visible
        await companyValuePage.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });
        await companyValuePage.verifyThePageIsLoaded();

        // Now proceed with disable/enable test - verify the company value is present first
        await companyValuePage.verifyPresenceOfCompanyValueField(companyValue);
        await companyValuePage.scrollToCompanyValue(companyValue);
        await companyValuePage.hoverAndClickThreeDotsOption(COMPANY_VALUE_MENU_OPTIONS.DISABLE, companyValue);

        // Verify disable modal
        await companyValuePage.verifyDisableModal(COMPANY_VALUE_MODAL_TEXT.DISABLE_HEADING, [
          COMPANY_VALUE_MODAL_TEXT.DISABLE_CONFIRMATION,
          COMPANY_VALUE_MODAL_TEXT.DISABLE_INFO_1,
          COMPANY_VALUE_MODAL_TEXT.DISABLE_INFO_2,
        ]);
        await companyValuePage.verifyModalButtons([
          COMPANY_VALUE_BUTTONS.CANCEL,
          COMPANY_VALUE_BUTTONS.CONFIRM,
          COMPANY_VALUE_BUTTONS.CLOSE,
        ]);

        // Confirm disable
        await companyValuePage.clickConfirmButton();
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.DISABLED);

        // Verify Edit and Disable options are not present
        await companyValuePage.verifyOptionNotPresent(COMPANY_VALUE_MENU_OPTIONS.EDIT, companyValue);
        await companyValuePage.verifyOptionNotPresent(COMPANY_VALUE_MENU_OPTIONS.DISABLE, companyValue);

        // Enable the company value
        await companyValuePage.hoverAndClickThreeDotsOption(COMPANY_VALUE_MENU_OPTIONS.ENABLE, companyValue);
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.ENABLED);
      }
    );

    test(
      'verify whether application throw error message when user is providing more than 100 characters for company value and more than 500 characters while updating company value',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-6308'],
          description:
            'Verify whether application throw error message when user is providing more than 100 characters for company value and more than 500 characters while updating company value',
        });

        const companyValuePage = new CompanyValuePage(zuluAppManagerPage);
        const randomSuffix = faker.string.alpha({ length: 5, casing: 'upper' });
        const companyValue = `${COMPANY_VALUE_TEST_DATA.BASE_NAME}${randomSuffix}`;
        const description = COMPANY_VALUE_TEST_DATA.DESCRIPTION;
        const longValue = COMPANY_VALUE_VALIDATION_STRINGS.LONG_VALUE;
        const longDescription = COMPANY_VALUE_VALIDATION_STRINGS.LONG_DESCRIPTION;

        await companyValuePage.loadPage();
        await companyValuePage.createCompanyValue(companyValue, description);
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.ADDED);

        // Reload page to ensure the newly created company value is visible
        await companyValuePage.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });
        await companyValuePage.verifyThePageIsLoaded();

        await companyValuePage.verifyPresenceOfCompanyValueField(companyValue);
        await companyValuePage.scrollToCompanyValue(companyValue);
        await companyValuePage.hoverAndClickThreeDotsOption(COMPANY_VALUE_MENU_OPTIONS.EDIT, companyValue);

        await companyValuePage.enterCompanyValue(longValue);
        // Click away from the field to trigger validation
        await companyValuePage.clickDescriptionField();
        await companyValuePage.verifyErrorMessage(COMPANY_VALUE_ERROR_MESSAGES.EXCEED_100_CHARACTERS);

        await companyValuePage.enterCompanyValueDescription(longDescription);
        // Click away from the field to trigger validation
        await companyValuePage.clickValueField();
        await companyValuePage.verifyErrorMessage(COMPANY_VALUE_ERROR_MESSAGES.EXCEED_500_CHARACTERS);
      }
    );

    test(
      'verify whether system throws error when user creates duplicate company values',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-820'],
          description: 'Verify whether system throws error when user creates duplicate company values',
        });

        const companyValuePage = new CompanyValuePage(zuluAppManagerPage);
        const randomSuffix = faker.string.alpha({ length: 5, casing: 'upper' });
        const companyValue = `${COMPANY_VALUE_TEST_DATA.BASE_NAME}${randomSuffix}`;
        const description = COMPANY_VALUE_TEST_DATA.DESCRIPTION;

        await companyValuePage.loadPage();
        await companyValuePage.createCompanyValue(companyValue, description);
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.ADDED);

        await companyValuePage.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });
        await companyValuePage.verifyThePageIsLoaded();

        await companyValuePage.clickAddCompanyValueButton();
        await companyValuePage.enterCompanyValue(companyValue);
        await companyValuePage.enterCompanyValueDescription(description);
        await companyValuePage.clickAddButton();
        await companyValuePage.verifyErrorMessage(COMPANY_VALUE_ERROR_MESSAGES.DUPLICATE);
      }
    );

    test(
      'verify whether user is able to update the existing company values and description',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-834'],
          description: 'Verify whether user is able to update the existing company values and description',
        });

        const companyValuePage = new CompanyValuePage(zuluAppManagerPage);
        const randomSuffix1 = faker.string.alpha({ length: 5, casing: 'upper' });
        const companyValue = `${COMPANY_VALUE_TEST_DATA.BASE_NAME}${randomSuffix1}`;
        const description = COMPANY_VALUE_TEST_DATA.DESCRIPTION;
        const randomSuffix2 = faker.string.alpha({ length: 5, casing: 'upper' });
        const updatedValue = `${COMPANY_VALUE_TEST_DATA.UPDATED_PREFIX}${randomSuffix2}`;
        const updatedDescription = COMPANY_VALUE_TEST_DATA.UPDATED_DESCRIPTION;

        await companyValuePage.loadPage();
        await companyValuePage.createCompanyValue(companyValue, description);
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.ADDED);

        await companyValuePage.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });
        await companyValuePage.verifyThePageIsLoaded();

        await companyValuePage.verifyPresenceOfCompanyValueField(companyValue);

        await companyValuePage.updateCompanyValue(companyValue, updatedValue, updatedDescription);
        await companyValuePage.verifySuccessMessage(COMPANY_VALUE_SUCCESS_MESSAGES.UPDATED);

        await companyValuePage.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });
        await companyValuePage.verifyThePageIsLoaded();
        await companyValuePage.verifyPresenceOfCompanyValueWithDescription(updatedValue, updatedDescription);
      }
    );

    test(
      'verify whether application throw error message when user is providing more than 100 characters for company value and more than 500 characters while adding company value',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-836'],
          description:
            'Verify whether application throw error message when user is providing more than 100 characters for company value and more than 500 characters while adding company value',
        });

        const companyValuePage = new CompanyValuePage(zuluAppManagerPage);
        const longValue = COMPANY_VALUE_VALIDATION_STRINGS.LONG_VALUE;
        const longDescription = COMPANY_VALUE_VALIDATION_STRINGS.LONG_DESCRIPTION;

        await companyValuePage.loadPage();
        await companyValuePage.clickAddCompanyValueButton();

        await companyValuePage.clickValueField();
        await companyValuePage.clickDescriptionField();
        await companyValuePage.verifyErrorMessage(COMPANY_VALUE_ERROR_MESSAGES.VALUE_REQUIRED);

        await companyValuePage.enterCompanyValue(longValue);
        await companyValuePage.clickDescriptionField();
        await companyValuePage.verifyErrorMessage(COMPANY_VALUE_ERROR_MESSAGES.EXCEED_100_CHARACTERS);

        await companyValuePage.enterCompanyValueDescription(longDescription);
        await companyValuePage.clickValueField();
        await companyValuePage.verifyErrorMessage(COMPANY_VALUE_ERROR_MESSAGES.EXCEED_500_CHARACTERS);
      }
    );
  }
);
