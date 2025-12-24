export const TEST_FILTER_VALUES = {
  /**
   * App Adoption Dashboard filter values
   */
  APP_ADOPTION: {
    DEPARTMENTS: ['Information Technology', 'New department DUCK DB', 'Payroll', 'Retail', 'Undefined'],
    LOCATIONS: ['Undefined', 'India'],
    COMPANY_NAMES: ['Undefined'],
  },

  /**
   * Social Interaction Dashboard filter values
   */
  SOCIAL_INTERACTION: {
    SEGMENTS: ['USA Operations'],
    DEPARTMENTS: ['CEO', 'Engineering', 'Finance', 'Human Admin', 'Human Resources'],
    LOCATIONS: ['Chicago, IL, US', 'Los Angeles, CA, US', 'San Francisco, CA, US'],
  },

  /**
   * Search Dashboard filter values
   */
  SEARCH: {
    SEGMENTS: ['india'],
    DEPARTMENTS: ['Undefined'],
    LOCATIONS: ['Gurugram, Haryana, India', 'India'],
  },
} as const;
