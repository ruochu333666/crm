import {
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  Timeline,
  Card,
} from "antd";
import {
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import styles from "./CustomerDetail.module.less";

interface CustomerDetailProps {
  customer: any;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  if (!customer) return null;

  const statusMap = {
    active: { color: "green", text: "活跃" },
    potential: { color: "blue", text: "潜在" },
    inactive: { color: "red", text: "非活跃" },
  };

  const statusConfig = statusMap[customer.status as keyof typeof statusMap] || {
    color: "default",
    text: customer.status,
  };

  return (
    <div className={styles.detailContainer}>
      {/* 基本信息 */}
      <Card title="基本信息" className={styles.infoCard}>
        <Descriptions column={2} size="middle">
          <Descriptions.Item label="客户名称" span={2}>
            <strong>{customer.name}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="公司名称">
            {customer.company}
          </Descriptions.Item>

          <Descriptions.Item label="客户状态">
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="联系人">
            {customer.contact}
          </Descriptions.Item>

          <Descriptions.Item label="联系电话">
            <Space>
              <PhoneOutlined />
              {customer.phone}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="邮箱地址">
            <Space>
              <MailOutlined />
              {customer.email}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="所属地区">
            <Space>
              <EnvironmentOutlined />
              {customer.region}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="创建时间">
            {customer.createTime}
          </Descriptions.Item>

          <Descriptions.Item label="最后联系">
            {customer.lastContact}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      {/* 联系记录 */}
      <Card title="联系记录" className={styles.contactCard}>
        <Timeline>
          <Timeline.Item color="green">
            <div className={styles.timelineItem}>
              <strong>电话沟通</strong>
              <p>与客户电话沟通产品需求，客户表示有兴趣</p>
              <span className={styles.timelineTime}>2024-01-20 14:30</span>
            </div>
          </Timeline.Item>

          <Timeline.Item color="blue">
            <div className={styles.timelineItem}>
              <strong>邮件发送</strong>
              <p>发送产品介绍资料给客户</p>
              <span className={styles.timelineTime}>2024-01-18 10:15</span>
            </div>
          </Timeline.Item>

          <Timeline.Item color="orange">
            <div className={styles.timelineItem}>
              <strong>首次接触</strong>
              <p>通过展会认识客户，初步了解需求</p>
              <span className={styles.timelineTime}>2024-01-15 09:00</span>
            </div>
          </Timeline.Item>
        </Timeline>
      </Card>

      <Divider />

      {/* 相关订单 */}
      <Card title="相关订单" className={styles.orderCard}>
        <div className={styles.orderList}>
          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <strong>订单 #ORD-2024-001</strong>
              <p>产品A × 100件</p>
              <span className={styles.orderStatus}>已完成</span>
            </div>
            <div className={styles.orderAmount}>
              <span className={styles.amount}>¥50,000</span>
              <span className={styles.orderDate}>2024-01-10</span>
            </div>
          </div>

          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <strong>订单 #ORD-2024-002</strong>
              <p>产品B × 50件</p>
              <span className={styles.orderStatus}>进行中</span>
            </div>
            <div className={styles.orderAmount}>
              <span className={styles.amount}>¥25,000</span>
              <span className={styles.orderDate}>2024-01-15</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <Space>
          <Button type="primary" icon={<EditOutlined />}>
            编辑客户
          </Button>
          <Button>添加联系记录</Button>
          <Button>创建订单</Button>
        </Space>
      </div>
    </div>
  );
}
