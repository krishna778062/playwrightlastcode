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
