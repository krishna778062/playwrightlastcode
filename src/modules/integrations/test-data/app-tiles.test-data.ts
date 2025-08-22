import { faker } from '@faker-js/faker';

export const generateUniqueTileNames = () => {
  const randomSuffix = faker.string.alphanumeric(6);
  const timestamp = Date.now();
  return {
    AIRTABLE_TILE_TITLE: `Display content calendar tasks ${randomSuffix}_${timestamp}`,
    AIRTABLE_UPDATED_TILE_TITLE: `Display content calendar tasks ${randomSuffix}_${timestamp}_Updated`,
  };
};

export const AIRTABLE_TILE_DATA = {
  TILE: 'Airtable',
  BASE_NAME: 'Content Calendar',
  USER_DEFINED: 'User defined',
  PERSONALIZE_SORT_BY: 'Task name',
  PERSONALIZE_SORT_ORDER: 'Ascending',
  BASE_ID: 'Content Calendar',
  API_BASE_ID: 'appsnmjNzZl1ygUtg',
  TABLE_ID: 'tbl5wWrenoiBW5ZiI',
};

export const CONNECTOR_IDS = {
  AIRTABLE: '51a2e31b-af80-4bc6-a1ff-8839f2fb6eee',
} as const;
