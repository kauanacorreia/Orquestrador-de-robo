export type AccessRole =
  | 'ADMIN'
  | 'OPERATOR';

export type AccessStatus =
  | 'ACTIVE'
  | 'INACTIVE';

export interface AccessUser {
  id: string;
  name: string;
  email: string;
  role: AccessRole;
  status: AccessStatus;
  last_login_at: string | null;
  created_at: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: AccessRole;
}

export interface UpdatePermissionsPayload {
  role: AccessRole;
}