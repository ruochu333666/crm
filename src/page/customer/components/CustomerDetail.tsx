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
import { aiApi } from "../../../api/ai";
import { ordersApi } from "../../../api/orders";
import type { Order } from "../../../api/types";
import {
  OrderFormModal,
  ORDER_STATUS_OPTIONS,
  type OrderFormModalValues,
} from "../../../components/OrderFormModal";
import {
  orderFormToCreateBody,
  orderFormToPatchBody,
} from "../../../utils/orderFormPayload";
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
  const [aiVisible, setAiVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{
    summary: string;
    nextAction: string;
    talkTrack: string;
    riskLevel: "low" | "medium" | "high";
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderSaving, setOrderSaving] = useState(false);

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

  const loadOrders = async (customerId: number) => {
    try {
      setOrdersLoading(true);
      const res = await ordersApi.getList({
        customerId,
        page: 1,
        pageSize: 100,
      });
      setOrders(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载订单失败";
      console.error("[CustomerDetail] 加载订单失败:", error);
      message.error(errMsg);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!customer?.id) {
      setFollowups([]);
      setOrders([]);
      return;
    }
    void loadFollowups(customer.id);
    void loadOrders(customer.id);
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

  const handleLoadAIAdvice = async () => {
    if (!customer.id) return;
    try {
      setAiLoading(true);
      const res = await aiApi.getCustomerNextStep(customer.id);
      setAiAdvice(res.data);
      setAiVisible(true);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "获取AI建议失败";
      console.error("[CustomerDetail] 获取AI建议失败:", error);
      message.error(errMsg);
    } finally {
      setAiLoading(false);
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

  const orderStatusLabel = (s: string) =>
    ORDER_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;

  const handleSaveOrder = async (values: OrderFormModalValues) => {
    if (!customer.id) return;
    try {
      setOrderSaving(true);
      if (editingOrder) {
        await ordersApi.patch(editingOrder.id, orderFormToPatchBody(values));
        message.success("订单已更新");
      } else {
        await ordersApi.create(orderFormToCreateBody(values));
        message.success("订单已创建");
      }
      setOrderModalOpen(false);
      setEditingOrder(null);
      await loadOrders(customer.id);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "保存订单失败";
      console.error("[CustomerDetail] 保存订单失败:", error);
      message.error(errMsg);
    } finally {
      setOrderSaving(false);
    }
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
      <Card
        title="相关订单"
        className={styles.orderCard}
        extra={
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingOrder(null);
              setOrderModalOpen(true);
            }}
          >
            新建订单
          </Button>
        }
      >
        {ordersLoading ? (
          <div>加载订单中...</div>
        ) : orders.length === 0 ? (
          <div>暂无订单，可点击「新建订单」或下方「创建订单」录入。</div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((o) => (
              <div key={o.id} className={styles.orderItem}>
                <div className={styles.orderInfo}>
                  <strong>{o.order_no}</strong>
                  <p>{o.product_summary}</p>
                  <Space size="small" wrap>
                    <span className={styles.orderStatus}>
                      {orderStatusLabel(o.status)}
                    </span>
                    {o.logistics_no ? (
                      <span className={styles.timelineTime}>
                        物流：{o.logistics_no}
                      </span>
                    ) : null}
                  </Space>
                </div>
                <div className={styles.orderAmount}>
                  <span className={styles.amount}>
                    {o.currency} {Number(o.amount).toLocaleString()}
                  </span>
                  <span className={styles.orderDate}>
                    {o.ordered_at
                      ? String(o.ordered_at).replace("T", " ").slice(0, 10)
                      : String(o.created_at).replace("T", " ").slice(0, 10)}
                  </span>
                  <div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setEditingOrder(o);
                        setOrderModalOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <Space>
          <Button type="primary" icon={<EditOutlined />}>
            编辑客户
          </Button>
          <Button onClick={() => setOpenCreateModal(true)}>添加联系记录</Button>
          <Button onClick={() => void handleLoadAIAdvice()} loading={aiLoading}>
            AI下一步建议
          </Button>
          <Button
            onClick={() => {
              setEditingOrder(null);
              setOrderModalOpen(true);
            }}
          >
            创建订单
          </Button>
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

      <OrderFormModal
        open={orderModalOpen}
        title={editingOrder ? "编辑订单" : "新建订单"}
        confirmLoading={orderSaving}
        customers={[customer]}
        lockCustomerId={customer.id}
        editingOrder={editingOrder}
        onCancel={() => {
          setOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onSubmit={(v) => handleSaveOrder(v)}
      />

      <Modal
        title="AI 下一步跟进建议"
        open={aiVisible}
        onCancel={() => setAiVisible(false)}
        footer={null}
      >
        {aiAdvice ? (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <strong>客户现状总结</strong>
              <p>{aiAdvice.summary}</p>
            </div>
            <div>
              <strong>建议下一步动作</strong>
              <p>{aiAdvice.nextAction}</p>
            </div>
            <div>
              <strong>推荐跟进话术</strong>
              <p>{aiAdvice.talkTrack}</p>
            </div>
            <div>
              <strong>风险等级</strong>
              <Tag color={aiAdvice.riskLevel === "high" ? "red" : aiAdvice.riskLevel === "medium" ? "orange" : "green"}>
                {aiAdvice.riskLevel}
              </Tag>
            </div>
          </Space>
        ) : (
          <div>暂无建议</div>
        )}
      </Modal>
    </div>
  );
}
