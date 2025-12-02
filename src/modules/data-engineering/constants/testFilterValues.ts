export const TEST_FILTER_VALUES = {
  /**
   * App Adoption Dashboard filter values
   */
  APP_ADOPTION: {
    DEPARTMENTS: ['Information Technology', 'New department DUCK DB', 'Payroll', 'Retail', 'Undefined'],
    LOCATIONS: ['Undefined', 'New city DUCK DB, New state DUCK DB, New country DUCK DB', 'India'],
    COMPANY_NAMES: ['Undefined'],
  },

  /**
   * Social Interaction Dashboard filter values
   */
  SOCIAL_INTERACTION: {
    SEGMENTS: ['india'],
    DEPARTMENTS: ['New department DUCK DB'],
    LOCATIONS: ['Kolkata, West Bengal, India'],
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
