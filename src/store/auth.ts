import { create } from "zustand";

interface User {
  id: number;
  username: string;
  role?: "sales" | "manager" | "admin";
  teamId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  initialized: false,

  login: (token: string, user: User) => {
    console.log("🔐 用户登录:", {
      user,
      token: token.substring(0, 10) + "...",
    });

    // 存储到 localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    set({
      token,
      user,
      isAuthenticated: true,
      initialized: true,
    });

    console.log("✅ 登录状态已保存到 localStorage");
  },

  logout: () => {
    // 清除 localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      initialized: true,
    });
  },

  initializeAuth: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    console.log("🔍 初始化认证状态:", { token: !!token, userStr: !!userStr });

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("✅ 恢复登录状态:", {
          user,
          token: token.substring(0, 10) + "...",
        });
        set({
          token,
          user,
          isAuthenticated: true,
          initialized: true,
        });
      } catch (error) {
        console.log("❌ 解析用户数据失败:", error);
        // 清除无效数据
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          initialized: true,
        });
      }
    } else {
      set({ initialized: true });
    }
  },
}));
