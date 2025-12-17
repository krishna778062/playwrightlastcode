/**
 * Zod schemas for On-Page Analytics API response validation
 * Includes: Content Engagement metrics
 */

import { z } from 'zod';

/**
 * Schema for content engagement data
 * Validates the engagement metrics returned by the API
 */
export const ContentEngagementDataSchema = z.object({
  total_reactions: z.number(),
  total_comments: z.number(),
  total_replies: z.number(),
  total_shares: z.number(),
  total_favorites: z.number(),
});

/**
 * Schema for content engagement metadata
 * Validates the metadata returned alongside engagement data
 */
export const ContentEngagementMetadataSchema = z.object({
  tenantId: z.string(),
  contentId: z.string(),
  isRestricted: z.boolean(),
  timestamp: z.string(),
});

/**
 * Complete schema for GetContentEngagement API response
 */
export const GetContentEngagementResponseSchema = z.object({
  success: z.boolean(),
  data: ContentEngagementDataSchema,
  metadata: ContentEngagementMetadataSchema,
});

// Type exports
export type ContentEngagementDataSchemaType = z.infer<typeof ContentEngagementDataSchema>;
export type ContentEngagementMetadataSchemaType = z.infer<typeof ContentEngagementMetadataSchema>;
export type GetContentEngagementResponseSchemaType = z.infer<typeof GetContentEngagementResponseSchema>;
