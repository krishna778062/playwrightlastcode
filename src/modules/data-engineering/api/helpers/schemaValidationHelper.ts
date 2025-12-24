/**
 * Schema Validation Helper
 * Provides utility functions for validating API responses against Zod schemas
 */

import { expect } from '@playwright/test';
import { z } from 'zod';

/** Issue type from Zod error */
type ZodIssueType = z.core.$ZodIssue;

/**
 * Result of schema validation
 */
export interface SchemaValidationResult<T> {
  success: boolean;
  data?: T;
  issues?: ZodIssueType[];
  errorMessage?: string;
}

/**
 * Validates API response data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns SchemaValidationResult with success status and parsed data or errors
 */
export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): SchemaValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    issues: result.error.issues,
    errorMessage: formatZodIssues(result.error.issues),
  };
}

/**
 * Validates API response and throws assertion error if validation fails
 * Useful for direct integration with Playwright tests
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @param message - Optional custom error message prefix
 */
export function assertValidSchema<T>(schema: z.ZodType<T>, data: unknown, message?: string): T {
  const result = validateSchema(schema, data);

  if (!result.success) {
    const errorPrefix = message ? `${message}: ` : 'Schema validation failed: ';
    throw new Error(`${errorPrefix}${result.errorMessage}`);
  }

  return result.data as T;
}

/**
 * Validates API response using Playwright's expect for better test integration
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @param description - Description for the expect assertion
 */
export function expectValidSchema<T>(schema: z.ZodType<T>, data: unknown, description?: string): T {
  const result = validateSchema(schema, data);

  expect(result.success, description ?? `Schema validation: ${result.errorMessage}`).toBe(true);

  return result.data as T;
}

/**
 * Formats Zod issues into a human-readable string
 * @param issues - The ZodIssue array to format
 * @returns Formatted error string
 */
function formatZodIssues(issues: ZodIssueType[]): string {
  return issues
    .map(issue => {
      const path = issue.path.join('.');
      return `[${path || 'root'}] ${issue.message}`;
    })
    .join('; ');
}

/**
 * Safe parse that returns the result without throwing
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Zod safe parse result
 */
export function safeParse<T>(schema: z.ZodType<T>, data: unknown) {
  return schema.safeParse(data);
}
