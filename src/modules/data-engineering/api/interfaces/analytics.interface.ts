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

// Must Read Status
export interface MustReadStatusData {
  content_code: string;
  site_name: string | null;
  is_must_read: boolean;
  was_must_read: boolean;
  is_must_read_expired: number;
  must_read_audience_type_code: string | null;
  must_read_start_datetime: string | null;
  must_read_end_datetime: string | null;
}

export interface MustReadStatusResponse {
  success: boolean;
  data: MustReadStatusData;
}

// Must Read Counts
export interface MustReadCountsData {
  content_code: string;
  content_title: string | null;
  total_users: number;
  read_users: number;
}

export interface MustReadCountsResponse {
  success: boolean;
  data: MustReadCountsData;
  metadata?: {
    tenantId: string;
    contentId: string;
    count?: number;
    readStatus?: string;
    search?: string;
    timestamp: string;
    [key: string]: any;
  };
}

// Must Read Audience List
export interface MustReadAudienceItem {
  audience_code: string;
  audience_name: string;
  display_name: string;
  audience_rule: string;
  audience_status: string | null;
  audience_type: string;
  description: string | null;
  audience_member_count: number;
}

export interface MustReadAudienceListResponse {
  success: boolean;
  data: MustReadAudienceItem[];
  metadata: {
    tenantId: string;
    contentId: string;
    count: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    timestamp: string;
  };
}

// Must Read User List
export interface MustReadUserListItem {
  user_code: string;
  full_name: string;
  department: string | null;
  profile_image_url_optimized: string | null;
  title: string | null;
  as_read_status: string;
  confirmation_datetime: string | null;
}

export interface MustReadUserListResponse {
  success: boolean;
  data: MustReadUserListItem[];
  metadata: {
    tenantId: string;
    contentId: string;
    readStatus: string;
    search: string;
    count: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    timestamp: string;
  };
}

// Must Read User Count
export interface MustReadUserCountResponse {
  success: boolean;
  data: {
    user_count: number;
  };
  metadata: {
    tenantId: string;
    contentId: string;
    readStatus: string;
    search: string;
    timestamp: string;
  };
}
