import { TestInfo } from '@playwright/test';

import { getStoryUrl, getZephyrTestCaseUrl } from '../constants/testInfraConfig';
import { TestMetadata } from '../constants/testMetaData';

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

  // Handle known failure metadata if present
  if (metadata.isKnownFailure) {
    // Add main known_failure annotation to clearly indicate this is a known failure
    testInfo.annotations.push({
      type: 'known_failure',
      description: 'This test is marked as a known failure',
    });

    // Add bug ticket as separate annotation if present
    if (metadata.bugTicket) {
      testInfo.annotations.push({
        type: 'bug_ticket',
        description: getZephyrTestCaseUrl(metadata.bugTicket),
      });
    }

    // Add bug reported date as separate annotation if present
    if (metadata.bugReportedDate) {
      testInfo.annotations.push({
        type: 'bug_reported_date',
        description: metadata.bugReportedDate,
      });
    }

    // Add priority as separate annotation if present
    if (metadata.knownFailurePriority) {
      testInfo.annotations.push({
        type: 'known_failure_priority',
        description: metadata.knownFailurePriority,
      });
    }

    // Add note as separate annotation if present
    if (metadata.knownFailureNote) {
      testInfo.annotations.push({
        type: 'known_failure_note',
        description: metadata.knownFailureNote,
      });
    }
  }
}

/**
 * This function is used to tag the test case with the metadata.
 * @param testInfo - The test info object.
 * @param metadata - The metadata object.
 */
export function tagTest(testInfo: TestInfo, metadata: TestMetadata) {
  addTestMetadata(testInfo, metadata);
}

/**TODO
 * We should add function which can modify the test case title
 * to add the story tag so that in reporter, it becomes
 * easy to filter the test cases by story.
 */
