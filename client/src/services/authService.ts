import api from "./api";
import {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "../types/auth.types";

export const loginUser = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  const { data } = await api.post<{ success: boolean; data: AuthResponse }>(
    "/auth/login",
    payload,
  );
  return data.data;
};

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const { data } = await api.post<{ success: boolean; data: AuthResponse }>(
    "/auth/register",
    payload,
  );
  return data.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
