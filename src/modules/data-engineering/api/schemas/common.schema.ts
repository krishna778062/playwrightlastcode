/**
 * Zod schemas for common Analytics API response validation
 * Includes: Segments, Departments, Locations, User Categories, Company Names, Divisions, Batch Run Details
 */

import { z } from 'zod';

/**
 * Common metadata schema for filter APIs
 */
export const FilterMetadataSchema = z.object({
  tenantId: z.string(),
  timestamp: z.string(),
  count: z.number(),
  status: z.enum(['active', 'all']),
});

/**
 * Segment schema and response
 */
export const SegmentSchema = z.object({
  segment_code: z.string(),
  segment_name: z.string(),
});

export const GetSegmentsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SegmentSchema),
  metadata: FilterMetadataSchema,
});

/**
 * Department schema and response
 */
export const DepartmentSchema = z.object({
  department: z.string(),
});

export const GetDepartmentsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DepartmentSchema),
  metadata: FilterMetadataSchema,
});

/**
 * Location schema and response
 */
export const LocationSchema = z.object({
  location: z.string(),
});

export const GetLocationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(LocationSchema),
  metadata: FilterMetadataSchema,
});

/**
 * User Category schema and response
 */
export const UserCategorySchema = z.object({
  user_category_code: z.string(),
  user_category_name: z.string(),
});

export const GetUserCategoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserCategorySchema),
  metadata: FilterMetadataSchema,
});

/**
 * Company Name schema and response
 */
export const CompanyNameSchema = z.object({
  company_name: z.string(),
});

export const GetCompanyNamesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CompanyNameSchema),
  metadata: FilterMetadataSchema,
});

/**
 * Division schema and response
 */
export const DivisionSchema = z.object({
  division: z.string(),
});

export const GetDivisionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DivisionSchema),
  metadata: FilterMetadataSchema,
});

/**
 * Batch Run Details schemas
 */
export const BatchRunDetailSchema = z.object({
  batch_name: z.string(),
  latest_process_end_time: z.string(),
  dag_interval_in_seconds: z.string(),
});

export const BatchRunMetadataSchema = z.object({
  tenantId: z.string(),
  timestamp: z.string(),
  count: z.number(),
});

export const GetBatchRunDetailsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BatchRunDetailSchema),
  metadata: BatchRunMetadataSchema,
});

/**
 * Must Read Status schema and response
 */
export const MustReadStatusSchema = z.object({
  content_code: z.string(),
  site_name: z.string().nullable(),
  is_must_read: z.boolean(),
  was_must_read: z.boolean(),
  is_must_read_expired: z.number(),
  must_read_audience_type_code: z.string().nullable(),
  must_read_start_datetime: z.string().nullable(),
  must_read_end_datetime: z.string().nullable(),
});

export const GetMustReadStatusResponseSchema = z.object({
  success: z.boolean(),
  data: MustReadStatusSchema,
  metadata: z.any().optional(),
});

/**
 * Must Read Counts schema and response
 */
export const MustReadCountsSchema = z.object({
  content_code: z.string(),
  content_title: z.string().nullable(),
  total_users: z.number(),
  read_users: z.number(),
});

export const GetMustReadCountsResponseSchema = z.object({
  success: z.boolean(),
  data: MustReadCountsSchema,
  metadata: z
    .object({
      tenantId: z.string(),
      contentId: z.string(),
      count: z.number().optional(),
      readStatus: z.string().optional(),
      search: z.string().optional(),
      timestamp: z.string(),
    })
    .passthrough()
    .optional(),
});

/**
 * Must Read Audience List schema and response
 */
export const MustReadAudienceItemSchema = z.object({
  audience_code: z.string(),
  audience_name: z.string(),
  display_name: z.string(),
  audience_rule: z.string(),
  audience_status: z.string().nullable(),
  audience_type: z.string(),
  description: z.string().nullable(),
  audience_member_count: z.number(),
});

export const GetMustReadAudienceListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MustReadAudienceItemSchema),
  metadata: z.object({
    tenantId: z.string(),
    contentId: z.string(),
    count: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
    timestamp: z.string(),
  }),
});

/**
 * Must Read User List schema and response
 */
export const MustReadUserListItemSchema = z.object({
  user_code: z.string(),
  full_name: z.string(),
  department: z.string().nullable(),
  profile_image_url_optimized: z.string().nullable(),
  title: z.string().nullable(),
  as_read_status: z.string(),
  confirmation_datetime: z.string().nullable(),
});

export const GetMustReadUserListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MustReadUserListItemSchema),
  metadata: z.object({
    tenantId: z.string(),
    contentId: z.string(),
    readStatus: z.string(),
    search: z.string(),
    count: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
    timestamp: z.string(),
  }),
});

/**
 * Must Read User Count schema and response
 */
export const MustReadUserCountSchema = z.object({
  user_count: z.number(),
});

export const GetMustReadUserCountResponseSchema = z.object({
  success: z.boolean(),
  data: MustReadUserCountSchema,
  metadata: z.object({
    tenantId: z.string(),
    contentId: z.string(),
    readStatus: z.string(),
    search: z.string(),
    timestamp: z.string(),
  }),
});

// Type exports
export type FilterMetadataSchemaType = z.infer<typeof FilterMetadataSchema>;
export type SegmentSchemaType = z.infer<typeof SegmentSchema>;
export type GetSegmentsResponseSchemaType = z.infer<typeof GetSegmentsResponseSchema>;
export type DepartmentSchemaType = z.infer<typeof DepartmentSchema>;
export type GetDepartmentsResponseSchemaType = z.infer<typeof GetDepartmentsResponseSchema>;
export type LocationSchemaType = z.infer<typeof LocationSchema>;
export type GetLocationsResponseSchemaType = z.infer<typeof GetLocationsResponseSchema>;
export type UserCategorySchemaType = z.infer<typeof UserCategorySchema>;
export type GetUserCategoriesResponseSchemaType = z.infer<typeof GetUserCategoriesResponseSchema>;
export type CompanyNameSchemaType = z.infer<typeof CompanyNameSchema>;
export type GetCompanyNamesResponseSchemaType = z.infer<typeof GetCompanyNamesResponseSchema>;
export type DivisionSchemaType = z.infer<typeof DivisionSchema>;
export type GetDivisionsResponseSchemaType = z.infer<typeof GetDivisionsResponseSchema>;
export type BatchRunDetailSchemaType = z.infer<typeof BatchRunDetailSchema>;
export type GetBatchRunDetailsResponseSchemaType = z.infer<typeof GetBatchRunDetailsResponseSchema>;
export type MustReadStatusSchemaType = z.infer<typeof MustReadStatusSchema>;
export type GetMustReadStatusResponseSchemaType = z.infer<typeof GetMustReadStatusResponseSchema>;
export type MustReadCountsSchemaType = z.infer<typeof MustReadCountsSchema>;
export type GetMustReadCountsResponseSchemaType = z.infer<typeof GetMustReadCountsResponseSchema>;
export type MustReadAudienceItemSchemaType = z.infer<typeof MustReadAudienceItemSchema>;
export type GetMustReadAudienceListResponseSchemaType = z.infer<typeof GetMustReadAudienceListResponseSchema>;
export type MustReadUserListItemSchemaType = z.infer<typeof MustReadUserListItemSchema>;
export type GetMustReadUserListResponseSchemaType = z.infer<typeof GetMustReadUserListResponseSchema>;
export type MustReadUserCountSchemaType = z.infer<typeof MustReadUserCountSchema>;
export type GetMustReadUserCountResponseSchemaType = z.infer<typeof GetMustReadUserCountResponseSchema>;
