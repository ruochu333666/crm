import { Layout } from "antd";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import styles from "./MainLayout.module.less";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.layout}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout className={styles.contentLayout}>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
}
