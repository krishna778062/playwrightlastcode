export enum EMPLOYEE_LISTENING_FEATURE_TAGS {}
// Add your feature-specific tags here
// Example: FEATURE_A = '@feature-a',

export enum EMPLOYEE_LISTENING_SUITE_TAGS {}
// Add your test suite tags here
// Example: SMOKE = '@smoke',

export const EMPLOYEE_LISTENING_TEST_TAGS = [
  ...Object.values(EMPLOYEE_LISTENING_FEATURE_TAGS),
  ...Object.values(EMPLOYEE_LISTENING_SUITE_TAGS),
] as const;

export default EMPLOYEE_LISTENING_TEST_TAGS;
