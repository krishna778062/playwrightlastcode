export enum COMMS_PLANNER_FEATURE_TAGS {
  // Add your feature-specific tags here
  // Example: FEATURE_A = '@feature-a',
}

export enum COMMS_PLANNER_SUITE_TAGS {
  // Add your test suite tags here
  // Example: SMOKE = '@smoke',
}

export const COMMS_PLANNER_TEST_TAGS = [
  ...Object.values(COMMS_PLANNER_FEATURE_TAGS),
  ...Object.values(COMMS_PLANNER_SUITE_TAGS),
] as const;

export default COMMS_PLANNER_TEST_TAGS;
