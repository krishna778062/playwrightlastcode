import { CUSTOM_FIELD_TYPES } from '@modules/comms-planner/constants/constant';
import { CustomFieldsPage } from '@modules/comms-planner/pages/customizations/customFieldsPage';

/**
 * Delete the custom field created
 */
export const deleteCustomField = async (
  customFieldsPage: CustomFieldsPage,
  meta: {
    type: string;
    name: string;
  }
) => {
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
  await customFieldsPage.verifyCreatedCustomField(meta.name);
  await customFieldsPage.clickCustomFieldTableAction('Delete', meta.name);
  await customFieldsPage.verifyDeleteConfirmationModal();
  await customFieldsPage.clickDeleteConfirmationModalPrimaryButton();
};

export const verifyCustomFieldInListing = async (
  customFieldsPage: CustomFieldsPage,
  meta: {
    type: string;
    name: string;
    options?: string[];
  }
) => {
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
  await customFieldsPage.verifyCreatedCustomField(meta.name);
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
};

export const createCustomField = async (
  customFieldsPage: CustomFieldsPage,
  meta: {
    type: string;
    name: string;
    options?: string[];
  }
) => {
  await customFieldsPage.clickAddCustomFieldButton();
  await customFieldsPage.verifyOpenedCustomFieldModal();
  await customFieldsPage.addCustomFieldName(meta.name);

  switch (meta.type) {
    case CUSTOM_FIELD_TYPES.LABEL:
      await customFieldsPage.selectCustomFieldTypeLabel(meta.options || []);
      break;

    case CUSTOM_FIELD_TYPES.TEXT:
      await customFieldsPage.selectCustomFieldTypeText();
      break;

    case CUSTOM_FIELD_TYPES.TEXTAREA:
      await customFieldsPage.selectCustomFieldTypeTextArea();
      break;

    case CUSTOM_FIELD_TYPES.NUMBER:
      await customFieldsPage.selectCustomFieldTypeNumber();
      break;

    case CUSTOM_FIELD_TYPES.DATE:
      await customFieldsPage.selectCustomFieldTypeDate();
      break;

    case CUSTOM_FIELD_TYPES.DROPDOWN:
      await customFieldsPage.selectCustomFieldTypeDD(meta.options || []);
      break;
  }

  await customFieldsPage.selectCustomFieldLocation();
  await customFieldsPage.clickCreateCustomFieldModalButton();
};
