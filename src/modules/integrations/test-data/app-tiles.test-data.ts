/**
 * Centralized connector IDs for all app tile integrations
 * Add new connector IDs here as they are implemented
 */
export const CONNECTOR_IDS = {
  AIRTABLE: '51a2e31b-af80-4bc6-a1ff-8839f2fb6eee',
  EXPENSIFY: 'e576282c-58b3-423b-8b9f-3d6f9f538ded',
  GITHUB: '9099f0b6-55ee-425b-b790-3231f750e7c7',
  BAMBOOHR: '76108098-da7d-4030-b7c1-ef737e61e5a2',
  SAP_SUCCESSFACTORS: '498f6b36-6f0d-4cf2-b6a7-06c8e5d26b1e',
  UKG_WFM: '460b431c-41f2-4d7e-9610-33892b73336d',
  UKG_PRO: '4e342748-5371-4f02-b21e-86fda7cbde1d',
  GOOGLE_CALENDAR: '86c5fd0a-0137-4618-8aac-ae862e09164d',
  OUTLOOK_CALENDAR: 'e05a33db-46b5-4e17-b230-3c229ee3ce83',
  DOCUSIGN: 'e7926584-1a7b-47a5-b8a1-c59f0701df39',
  DOCEBO: 'db7f4f18-16e7-443b-9d72-ae68d146e854',
  MONDAY_DOT_COM: '46cae9fc-78b9-4f30-916d-ccd6d8eff802',
  WORKDAY: 'af4ed833-9514-466d-a6a5-752f26456adf',
  SALESFORCE: '76108098-da7d-4030-b7c1-ef737e61e5a2',
  FRESHSERVICE: 'e780853b-1806-4f3f-918d-76e004b116a6',
} as const;

/**
 * Tile IDs for specific app tiles
 */
export const TILE_IDS = {
  GITHUB_MY_OPEN_PRS: '8f82cbb1-56a6-4455-80cb-85fcb778fe27',
  GITHUB_PENDING_PR_REVIEWS: '210775b7-9745-455e-9cc4-5653e40211ff',
  EXPENSIFY_REPORT: '82ca87cd-d155-46b5-92db-fcec1caf5f85',
  BAMBOOHR_APPLY_TIMEOFF: 'c4a4221f-fd07-4b9e-bf36-e039eb10bca2',
  BAMBOOHR_DISPLAY_TIMEOFF_BALANCE: 'c49ce6e0-89fc-40ef-9e9b-bd738c93a55a',
  SAP_APPLY_FOR_TIMEOFF: '0fd74213-db63-40d8-bd86-93f69cf47bf3',
  SAP_DISPLAY_TIMEOFF_BALANCE: '8316a4bf-96a3-4c94-8b75-9453809b70c5',
  UKG_WFM_APPLY_FOR_TIMEOFF: '26fb1868-4bd8-4890-85e8-15e52c1ae1a3',
  UKG_WFM_DISPLAY_UPCOMING_SCHEDULE: '584f5919-771c-4282-8ce9-50378f240ad0',
  UKG_PRO_DISPLAY_RECENT_PAYSTUBS: '297398ea-9827-4b94-97a4-82a101446ba9',
  UKG_PRO_DISPLAY_TIMEOFF_BALANCE: 'aca631d6-dd7e-4cae-a174-fa80a01faa5e',
  GOOGLE_CAL_DISPLAY_UPCOMING_EVENTS: 'b260c182-199e-4293-a21e-f5ca976fff36',
  OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS: 'fb854aba-5484-4b72-8caa-28af67a55576',
  DISPLAY_DOCUSIGN_SIGNATURE_REQUESTS: 'c9368b20-00c3-40d7-b08e-20bc48be72ac',
  DISPLAY_LEARNING_COURSES: 'addf843b-06a7-498b-a471-8895fcaf47a7',
  MONDAY_DOT_COM_DISPLAY_TASKS: 'cf77a6cf-ed45-4b69-951a-dfd36d374fba',
  WORKDAY_DISPLAY_PENDING_LEARNING_COURSES: '3580db32-32ad-4d67-b813-e89a10286fbf',
  WORKDAY_APPLY_FOR_TIMEOFF: '61da175c-f777-4456-8512-715e7808b657',
  DISPLAY_TABULAR_REPORT: 'fb9971dd-f266-4c7e-b07e-74726c4f834f',
  FRESHSERVICE_DISPLAY_TICKETS_SUBMITTED_BY_ME: '4c84479e-4460-419c-9765-1a6de4c34c9b',
  FRESHSERVICE_DISPLAY_UNASSIGNED_TICKETS: 'c4008107-200e-41d7-94a2-3b556d87e06f',
} as const;

/**
 * Airtable tile configuration data
 * Centralized constants for consistent testing
 */
export const AIRTABLE_TILE = {
  TILE: 'Airtable',
  APP_NAME: 'Airtable',
  BASE_NAME: 'Content Calendar',
  USER_DEFINED: 'User defined',
  SORT_ORDER: 'Ascending',
  SORT_BY: 'Task name',
  BASE_ID: 'Content Calendar',
  API_BASE_ID: 'appsnmjNzZl1ygUtg',
  TABLE_ID: 'tbl5wWrenoiBW5ZiI',
} as const;

/**
 * Airtable authentication data
 * Centralized authentication constants for testing
 */
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
} as const;

/**
 * Comprehensive app names for all supported integrations
 */
export const APP_NAMES = {
  EXPENSIFY: 'Expensify',
  AIRTABLE: 'Airtable',
  FRESHSERVICE: 'Freshservice',
  GITHUB: 'GitHub',
  BAMBOOHR: 'BambooHR',
  SAP_SUCCESSFACTORS: 'SAPSuccessFactors',
} as const;

/**
 * GitHub URLs for testing
 */
export const REDIRECT_URLS = {
  GITHUB: 'https://github.com/',
  EXPENSIFY: 'https://www.expensify.com/',
  AIRTABLE: 'https://airtable.com/',
  UKG_PRO: 'https://et19.ultipro.com/',
  GOOGLE_CALENDAR: 'https://workspace.google.com/',
  OUTLOOK_CALENDAR: 'https://outlook.office365.com',
  DOCUSIGN: 'https://account-d.docusign.com/',
  UKG_WFM: 'https://kcfn01-cfn08-ath01.cfn.mykronos.com/',
  MONDAY_DOT_COM: 'https://clydenoronha48s-team.monday.com/',
  DOCEBO: 'https://simpplr.docebosaas.com/',
  ASANA: 'https://app.asana.com/',
  GREENHOUSE: 'https://job-boards.greenhouse.io/',
  WORKDAY: 'https://impl.wd12.myworkday.com/',
  WORKDAY_INBOX_TASKS_REPORT:
    'https://impl-services1.wd12.myworkday.com/ccx/service/customreport2/simpplr_dpt1/sgarg/INBOX_TASKS_PER_WORKER',
  WORKDAY_RECENT_PAYSTUBS: 'https://impl.wd12.myworkday.com/simpplr_dpt1/d/task/2997$1475.htmld',
  FRESHSERVICE: 'https://simpplr-908291654763877589.myfreshworks.com',
  SALESFORCE: 'https://odin-int-dev-ed.develop.my.salesforce.com/',
  SALESFORCE_REPORT_ID: '00O5i00000BBQuy',
} as const;

/**
 * GitHub organization names for testing
 */
export const GITHUB_ORGANIZATIONS = {
  SIMPPLR_TEST_ORG: 'simpplr-test-org',
} as const;

/**
 * Expensify authentication data
 */
export const EXPENSIFY_CREDS = {
  USER_ID: 'aa_tushar_roy_simpplr_com',
  USER_SECRET: '1cb6b45720674f10558719c18a17947937fd4723',
} as const;

/**
 * UKG Pro instance URL for testing
 */
export const UKG_PRO_INSTANCE_URL = 'https://et19.ultipro.com/' as const;

/**
 * Status values for different app tiles
 */
export const STATUS_VALUES = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
} as const;

export const TEST_EMAIL = {
  GOOGLE_CALENDAR: 'howard.nelson@simpplr.dev',
  OUTLOOK_CALENDAR: 'howard.nelson@smplrdev.onmicrosoft.com',
};
/**
 * Data values for Docebo app tiles
 */
export const DOCEBO_VALUES = {
  ENROLLMENT_STATUS: 'Enrollment status',
  COURSE_TYPE: 'Course type',
  ENROLLMENT_LEVEL: 'Enrollment level',
  COMPLETED: 'Completed',
  E_LEARNING: 'E-learning',
  STUDENT: 'Student',
} as const;

/**
 * Data values for Expensify app tiles
 */
export const EXPENSIFY_VALUES = {
  WORKSPACE: 'Workspace',
  STATUS: 'Status',
  DURATION: 'Duration',
  PROCESSING: 'Processing',
  APPROVER: 'Srikant G',
  MAX_DAYS: 30,
  WORKSPACE_VALUE: 'Sandbox-R&D',
} as const;
/**
 * Data values for Greenhouse app tiles
 */
export const GREENHOUSE_VALUES = {
  JOB_TYPE: 'Job type',
  ALL: 'All',
  EXTERNAL: 'External',
  INTERNAL: 'Internal',
  JOB_BOARD_TOKEN: 'Job board token',
  JOB_BOARD_TOKEN_VALUE: 'mergeapiintegrationsandbox',
} as const;

export const SERVICE_NOW_VALUES = {
  USER_NAME: 'admin',
  PASSWORD: '0=IPmAxD$x6f',
  CONSUMER_KEY: '3488c64de4b34dd8a6bddf91911aa1fe',
  SECRET_KEY: '^8yo#^&BoQ+*bB,<!Qi04YzxKIZs~5Wa',
  URL: 'https://dev275557.service-now.com',
} as const;

export const GREENHOUSE_CREDS = {
  API_Token: 'Basic N2RlMTdmNzQ3ZjdiZjJhNzNiOTI1ODBiM2I5OTY2NmMtMzo=',
} as const;
