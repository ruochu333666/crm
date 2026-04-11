/**
 * 演示/开发用：侧边栏一键切换账号（与 seed 默认密码一致）。
 * 生产环境若不需要，可在 Sidebar 中改为读取 VITE_QUICK_SWITCH 再渲染。
 */
export interface QuickSwitchAccount {
  key: string;
  label: string;
  username: string;
  password: string;
  roleHint: string;
}

export const QUICK_SWITCH_ACCOUNTS: QuickSwitchAccount[] = [
  {
    key: "demo",
    label: "销售 demo",
    username: "demo",
    password: "demo123",
    roleHint: "销售",
  },
  {
    key: "manager",
    label: "经理 manager",
    username: "manager",
    password: "demo123",
    roleHint: "经理",
  },
];
