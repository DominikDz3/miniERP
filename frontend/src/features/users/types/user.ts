export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  roleName: string;
  enabled: boolean;
  createdAt: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  fullName: string;
  roleName: string;
}

export interface UserUpdateRequest {
  fullName: string;
  roleName: string;
}

export interface PasswordResetRequest {
  newPassword: string;
}

export type RoleName = "ADMIN" | "MANAGER" | "USER";