import { TestInfo } from '@playwright/test';

import { getStoryUrl, getZephyrTestCaseUrl } from '../constants/testInfraConfig';
import { KnownMeta, TestMetadata } from '../constants/testMetaData';

/**
 * This function is used to add the test metadata to the test case.
 * @param testInfo - The test info object.
 * @param metadata - The metadata object.
 */
export function addTestMetadata(testInfo: TestInfo, metadata: TestMetadata) {
  // Add non-filterable metadata as annotations
  testInfo.annotations.push(
    {
      type: 'zephyrId',
      description: metadata.zephyrTestId ? getZephyrTestCaseUrl(metadata.zephyrTestId) : '',
    },
    { type: 'description', description: metadata.description },
    { type: 'storyId', description: metadata.storyId ? getStoryUrl(metadata.storyId) : '' }
  );
}

/**
 * This function is used to tag the test case with the metadata.
 * @param testInfo - The test info object.
 * @param metadata - The metadata object.
 */
export function tagTest(testInfo: TestInfo, metadata: TestMetadata) {
  addTestMetadata(testInfo, metadata);
}

/**
 * Formats the known failure metadata into a string for the annotation
 * @param meta - The metadata to format
 * @returns Formatted string
 */
function formatKnownFailureDescription(meta: KnownMeta): string {
  const parts: string[] = [];

  if (meta.bugTicket) {
    parts.push(`BugTicket: ${getZephyrTestCaseUrl(meta.bugTicket)}`);
  }

  if (meta.zephyrTestId) {
    parts.push(`ZephyrTestId: ${getZephyrTestCaseUrl(meta.zephyrTestId)}`);
  }

  if (meta.bugReportedDate) {
    parts.push(`BugReportedDate: ${meta.bugReportedDate}`);
  }

  if (meta.priority) {
    parts.push(`Priority: ${meta.priority}`);
  }

  if (meta.note) {
    parts.push(`Note: ${meta.note}`);
  }

  return parts.join('\n');
}

/**
 * Adds known failure annotation to the test
 * @param testInfo - The test info object
 * @param meta - The known failure metadata
 */
export function knownFailure(testInfo: TestInfo, meta: KnownMeta) {
  // add known failure annotation
  testInfo.annotations.push({
    type: 'known_failure',
    description: formatKnownFailureDescription(meta),
  });
}

/**TODO
 * We should add function which can modify the test case title
 * to add the story tag so that in reporter, it becomes
 * easy to filter the test cases by story.
 */
