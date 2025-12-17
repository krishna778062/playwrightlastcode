import { TestPriority } from './testPriority';
import { TestSuite } from './testSuite';
import { TestGroupType } from './testType';

export interface TestMetadata {
  suite?: TestSuite;
  type?: TestGroupType;
  priority?: TestPriority;
  description?: string;
  zephyrTestId?: string | string[]; //suppports both single zephyr id or list of zephyr ids
  customTags?: string[];
  storyId?: string;
  isKnownFailure?: boolean; // boolean flag to denote if this is a known failure
  bugTicket?: string | string[]; // bug ticket from Jira for known failures
  bugReportedDate?: string; // date when the bug was reported
  knownFailurePriority?: 'High' | 'Medium' | 'Low'; // priority level for the known failure
  knownFailureNote?: string; // description of the known failure
}
