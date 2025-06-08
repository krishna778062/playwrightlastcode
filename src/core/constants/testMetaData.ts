import { TestPriority } from './testPriority';
import { TestSuite } from './testSuite';
import { TestGroupType } from './testType';

export interface TestMetadata {
  suite?: TestSuite;
  type?: TestGroupType;
  priority?: TestPriority;
  description?: string;
  zephyrTestId?: string;
  customTags?: string[];
  storyId?: string;
}
