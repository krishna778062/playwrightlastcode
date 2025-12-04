import { CUSTOM_FIELD_TYPES } from '@modules/comms-planner/constants/constant';
import { test } from '@modules/comms-planner/fixtures/loginFixture';
import {
  createCustomField,
  deleteCustomField,
  toggleCustomFieldStatusInListing,
  verifyCustomFieldInListing,
} from '@modules/comms-planner/helpers/customField';
import { CustomFieldsPage } from '@modules/comms-planner/pages/customizations/customFieldsPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('customizations - Custom field', () => {
  let customFieldsPage: CustomFieldsPage;
  const DATE_NOW: string = Date.now().toString().slice(-6);

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
        type: CUSTOM_FIELD_TYPES.LABEL,
        options: [`option 1`, `option 2`, `option 3`],
      };

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await deleteCustomField(customFieldsPage, meta);
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
        type: CUSTOM_FIELD_TYPES.TEXT,
      };

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await deleteCustomField(customFieldsPage, meta);
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
        type: CUSTOM_FIELD_TYPES.TEXTAREA,
      };

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await deleteCustomField(customFieldsPage, meta);
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
        type: CUSTOM_FIELD_TYPES.NUMBER,
      };

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await deleteCustomField(customFieldsPage, meta);
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
        type: CUSTOM_FIELD_TYPES.DATE,
      };

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await deleteCustomField(customFieldsPage, meta);
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
        type: CUSTOM_FIELD_TYPES.DROPDOWN,
        options: [`option 1`, `option 2`, `option 3`],
      };

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await deleteCustomField(customFieldsPage, meta);
    }
  );
});
