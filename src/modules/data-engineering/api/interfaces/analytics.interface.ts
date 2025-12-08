/**
 * Interface definitions for Analytics APIs (DuckDB-powered)
 * Includes: Segments, Departments, Locations, User Categories, Company Names, Divisions, Batch Run Details
 */

// Common metadata structure for all filter APIs
export interface FilterMetadata {
  tenantId: string;
  timestamp: string;
  count: number;
  status: 'active' | 'all';
}

export interface FilterRequest {
  status?: 'active' | 'all';
  page?: number;
  pageSize?: number;
}

// Segments
export interface Segment {
  segment_code: string;
  segment_name: string;
}

export interface GetSegmentsResponse {
  success: boolean;
  data: Segment[];
  metadata: FilterMetadata;
}

// Departments
export interface Department {
  department: string;
}

export interface GetDepartmentsResponse {
  success: boolean;
  data: Department[];
  metadata: FilterMetadata;
}

// Locations
export interface Location {
  location: string;
}

export interface GetLocationsResponse {
  success: boolean;
  data: Location[];
  metadata: FilterMetadata;
}

// User Categories
export interface UserCategory {
  user_category_code: string;
  user_category_name: string;
}

export interface GetUserCategoriesResponse {
  success: boolean;
  data: UserCategory[];
  metadata: FilterMetadata;
}

// Company Names
export interface CompanyName {
  company_name: string;
}

export interface GetCompanyNamesResponse {
  success: boolean;
  data: CompanyName[];
  metadata: FilterMetadata;
}

// Divisions
export interface Division {
  division: string;
}

export interface GetDivisionsResponse {
  success: boolean;
  data: Division[];
  metadata: FilterMetadata;
}

// Batch Run Details
export interface BatchRunDetail {
  batch_name: string;
  latest_process_end_time: string;
  dag_interval_in_seconds: string;
}

export interface BatchRunMetadata {
  tenantId: string;
  timestamp: string;
  count: number;
}

export interface GetBatchRunDetailsResponse {
  success: boolean;
  data: BatchRunDetail[];
  metadata: BatchRunMetadata;
}

// Content Engagement
export interface ContentEngagementData {
  total_reactions: number;
  total_comments: number;
  total_replies: number;
  total_shares: number;
  total_favorites: number;
}

export interface ContentEngagementMetadata {
  tenantId: string;
  contentId: string;
  isRestricted: boolean;
  timestamp: string;
}

export interface GetContentEngagementResponse {
  success: boolean;
  data: ContentEngagementData;
  metadata: ContentEngagementMetadata;
}
