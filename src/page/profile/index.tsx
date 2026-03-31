import { Card, Typography } from "antd";
import { MainLayout } from "../../components/MainLayout";
import { useAuthStore } from "../../store/auth";
import styles from "./index.module.less";

const { Title, Paragraph } = Typography;

function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <MainLayout>
      <div className={styles.wrap}>
        <Title level={3} className={styles.pageTitle}>
          个人中心
        </Title>
        <Card className={styles.card}>
          <Paragraph>
            <strong>用户名：</strong>
            {user?.username ?? "—"}
          </Paragraph>
          <Paragraph>
            <strong>用户 ID：</strong>
            {user?.id ?? "—"}
          </Paragraph>
          <Paragraph type="secondary">
            更多资料与头像等功能可在此页后续扩展。
          </Paragraph>
        </Card>
      </div>
    </MainLayout>
  );
}

export default ProfilePage;
