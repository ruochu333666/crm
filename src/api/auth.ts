const API_BASE = "http://localhost:5174/api";

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export interface RegisterParams {
  username: string;
  password: string;
}

export const authApi = {
  // 登录
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "登录失败");
    }

    return response.json();
  },

  // 注册
  register: async (params: RegisterParams): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "注册失败");
    }

    return response.json();
  },
};

