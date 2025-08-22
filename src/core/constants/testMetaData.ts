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
