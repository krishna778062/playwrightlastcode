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
}

export interface KnownMeta {
  bugTicket?: string | string[]; // bug ticket from Jira
  zephyrTestId?: string; // test case ID from Zephyr
  bugReportedDate?: string; // date when the bug was reported
  priority?: 'High' | 'Medium' | 'Low'; // priority level for the known failure
  note?: string; // "description of the known failure"
}