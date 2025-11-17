/**
 * Interface for poll form configuration
 * Provides comprehensive options for creating, editing, or regenerating polls
 */
export interface PollForm {
  /** AI prompt text for poll generation */
  userPrompt?: string;

  /** Index of quick prompt to select (0-based) */
  quickPrompt?: number;

  /** Whether to click the generate button */
  generateButton?: boolean;

  /** Whether to regenerate the poll */
  regenerate?: boolean;

  /** Custom poll question text */
  pollQuestion?: string;

  /** Array of poll options (includes automatic option addition logic) */
  pollOptions?: string[];

  /** Whether to click Next button */
  nextButton?: boolean;

  /** Whether to click Back button (modal back navigation) */
  modalBackButton?: boolean;

  /** Array of target audience names to select. Use ['All Organization'] for all org toggle */
  selectTargetAudience?: string[];

  /** Participation window option */
  participationWindow?: {
    /** Option from dropdown: '1 day' | '2 days' | '1 week' | '2 weeks' | 'Select date' */
    option: '1 day' | '2 days' | '1 week' | '2 weeks' | 'Select date';
    /** Custom end date (required when option is 'Select date') */
    customEndDate?: Date;
  };

  /** Allow multiple options toggle state */
  allowMultipleOptionsToggle?: boolean;

  /** Keep responses confidential toggle state */
  keepResponsesConfidentialToggle?: boolean;

  /** Show results after participation toggle state */
  showResultsAfterParticipationToggle?: boolean;

  /** Show results before participation toggle state (requires showResultsAfterParticipation to be true) */
  showResultsBeforeParticipationToggle?: boolean;

  /** Whether to save as draft */
  saveDraftButton?: boolean;

  /** Whether to post the poll */
  postButton?: boolean;
}

/**
 * Options for poll operations
 */
export interface PollOperationOptions {
  /** Whether to skip initial navigation to create poll page */
  skipNavigation?: boolean;

  /** Whether to verify each step */
  verifySteps?: boolean;
}
