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
    DEPARTMENTS: ['Undefined'],
    LOCATIONS: ['Gurugram, Haryana, India', 'India'],
  },

  /**
   * People Dashboard filter values
   * Note: People dashboard typically doesn't use filters in custom period tests
   */
  PEOPLE: {
    // Add filter values here if needed in the future
  },
} as const;
