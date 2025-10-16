import type { TestInfo } from '@playwright/test';

//import { getBugTicketUrl } from '../constants/testInfraConfig';

type KnownMeta = {
  bugTicket?: string | string[]; // bug ticket from Jira
  zephyrTestId?: string; // test case ID from Zephyr
  bugReportedDate?: string; // date when the bug was reported
  priority?: 'High' | 'Medium' | 'Low'; // priority level for the known failure
  note?: string; // "description of the known failure"
};

/**
 * Formats the known failure metadata into a string for the annotation
 * @param meta - The metadata to format
 * @returns Formatted string
 */
function formatKnownFailureDescription(meta: KnownMeta): string {
  const parts: string[] = [];

  if (meta.bugTicket) {
    const ticketUrls = `https://simpplr.atlassian.net/browse/${meta.bugTicket}`;
    parts.push(`BugTicket: ${ticketUrls}`);
  }

  if (meta.zephyrTestId) {
    const zephyrUrl = `https://simpplr.atlassian.net/browse/${meta.zephyrTestId}`;
    parts.push(`ZephyrTestId: ${zephyrUrl}`);
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

export function knownFailure(testInfo: TestInfo, meta: KnownMeta) {
  // add known failure annotation
  testInfo.annotations.push({
    type: 'known_failure',
    description: formatKnownFailureDescription(meta),
  });
}

export type { KnownMeta };
