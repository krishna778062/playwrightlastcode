import { CUSTOM_FIELD_TYPES } from '@modules/comms-planner/constants/constant';

export interface CustomField {
  type: string;
  name: string;
  options?: string[];
}

const DATE_NOW: string = Date.now().toString().slice(-6);

export const CF_LABEL_META = {
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
};

export const CF_TEXT_META = {
  CREATE: {
    name: `Text - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXT,
  },
  EDIT: {
    name: `ed-Text - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXT,
  },
};

export const CF_TEXT_AREA_META = {
  CREATE: {
    name: `TA - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXTAREA,
  },
  EDIT: {
    name: `ed-TA - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.TEXTAREA,
  },
};

export const CF_NUMBER_META = {
  CREATE: {
    name: `Num - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.NUMBER,
  },
  EDIT: {
    name: `ed-Num - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.NUMBER,
  },
};

export const CF_DATE_META = {
  CREATE: {
    name: `Date - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.DATE,
  },
  EDIT: {
    name: `ed-Date - ${DATE_NOW}`,
    type: CUSTOM_FIELD_TYPES.DATE,
  },
};

export const CF_DD_META = {
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
};
