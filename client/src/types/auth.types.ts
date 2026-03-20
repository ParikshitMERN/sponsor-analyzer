export interface User {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  role: "admin" | "company";
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
