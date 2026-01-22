export const TEST_FILTER_VALUES = {
  /**
   * App Adoption Dashboard filter values
   */
  APP_ADOPTION: {
    DEPARTMENTS: ['Human Resources', 'Operations'],
    LOCATIONS: ['Texas, US', 'San Jose, CA, US'],
    COMPANY_NAMES: ['Undefined'],
  },

  /**
   * Social Interaction Dashboard filter values
   */
  SOCIAL_INTERACTION: {
    SEGMENTS: ['Retail', 'USA Operations'],
    DEPARTMENTS: ['CEO', 'Engineering', 'Finance', 'Information Technology', 'Human Resources'],
    LOCATIONS: ['Austin, Texas, US', 'Chicago, IL, US', 'Los Angeles, CA, US', 'Denver, CO, USA'],
  },

  /**
   * Search Dashboard filter values
   */
  SEARCH: {
    SEGMENTS: ['USA Operations', 'Manufacturing'],
    DEPARTMENTS: ['Human Resources', 'Sales & Marketing', 'Operations', 'Engineering', 'Manufacturing'],
    LOCATIONS: ['Chicago, IL, US', 'Philadelphia, PA, US', 'San Francisco, CA, US'],
  },
} as const;
