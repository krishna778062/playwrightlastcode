import { CUSTOM_FIELD_TYPES } from '@modules/comms-planner/constants/constant';
import {
  CF_DATE_META,
  CF_DD_META,
  CF_LABEL_META,
  CF_NUMBER_META,
  CF_TEXT_AREA_META,
  CF_TEXT_META,
  CustomField,
} from '@modules/comms-planner/constants/customField';
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
export const editCustomField = async (customFieldsPage: CustomFieldsPage, meta: CustomField) => {
  await customFieldsPage.filterCustomFieldListingByFieldType(meta.type);
  await customFieldsPage.verifyCreatedCustomField(meta.name);
  await customFieldsPage.clickCustomFieldTableAction('Edit', meta.name);

  await customFieldsPage.verifyOpenedCustomFieldEditModal();

  let editMeta: CustomField = CF_LABEL_META.EDIT;

  switch (meta.type) {
    case CUSTOM_FIELD_TYPES.LABEL:
      editMeta = CF_LABEL_META.EDIT;
      await customFieldsPage.deleteAllOptionsOfCustomField();
      await customFieldsPage.selectOptionsForCustomFieldTypeLabel(editMeta.options || []);
      break;

    case CUSTOM_FIELD_TYPES.TEXT:
      editMeta = CF_TEXT_META.EDIT;
      break;

    case CUSTOM_FIELD_TYPES.TEXTAREA:
      editMeta = CF_TEXT_AREA_META.EDIT;
      break;

    case CUSTOM_FIELD_TYPES.NUMBER:
      editMeta = CF_NUMBER_META.EDIT;
      break;

    case CUSTOM_FIELD_TYPES.DATE:
      editMeta = CF_DATE_META.EDIT;
      break;

    case CUSTOM_FIELD_TYPES.DROPDOWN:
      editMeta = CF_DD_META.EDIT;
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

export const createCustomField = async (customFieldsPage: CustomFieldsPage, meta: CustomField) => {
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
  await customFieldsPage.verifyCustomFieldCreationConfirmation();
};
