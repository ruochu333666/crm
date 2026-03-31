import { apiRequest } from "./http";

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role?: "sales" | "manager" | "admin";
    teamId?: number;
  };
}

export interface RegisterParams {
  username: string;
  password: string;
}

export const authApi = {
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "登录失败");
    }

    return response.json();
  },

  register: async (params: RegisterParams): Promise<{ message: string }> => {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "注册失败");
    }

    return response.json();
  },
};
