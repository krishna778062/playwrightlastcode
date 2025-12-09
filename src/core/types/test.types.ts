import { Roles } from '@core/constants/roles';

import { User } from './user.type';

export interface TestUser extends User {
  userId: string;
  fullName: string;
  role: Roles;
}

export interface UserCredentials {
  email: string;
  password?: string;
}

export type TestOptions = { stepInfo?: string };
