export enum EmployeeListeningSuiteTags {
  AWARENESS_CHECK = '@awarenessCheck',
  CREATE_AWARENESS_CHECK = '@createAwarenessCheck',
  EDIT_AWARENESS_CHECK = '@editAwarenessCheck',
  REMOVE_AWARENESS_CHECK = '@removeAwarenessCheck',
  AWARENESS_REPORT = '@awarenessReport',
}

export enum EmployeeListeningFeatureTags {
  MUST_READ = '@must-read',
  QUESTION_MANAGEMENT = '@question-management',
  ANSWER_VALIDATION = '@answer-validation',
  USER_PARTICIPATION = '@user-participation',
  REPORT_VIEWING = '@report-viewing',
  PERMISSION_CONTROL = '@permission-control',
}

export const EmployeeListeningTestTags = [
  ...Object.values(EmployeeListeningSuiteTags),
  ...Object.values(EmployeeListeningFeatureTags),
] as const;

export default EmployeeListeningTestTags;
