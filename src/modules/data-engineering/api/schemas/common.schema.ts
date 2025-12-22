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
