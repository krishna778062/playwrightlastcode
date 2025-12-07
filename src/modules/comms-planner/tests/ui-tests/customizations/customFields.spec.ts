import {
  CF_DATE_META,
  CF_DD_META,
  CF_LABEL_META,
  CF_NUMBER_META,
  CF_TEXT_AREA_META,
  CF_TEXT_META,
  CustomField,
} from '@modules/comms-planner/constants/customField';
import { test } from '@modules/comms-planner/fixtures/loginFixture';
import {
  createCustomField,
  deleteCustomField,
  editCustomField,
  toggleCustomFieldStatusInListing,
  verifyCustomFieldInListing,
} from '@modules/comms-planner/helpers/customField';
import { CustomFieldsPage } from '@modules/comms-planner/pages/customizations/customFieldsPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('customizations - Custom field', () => {
  let customFieldsPage: CustomFieldsPage;

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
      const meta: CustomField = CF_LABEL_META.CREATE;
      const editMeta: CustomField = CF_LABEL_META.EDIT;

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await editCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, editMeta);
      await deleteCustomField(customFieldsPage, editMeta);
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
      const meta: CustomField = CF_TEXT_META.CREATE;
      const editMeta: CustomField = CF_TEXT_META.EDIT;

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await editCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, editMeta);
      await deleteCustomField(customFieldsPage, editMeta);
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
      const meta: CustomField = CF_TEXT_AREA_META.CREATE;
      const editMeta: CustomField = CF_TEXT_AREA_META.EDIT;

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await editCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, editMeta);
      await deleteCustomField(customFieldsPage, editMeta);
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

      const meta: CustomField = CF_NUMBER_META.CREATE;
      const editMeta: CustomField = CF_NUMBER_META.EDIT;

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await editCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, editMeta);
      await deleteCustomField(customFieldsPage, editMeta);
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

      const meta: CustomField = CF_DATE_META.CREATE;
      const editMeta: CustomField = CF_DATE_META.EDIT;

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await editCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, editMeta);
      await deleteCustomField(customFieldsPage, editMeta);
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

      const meta: CustomField = CF_DD_META.CREATE;
      const editMeta: CustomField = CF_DD_META.EDIT;

      await createCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, meta);
      await toggleCustomFieldStatusInListing(customFieldsPage, meta);
      await editCustomField(customFieldsPage, meta);
      await verifyCustomFieldInListing(customFieldsPage, editMeta);
      await deleteCustomField(customFieldsPage, editMeta);
    }
  );
});
