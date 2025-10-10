/**
 * Test data for people search functionality in global search
 */
export const PEOPLE_SEARCH_TEST_DATA = {
  searchTerm: 'Search User',
  firstName: 'Search',
  lastName: 'User',

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
