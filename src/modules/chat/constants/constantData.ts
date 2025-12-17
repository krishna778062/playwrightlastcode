export const CONSTANT_DATA = {
  USER_NAME_1: process.env.END_USER_PROFILENAME || '',
  USER_NAME_2: process.env.END_USER2_PROFILENAME || '',
  COMMON_GROUP_NAME: 'direct-message',
  GROUP_NAME: 'all-company',
} as const;

export default CONSTANT_DATA;
