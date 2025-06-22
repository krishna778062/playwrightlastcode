export interface User {
  first_name: string;
  last_name: string;
  email: string;
  timezone_id?: number;
  language_id?: number;
  locale_id?: number;
}

export interface SearchUserRecord {
  id: string;
  name: string;
  externalStatus: string;
  externalUserId: string;
  uniqueChatHandle: string;
  createdAt: string;
  type: string;
}

export interface SearchUserResult {
  records: SearchUserRecord[];
  total: number;
  page: number | null;
}

export interface SearchUserResponse {
  status: number;
  message: string;
  responseTimeStamp: number;
  result: SearchUserResult;
}

interface UserRole {
  name: string;
  role_id: string;
}

export interface IdentityUserRecord {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  username: string;
  created_on: string;
  modified_on: string;
  manager_id: string | null;
  phone: string | null;
  mobile: string | null;
  timezone_id: number;
  supported_language_id: number;
  supported_locale_id: number;
  profile_image_url_original: string | null;
  idp_type: string;
  idp: string;
  segment_id: string | null;
  is_mfa_configured: boolean | null;
  external_id: string | null;
  license_type: string;
  extn: string;
  about: string | null;
  pronouns: string | null;
  name_pronunciation: string | null;
  pay_currency: string | null;
  im_zoom: string | null;
  im_skype: string | null;
  im_slack: string | null;
  im_microsoft_team: string | null;
  user_roles: UserRole[];
  roles: string;
  location: string | null;
  isMfaConfigured: boolean | null;
  isFirstLogin: boolean;
}

export interface IdentityUserSearchResult {
  totalCount: number;
  listOfItems: IdentityUserRecord[];
}

export interface IdentityUserSearchResponse {
  status: string;
  result: IdentityUserSearchResult;
}
