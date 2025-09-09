import { Roles } from '@core/constants/roles';

/**
 * Simple user type specifically for platform module testing
 * Only includes the fields that platform tests actually need
 */
export interface PlatformTestUser {
  first_name: string;
  last_name: string;
  username: string;
  emp: string;
  timezone_id?: number;
  language_id?: number;
  locale_id?: number;
}
