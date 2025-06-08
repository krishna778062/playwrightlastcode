import { APIRequestContext } from '@playwright/test';

// Custom API Response Types that extend Playwright's base types
export interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

// Base response structure for our API endpoints
export interface BaseApiResponse {
  status: number;
  message: string;
  responseTimeStamp: number;
}

// Type for API Client constructor
export type ApiClientConstructor<T> = new (context: APIRequestContext, baseUrl?: string) => T;
