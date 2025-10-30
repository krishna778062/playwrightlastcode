export enum EmployeeListeningSuiteTags {
  AWARENESS_CHECK = '@awarenessCheck',
  CREATE_AWARENESS_CHECK = '@createAwarenessCheck',
  EDIT_AWARENESS_CHECK = '@editAwarenessCheck',
  REMOVE_AWARENESS_CHECK = '@removeAwarenessCheck',
  AWARENESS_REPORT = '@awarenessReport',
  POLLS = '@polls',
  POLLS_MANAGEMENT = '@polls-management',
  AI_POLLS = '@ai-polls',
}

export enum EmployeeListeningFeatureTags {
  MUST_READ = '@must-read',
  QUESTION_MANAGEMENT = '@question-management',
  ANSWER_VALIDATION = '@answer-validation',
  USER_PARTICIPATION = '@user-participation',
  REPORT_VIEWING = '@report-viewing',
  PERMISSION_CONTROL = '@permission-control',
  POLLS_DISPLAY = '@polls-display',
  POLLS_CREATE = '@polls-create',
  POLLS_SEARCH = '@polls-search',
  POLLS_ENABLE_DISABLE = '@polls-enable-disable',
  POLLS_PAGE_VALIDATION = '@polls-page-validation',
}

export const EmployeeListeningTestTags = [
  ...Object.values(EmployeeListeningSuiteTags),
  ...Object.values(EmployeeListeningFeatureTags),
] as const;

export default EmployeeListeningTestTags;
