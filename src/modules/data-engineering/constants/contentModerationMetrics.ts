/**
 * Constants for Content Moderation Analytics dashboard metrics
 * Used for UI element identification and validation
 */
export const CONTENT_MODERATION_METRICS = {
  TOTAL_SOURCES: {
    title: 'Total sources',
    subtitle: 'All feed posts and comments reviewed in this period',
    kpiLabel: 'Total items',
  },
  DETECTED: {
    title: 'Detected',
    subtitle: 'Total count of feed posts and comments automatically flagged by moderation rules',
    kpiLabelTemplate: '{percentage} of total items',
  },
  REPORTED: {
    title: 'Reported',
    subtitle: 'Total count of feed posts and comments flagged by users for review',
    kpiLabelTemplate: '{percentage} of total items',
  },
  REMOVED: {
    title: 'Removed',
    subtitle: 'Total count of feed posts and comments taken down after moderation decisions',
    kpiLabelTemplate: '{percentage} of total items',
  },
} as const;

/**
 * Generates the kpiLabel by replacing the {percentage} placeholder with the actual value
 * @param template - The kpiLabelTemplate string with {percentage} placeholder
 * @param percentage - The percentage value to insert (e.g., "3.2%")
 * @returns The formatted kpiLabel string
 */
export function formatKpiLabel(template: string, percentage: string): string {
  return template.replace('{percentage}', percentage);
}
