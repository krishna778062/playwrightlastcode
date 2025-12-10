import { CUSTOM_FIELD_TYPES } from '@modules/comms-planner/constants/constant';

export interface CustomField {
  type: string;
  name: string;
  options?: string[];
}

export interface CustomFieldConfig {
  addLocation?: boolean;
}

const DATE_NOW: string = Date.now().toString().slice(-6);

export const MAX_CUSTOM_FIELD_NAME_LENGTH = 100;
export const CUSTOM_FIELD_NAME_MORE_THAN_X_CHARACTERS = 'a'.repeat(101);

export const CUSTOM_FIELD_META: Map<
  string,
  {
    CREATE: CustomField;
    EDIT: CustomField;
  }
> = new Map();

CUSTOM_FIELD_META.set(CUSTOM_FIELD_TYPES.LABEL, {
  CREATE: {
    name: `Label | ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.LABEL,
    options: [`option 1`, `option 2`, `option 3`],
  },
  EDIT: {
    name: `ed-Label | ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.LABEL,
    options: [`option 1`],
  },
});

CUSTOM_FIELD_META.set(CUSTOM_FIELD_TYPES.TEXT, {
  CREATE: {
    name: `Text - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXT,
  },
  EDIT: {
    name: `ed-Text - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXT,
  },
});

CUSTOM_FIELD_META.set(CUSTOM_FIELD_TYPES.TEXTAREA, {
  CREATE: {
    name: `TA - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXTAREA,
  },
  EDIT: {
    name: `ed-TA - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXTAREA,
  },
});

CUSTOM_FIELD_META.set(CUSTOM_FIELD_TYPES.NUMBER, {
  CREATE: {
    name: `Num - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.NUMBER,
  },
  EDIT: {
    name: `ed-Num - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.NUMBER,
  },
});

CUSTOM_FIELD_META.set(CUSTOM_FIELD_TYPES.DATE, {
  CREATE: {
    name: `Date - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.DATE,
  },
  EDIT: {
    name: `ed-Date - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.DATE,
  },
});

CUSTOM_FIELD_META.set(CUSTOM_FIELD_TYPES.DROPDOWN, {
  CREATE: {
    name: `DD - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.DROPDOWN,
    options: [`option 1`, `option 2`, `option 3`],
  },
  EDIT: {
    name: `ed-DD - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.DROPDOWN,
    options: [`option 1`],
  },
});
