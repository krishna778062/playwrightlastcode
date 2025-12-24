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
    SEGMENTS: ['india'],
    DEPARTMENTS: ['Information Analysis', 'Information Technology'],
    LOCATIONS: ['Kolkata, WEST BENGAL, India'],
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
