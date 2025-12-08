import { CUSTOM_FIELD_TYPES } from '@modules/comms-planner/constants/constant';
import { CUSTOM_FIELD_META, CustomField, CustomFieldConfig } from '@modules/comms-planner/constants/customField';
import { CustomFieldsPage } from '@modules/comms-planner/pages/customizations/customFieldsPage';

/**
 * Delete the custom field created
 */
export const deleteCustomField = async (customFieldsPage: CustomFieldsPage, meta: CustomField) => {
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
  await customFieldsPage.verifyCreatedCustomField(meta.name);
  await customFieldsPage.clickCustomFieldTableAction('Delete', meta.name);
  await customFieldsPage.verifyDeleteConfirmationModal();
  await customFieldsPage.clickDeleteConfirmationModalPrimaryButton();
};

/**
 * Edit the custom field created
 */
export const editCustomField = async (
  customFieldsPage: CustomFieldsPage,
  meta: CustomField,
  config: CustomFieldConfig
) => {
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
  await customFieldsPage.verifyCreatedCustomField(meta.name);
  await customFieldsPage.clickCustomFieldTableAction('Edit', meta.name);

  await customFieldsPage.verifyOpenedCustomFieldEditModal();

  await customFieldsPage.verifyMaxCharacterCustomFieldNameValidation('edit');
  await customFieldsPage.verifyEmptyCustomFieldNameValidation('edit');

  const editMeta: CustomField = CUSTOM_FIELD_META.get(meta.type)!.EDIT;

  switch (meta.type) {
    case CUSTOM_FIELD_TYPES.LABEL:
      await customFieldsPage.deleteAllOptionsOfCustomField();
      await customFieldsPage.selectOptionsForCustomFieldTypeLabel(editMeta.options || []);
      break;

    case CUSTOM_FIELD_TYPES.DROPDOWN:
      await customFieldsPage.deleteAllOptionsOfCustomField();
      await customFieldsPage.selectOptionsForCustomFieldTypeDD(editMeta.options || []);
      break;
  }

  await customFieldsPage.addCustomFieldName(editMeta.name);
  await customFieldsPage.clickEditCustomFieldModalSaveButton();
  await customFieldsPage.verifyCustomFieldUpdateConfirmation();
};

export const verifyCustomFieldInListing = async (customFieldsPage: CustomFieldsPage, meta: CustomField) => {
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
  await customFieldsPage.verifyCreatedCustomField(meta.name);
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
};

export const toggleCustomFieldStatusInListing = async (customFieldsPage: CustomFieldsPage, meta: CustomField) => {
  await customFieldsPage.toggleAndVerifyCreatedCustomFieldStatus(meta.name, false);
  await customFieldsPage.toggleAndVerifyCreatedCustomFieldStatus(meta.name, true);
};

export const createCustomField = async (
  customFieldsPage: CustomFieldsPage,
  meta: CustomField,
  config: CustomFieldConfig
) => {
  await customFieldsPage.clickAddCustomFieldButton();
  await customFieldsPage.verifyOpenedCustomFieldModal();
  await customFieldsPage.verifyMaxCharacterCustomFieldNameValidation('create');
  await customFieldsPage.verifyEmptyCustomFieldNameValidation('create');
  await customFieldsPage.addCustomFieldName(meta.name);

  await customFieldsPage.verifyEmptyCustomFieldTypeValidation('create');

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

  if (config.addLocation) {
    await customFieldsPage.selectCustomFieldLocation();
  }

  await customFieldsPage.clickCreateCustomFieldModalButton();
  await customFieldsPage.verifyCustomFieldCreationConfirmation();
};

export const runCustomFieldLifecycle = async (
  customFieldsPage: CustomFieldsPage,
  meta: CustomField,
  editMeta: CustomField,
  config: CustomFieldConfig
) => {
  await createCustomField(customFieldsPage, meta, config);
  await verifyCustomFieldInListing(customFieldsPage, meta);
  await toggleCustomFieldStatusInListing(customFieldsPage, meta);

  await editCustomField(customFieldsPage, meta, config);

  await verifyCustomFieldInListing(customFieldsPage, editMeta);
  await deleteCustomField(customFieldsPage, editMeta);
};
