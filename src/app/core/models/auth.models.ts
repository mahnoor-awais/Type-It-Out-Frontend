export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  token: string;
}
