/**
 * Type definitions for People API responses
 */

export interface TimezoneDetails {
  id: number;
  name: string;
}

export interface PeopleCategory {
  name: string | null;
}

export interface CustomFields {
  customProfileField1: string | null;
  customProfileField2: string | null;
  customProfileField3: string | null;
  customProfileField4: string | null;
  customProfileField5: string | null;
  customProfileField6: string | null;
  customProfileField7: string | null;
  customProfileField8: string | null;
  customProfileField9: string | null;
  customProfileField10: string | null;
  customProfileField11: string | null;
  customProfileField12: string | null;
  customProfileField13: string | null;
  customProfileField14: string | null;
  customProfileField15: string | null;
  customProfileField16: string | null;
  customProfileField17: string | null;
  customProfileField18: string | null;
  customProfileField19: string | null;
  customProfileField20: string | null;
  customProfileField21: string | null;
  customProfileField22: string | null;
  customProfileField23: string | null;
  customProfileField24: string | null;
  customProfileField25: string | null;
}

export interface AssistantDetails {
  // Define structure when available
  [key: string]: any;
}

export interface ManagerDetails {
  // Define structure when available
  [key: string]: any;
}

export interface Person {
  user_id: string;
  firstName: string;
  peopleId: string;
  lastName: string;
  relevancyScore: number;
  hireDate: string;
  email: string;
  mobile: string | null;
  status: string;
  phone: string | null;
  phoneExtension: string | null;
  namePronunciation: string | null;
  timezoneDetails: TimezoneDetails;
  imZoom: string | null;
  imSkype: string | null;
  imMicrosoftTeam: string | null;
  imSlack: string | null;
  profileImageUrlOriginal: string | null;
  signedprofileImageUrlOriginal: string | null;
  about: string | null;
  microsoftTeamsUserId: string | null;
  microsoftTeamsUserName: string | null;
  microsoftTeamsConnectedAs: string | null;
  microsoftTeamsTenantId: string | null;
  slackTeamId: string | null;
  slackUserId: string | null;
  slackConnectedAs: string | null;
  slackTeamName: string | null;
  pronouns: string | null;
  isActive: boolean;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  street: string | null;
  employeeNumber: string | null;
  division: string | null;
  department: string | null;
  companyName: string | null;
  title: string | null;
  isFavorited: boolean | null;
  locale: string;
  isFollowing: boolean;
  assistantDetails: AssistantDetails | null;
  managerDetails: ManagerDetails | null;
  peopleCategory: PeopleCategory;
  businessUnit: string | null;
  userType: string | null;
  custom_fields: CustomFields;
}

export interface PeopleListResult {
  totalRecords: number;
  listOfItems: Person[];
  nextPageToken: number | string | null;
}

export interface PeopleListResponse {
  status: number;
  message: string;
  result: PeopleListResult;
}

/**
 * Request payload for getPeopleList API
 */
export interface PeopleListPayload {
  size: number;
  includePendingActivation: boolean;
  includeTotal: boolean;
  q: string;
}

/**
 * Optional parameters for getPeopleList requests
 */
export interface PeopleListOptions {
  size?: number;
  includePendingActivation?: boolean;
  includeTotal?: boolean;
  q?: string;
}

/**
 * Simplified person interface for common use cases
 */
export interface SimplePerson {
  id: string;
  peopleId: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string | null;
  department?: string | null;
  isActive: boolean;
  location?: string | null;
}

/**
 * Person search filters
 */
export interface PersonSearchFilters {
  department?: string;
  division?: string;
  location?: string;
  status?: 'Active' | 'Inactive';
  isActive?: boolean;
}

/**
 * Helper type for person full name
 */
export type PersonFullName = {
  firstName: string;
  lastName: string;
  fullName: string;
};

/**
 * Contact information interface
 */
export interface PersonContactInfo {
  email: string;
  phone?: string | null;
  mobile?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

/**
 * Professional information interface
 */
export interface PersonProfessionalInfo {
  title?: string | null;
  department?: string | null;
  division?: string | null;
  companyName?: string | null;
  employeeNumber?: string | null;
  hireDate: string;
  managerDetails?: ManagerDetails | null;
}

/**
 * Social/Communication information interface
 */
export interface PersonSocialInfo {
  imZoom?: string | null;
  imSkype?: string | null;
  imMicrosoftTeam?: string | null;
  imSlack?: string | null;
  microsoftTeamsUserId?: string | null;
  slackUserId?: string | null;
}

/**
 * Type guard to check if a person is active
 */
export const isActivePerson = (person: Person): boolean => {
  return person.isActive && person.status === 'Active';
};

/**
 * Type guard to check if a person has contact information
 */
export const hasContactInfo = (person: Person): boolean => {
  return !!(person.email || person.phone || person.mobile);
};

/**
 * Utility type for person sorting options
 */
export type PersonSortBy = 'firstName' | 'lastName' | 'email' | 'title' | 'department' | 'hireDate' | 'relevancyScore';

/**
 * Utility type for person status
 */
export type PersonStatus = 'Active' | 'Inactive' | 'Pending';
