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
  APP_NAME: 'Airtable',
  BASE_NAME: 'Content Calendar',
  USER_DEFINED: 'User defined',
  PERSONALIZE_SORT_BY: 'Task name',
  PERSONALIZE_SORT_ORDER: 'Ascending',
  BASE_ID: 'Content Calendar',
  API_BASE_ID: 'appsnmjNzZl1ygUtg',
  TABLE_ID: 'tbl5wWrenoiBW5ZiI',
};

export const AIRTABLE_AUTH_DATA = {
  CODE_CHALLENGE_METHOD: 'S256',
  CLIENT_ID: '21b6baa1-399f-4d8c-aa64-b63bceee744b',
  CLIENT_SECRET: 'B0VuUeyXVKzo0ZZqkoqvjMWXCk18o5hw',
  AUTH_URL: 'https://airtable.com/oauth2/v1/authorize?scope=schema.bases:read%20data.records:read',
  TOKEN_URL: 'https://airtable.com/oauth2/v1/token',
  TOKEN_HEADERS:
    'Authorization:Basic MjFiNmJhYTEtMzk5Zi00ZDhjLWFhNjQtYjYzYmNlZWU3NDRiOjY1MjgzMzJmMWIyZWFiOWMxYjkyY2M1ZDkzNzJmMTMxYmRhZTJkNDYzZDg2MGU4Mzk5NWM2YjQ4ZmJhYmI3MmE=',
  BASE_URL: 'https://api.airtable.com',
  AUTH_CREDENTIALS: {
    EMAIL: 'howard.nelson@simpplr.dev',
    PASSWORD: 'Simpplr@1220167',
  },
};

export const CONNECTOR_IDS = {
  AIRTABLE: '51a2e31b-af80-4bc6-a1ff-8839f2fb6eee',
} as const;
