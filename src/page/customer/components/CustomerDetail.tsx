import {
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  Timeline,
  Card,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  message,
} from "antd";
import {
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import type { Customer } from "../../../api/types";
import type { FollowupRecord } from "../../../api/types";
import { followupsApi } from "../../../api/followups";
import styles from "./CustomerDetail.module.less";

interface CustomerDetailProps {
  customer: Customer | null;
}

interface CreateFollowupFormValues {
  method: "phone" | "email" | "meeting" | "im" | "other";
  content: string;
  nextFollowUpAt?: Dayjs;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  const [followups, setFollowups] = useState<FollowupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadFollowups = async (customerId: number) => {
    try {
      setLoading(true);
      const res = await followupsApi.getByCustomer(customerId);
      setFollowups(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载跟进记录失败";
      console.error("[CustomerDetail] 加载跟进记录失败:", error);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!customer?.id) {
      setFollowups([]);
      return;
    }
    void loadFollowups(customer.id);
  }, [customer?.id]);

  if (!customer) return null;

  const handleCreateFollowup = async (values: CreateFollowupFormValues) => {
    if (!customer.id) return;
    try {
      setSubmitting(true);
      await followupsApi.create({
        customerId: customer.id,
        method: values.method,
        content: values.content,
        nextFollowUpAt: values.nextFollowUpAt
          ? values.nextFollowUpAt.toISOString()
          : null,
      });
      message.success("新增跟进记录成功");
      setOpenCreateModal(false);
      form.resetFields();
      await loadFollowups(customer.id);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "新增跟进记录失败";
      console.error("[CustomerDetail] 新增跟进记录失败:", error);
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

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
            {customer.created_at
              ? String(customer.created_at).replace("T", " ").slice(0, 19)
              : "—"}
          </Descriptions.Item>

          <Descriptions.Item label="最后更新">
            {customer.updated_at
              ? String(customer.updated_at).replace("T", " ").slice(0, 19)
              : "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      {/* 联系记录 */}
      <Card
        title="联系记录"
        className={styles.contactCard}
        extra={
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreateModal(true)}
          >
            新增跟进
          </Button>
        }
      >
        {followups.length === 0 ? (
          <div>{loading ? "加载中..." : "暂无跟进记录"}</div>
        ) : (
          <Timeline>
            {followups.map((item) => (
              <Timeline.Item key={item.id} color="blue">
                <div className={styles.timelineItem}>
                  <strong>{item.method.toUpperCase()}</strong>
                  <p>{item.content}</p>
                  <span className={styles.timelineTime}>
                    记录时间：
                    {String(item.created_at).replace("T", " ").slice(0, 19)}
                  </span>
                  {item.next_follow_up_at ? (
                    <span className={styles.timelineTime}>
                      下次跟进：
                      {String(item.next_follow_up_at)
                        .replace("T", " ")
                        .slice(0, 19)}
                    </span>
                  ) : null}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
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
          <Button onClick={() => setOpenCreateModal(true)}>添加联系记录</Button>
          <Button>创建订单</Button>
        </Space>
      </div>

      <Modal
        title="新增跟进记录"
        open={openCreateModal}
        onCancel={() => setOpenCreateModal(false)}
        onOk={() => void form.submit()}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values: CreateFollowupFormValues) => void handleCreateFollowup(values)}
          initialValues={{ method: "phone" }}
        >
          <Form.Item
            label="跟进方式"
            name="method"
            rules={[{ required: true, message: "请选择跟进方式" }]}
          >
            <Select
              options={[
                { label: "电话", value: "phone" },
                { label: "邮件", value: "email" },
                { label: "面谈", value: "meeting" },
                { label: "即时通讯", value: "im" },
                { label: "其他", value: "other" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="跟进内容"
            name="content"
            rules={[{ required: true, message: "请输入跟进内容" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入本次沟通要点、客户反馈等" />
          </Form.Item>
          <Form.Item label="下次跟进时间" name="nextFollowUpAt">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              placeholder="可选，用于生成待办提醒"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
