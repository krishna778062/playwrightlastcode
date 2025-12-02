import { CustomFieldsPage } from '@modules/comms-planner/pages/customizations/customFieldsPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { test } from '@/src/modules/comms-planner/fixtures/loginFixture';

test.describe('customizations - Custom field', () => {
  let customFieldsPage: CustomFieldsPage;
  const DATE_NOW: number = new Date().getTime();

  test.beforeEach(async ({ appManagersPage }) => {
    customFieldsPage = new CustomFieldsPage(appManagersPage);

    await customFieldsPage.loadPage({ stepInfo: 'Loading comms planner - customization page' });
    await customFieldsPage.verifyThePageIsLoaded();
  });

  test(
    'verify custom field creation | Label',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@CUSTOM-FIELDS_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify custom field creation | Label',
        zephyrTestId: '',
        storyId: '',
      });
      const meta = {
        name: `Label | ${DATE_NOW}`,
        options: [`option 1`, `option 2`, `option 3`],
      };

      // await customFieldsPage.filterCustomFieldListingByFieldType(`Label`);

      await customFieldsPage.clickAddCustomFieldButton();
      await customFieldsPage.verifyOpenedCustomFieldModal();
      await customFieldsPage.addCustomFieldName(meta.name);
      await customFieldsPage.selectCustomFieldTypeLabel(meta.options);
      await customFieldsPage.clickCreateCustomFieldModalButton();
    }
  );

  test(
    'verify custom field creation | Text',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@CUSTOM-FIELDS_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify custom field creation | Text',
        zephyrTestId: '',
        storyId: '',
      });
      const meta = {
        name: `Text - ${DATE_NOW}`,
      };

      await customFieldsPage.clickAddCustomFieldButton();
      await customFieldsPage.verifyOpenedCustomFieldModal();
      await customFieldsPage.addCustomFieldName(meta.name);
      await customFieldsPage.selectCustomFieldTypeText();
      await customFieldsPage.clickCreateCustomFieldModalButton();
    }
  );

  test(
    'verify custom field creation | Text area (Long text)',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@CUSTOM-FIELDS_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify custom field creation | Text area (Long text)',
        zephyrTestId: '',
        storyId: '',
      });
      const meta = {
        name: `TA - ${DATE_NOW}`,
      };

      await customFieldsPage.clickAddCustomFieldButton();
      await customFieldsPage.verifyOpenedCustomFieldModal();
      await customFieldsPage.addCustomFieldName(meta.name);
      await customFieldsPage.selectCustomFieldTypeTextArea();
      await customFieldsPage.clickCreateCustomFieldModalButton();
    }
  );

  test(
    'verify custom field creation | Number',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@CUSTOM-FIELDS_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify custom field creation | Number',
        zephyrTestId: '',
        storyId: '',
      });
      const meta = {
        name: `Num - ${DATE_NOW}`,
      };

      await customFieldsPage.clickAddCustomFieldButton();
      await customFieldsPage.verifyOpenedCustomFieldModal();
      await customFieldsPage.addCustomFieldName(meta.name);
      await customFieldsPage.selectCustomFieldTypeNumber();
      await customFieldsPage.clickCreateCustomFieldModalButton();
    }
  );

  test(
    'verify custom field creation | Date',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@CUSTOM-FIELDS_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify custom field creation | Date',
        zephyrTestId: '',
        storyId: '',
      });
      const meta = {
        name: `Date - ${DATE_NOW}`,
      };

      await customFieldsPage.clickAddCustomFieldButton();
      await customFieldsPage.verifyOpenedCustomFieldModal();
      await customFieldsPage.addCustomFieldName(meta.name);
      await customFieldsPage.selectCustomFieldTypeDate();
      await customFieldsPage.clickCreateCustomFieldModalButton();
    }
  );

  test(
    'verify custom field creation | Dropdown',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@CUSTOM-FIELDS_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify custom field creation | Dropdown',
        zephyrTestId: '',
        storyId: '',
      });
      const meta = {
        name: `DD - ${DATE_NOW}`,
        options: [`option 1`, `option 2`, `option 3`],
      };

      await customFieldsPage.clickAddCustomFieldButton();
      await customFieldsPage.verifyOpenedCustomFieldModal();
      await customFieldsPage.addCustomFieldName(meta.name);
      await customFieldsPage.selectCustomFieldTypeDD(meta.options);
      await customFieldsPage.clickCreateCustomFieldModalButton();
    }
  );
});
