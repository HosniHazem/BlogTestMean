export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  WRITER = "AUTHOR",
  READER = "READER",
}

export interface User {
  _id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}
