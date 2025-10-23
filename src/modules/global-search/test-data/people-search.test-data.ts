/**
 * Test data for people search functionality in global search
 */
export const PEOPLE_SEARCH_TEST_DATA = {
  searchTerm: 'Search User',
  firstName: 'Search',
  lastName: 'User',
  label: 'People',

  /**
   * Fields to update for the user
   */
  updateFields: {
    mobile: '5425616784',
    phone: '1234567890',
    jobTitle: 'Test Engineer',
    department: 'Testing QA',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    location: 'Bengaluru, Karnataka, India',
  },

  /**
   * Expertise data
   */
  expertise: {
    name: `Automation_${Math.floor(Math.random() * 90000) + 10000}`, // Unique expertise name with 5 digits
  },

  /**
   * People filter names
   */
  peopleFilters: {
    department: 'Department',
    location: 'Location',
    expertise: 'Expertise',
  },

  /**
   * Org Chart configuration test data
   */
  orgChart: {
    enabled: { orgChartEnabled: true },
    disabled: { orgChartEnabled: false },
    tooltipText: 'View in org chart',
  },

  /**
   * Field configuration test data for people fields
   */
  fieldConfiguration: {
    /**
     * Field names to configure for testing
     */
    fieldsToTest: {
      Department: 'department',
      City: 'city',
      State: 'state',
      Country: 'country_name',
    },

    /**
     * Helper function to create enable payload for a single field
     * @param fieldData - The field data from GET request
     * @returns Field object with is_displayable set to true
     */
    createEnablePayload: (fieldData: any) => ({
      ...fieldData,
      is_displayable: true,
    }),

    /**
     * Helper function to create disable payload for a single field
     * @param fieldData - The field data from GET request
     * @returns Field object with is_displayable set to false
     */
    createDisablePayload: (fieldData: any) => ({
      ...fieldData,
      is_displayable: false,
    }),
  },

  /**
   * Function to create complete update payload
   */
  createUpdatePayload: (currentUserData: any, updateFields: any) => ({
    personal_info: {
      ...currentUserData.personal_info,
      mobile: updateFields.mobile,
      phone: updateFields.phone,
    },
    work_info: {
      department: updateFields.department,
      start_date: currentUserData.work_info.start_date,
      title: updateFields.jobTitle,
    },
    address: {
      ...currentUserData.address,
      city: updateFields.city,
      state: updateFields.state,
      country_name: updateFields.country,
    },
    role_id: currentUserData.role_id,
    additional_role_id: currentUserData.additional_role_id,
  }),
};
