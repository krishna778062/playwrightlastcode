import type { EnvironmentKey } from '../config/dataEngineeringConfig';

/**
 * Filter values structure for each dashboard type
 */
interface FilterValues {
  APP_ADOPTION: {
    DEPARTMENTS: string[];
    LOCATIONS: string[];
    COMPANY_NAMES: string[];
  };
  SOCIAL_INTERACTION: {
    SEGMENTS: string[];
    DEPARTMENTS: string[];
    LOCATIONS: string[];
  };
  SEARCH: {
    SEGMENTS: string[];
    DEPARTMENTS: string[];
    LOCATIONS: string[];
  };
}

/**
 * Environment-specific filter values
 * Currently supports: test and qa environments only
 * Other environments will fallback to test environment values
 */
const filterValuesByEnvironment: Partial<Record<EnvironmentKey, FilterValues>> = {
  test: {
    /**
     * App Adoption Dashboard filter values for test environment
     */
    APP_ADOPTION: {
      DEPARTMENTS: ['Human Resources', 'Operations'],
      LOCATIONS: ['Texas, US', 'San Jose, CA, US'],
      COMPANY_NAMES: ['Undefined'],
    },

    /**
     * Social Interaction Dashboard filter values for test environment
     */
    SOCIAL_INTERACTION: {
      SEGMENTS: ['Retail', 'USA Operations'],
      DEPARTMENTS: ['CEO', 'Engineering', 'Finance', 'Information Technology', 'Human Resources'],
      LOCATIONS: ['Austin, Texas, US', 'Chicago, IL, US', 'Los Angeles, CA, US', 'Denver, CO, USA'],
    },

    /**
     * Search Dashboard filter values for test environment
     */
    SEARCH: {
      SEGMENTS: ['USA Operations', 'Manufacturing'],
      DEPARTMENTS: ['Human Resources', 'Sales & Marketing', 'Operations', 'Engineering', 'Manufacturing'],
      LOCATIONS: ['Chicago, IL, US', 'Philadelphia, PA, US', 'San Francisco, CA, US'],
    },
  },
  qa: {
    /**
     * App Adoption Dashboard filter values for qa environment
     * TODO: Update with qa-specific values
     */
    APP_ADOPTION: {
      DEPARTMENTS: ['New department DUCK DB', 'Undefined', 'Information Technology'],
      LOCATIONS: ['Kolkata, West Bengal, India', 'Gurugram, Haryana, India', 'Undefined'],
      COMPANY_NAMES: ['Undefined'],
    },

    /**
     * Social Interaction Dashboard filter values for qa environment
     * TODO: Update with qa-specific values
     */
    SOCIAL_INTERACTION: {
      SEGMENTS: ['india'],
      DEPARTMENTS: ['New department DUCK DB', 'Test'],
      LOCATIONS: ['Kolkata, West Bengal, India', 'Gurugram, Haryana, India'],
    },

    /**
     * Search Dashboard filter values for qa environment
     * TODO: Update with qa-specific values
     */
    SEARCH: {
      SEGMENTS: ['india', 'New segment DUCK DB'],
      DEPARTMENTS: ['Undefined', 'QA DEPT'],
      LOCATIONS: ['Gurugram, Haryana, India', 'India'],
    },
  },
  // Only test and qa environments are currently supported
};

/**
 * Get current environment from TEST_ENV
 */
function getCurrentEnvironment(): EnvironmentKey {
  const testEnv = process.env.TEST_ENV || 'qa';

  const validEnvs: EnvironmentKey[] = ['qa', 'test', 'uat', 'uatAU', 'uatCA', 'uatEU', 'prodUS'];
  if (!validEnvs.includes(testEnv as EnvironmentKey)) {
    throw new Error(
      `Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: ${validEnvs.join(', ')}\n` +
        `Example: TEST_ENV=qa npm run test:de`
    );
  }

  return testEnv as EnvironmentKey;
}

/**
 * Get filter values for the current environment
 * Falls back to test environment values if current environment is not configured
 */
function getFilterValuesForCurrentEnvironment(): FilterValues {
  const environment = getCurrentEnvironment();
  const filterValues = filterValuesByEnvironment[environment];

  if (!filterValues) {
    // Fallback to test environment if current environment is not configured
    const testValues = filterValuesByEnvironment.test;
    if (!testValues) {
      throw new Error(
        `Filter values not found for environment '${environment}' and no fallback test values available.`
      );
    }
    console.warn(
      `Filter values not configured for environment '${environment}', falling back to test environment values.`
    );
    return testValues;
  }

  return filterValues;
}

/**
 * Export filter values for the current environment
 * This maintains backward compatibility with existing code
 */
export const TEST_FILTER_VALUES: FilterValues = getFilterValuesForCurrentEnvironment();
