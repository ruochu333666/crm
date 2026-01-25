import { Layout, Menu, Avatar, Typography, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import styles from "./Sidebar.module.less";

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "首页",
      onClick: () => navigate("/home"),
    },
    {
      key: "customer",
      icon: <TeamOutlined />,
      label: "客户管理",
      onClick: () => navigate("/customer"),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人中心",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "设置",
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={styles.sidebar}
      width={280}
      collapsedWidth={80}
    >
      {/* 顶部用户信息区域 */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <Avatar
            size={collapsed ? 32 : 40}
            icon={<UserOutlined />}
            className={styles.avatar}
          />
          {!collapsed && (
            <div className={styles.userDetails}>
              <Text className={styles.username}>{user?.username}</Text>
              <Text type="secondary" className={styles.userId}>
                ID: {user?.id}
              </Text>
            </div>
          )}
        </div>

        {/* 折叠按钮 */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          className={styles.collapseBtn}
        />
      </div>

      {/* 导航菜单 */}
      <Menu
        mode="inline"
        defaultSelectedKeys={["home"]}
        className={styles.menu}
        items={menuItems}
      />

      {/* 底部退出按钮 */}
      <div className={styles.bottomSection}>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className={styles.logoutBtn}
        >
          {!collapsed && "退出登录"}
        </Button>
      </div>
    </Sider>
  );
}
