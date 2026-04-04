import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  DatePicker,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect } from "react";
import type { Customer, Order } from "../api/types";

export const ORDER_STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "pending", label: "待确认" },
  { value: "producing", label: "生产中" },
  { value: "shipped", label: "已发货" },
  { value: "delivered", label: "已签收" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
] as const;

export interface OrderFormModalValues {
  customerId: number;
  orderNo?: string;
  productSummary: string;
  amount: number;
  currency: string;
  incoterms?: string;
  shippingMethod?: string;
  logisticsNo?: string;
  depositAmount?: number | null;
  balanceAmount?: number | null;
  status: string;
  orderedAt?: Dayjs | null;
  expectedShipAt?: Dayjs | null;
  shippedAt?: Dayjs | null;
  remark?: string;
}

interface OrderFormModalProps {
  open: boolean;
  title: string;
  confirmLoading: boolean;
  customers: Customer[];
  /** 若设置则客户不可改（客户详情页） */
  lockCustomerId?: number;
  editingOrder?: Order | null;
  onCancel: () => void;
  onSubmit: (values: OrderFormModalValues) => Promise<void>;
}

export function OrderFormModal({
  open,
  title,
  confirmLoading,
  customers,
  lockCustomerId,
  editingOrder,
  onCancel,
  onSubmit,
}: OrderFormModalProps) {
  const [form] = Form.useForm<OrderFormModalValues>();

  useEffect(() => {
    if (!open) return;
    if (editingOrder) {
      form.setFieldsValue({
        customerId: editingOrder.customer_id,
        orderNo: editingOrder.order_no,
        productSummary: editingOrder.product_summary,
        amount: Number(editingOrder.amount),
        currency: editingOrder.currency || "CNY",
        incoterms: editingOrder.incoterms ?? undefined,
        shippingMethod: editingOrder.shipping_method ?? undefined,
        logisticsNo: editingOrder.logistics_no ?? undefined,
        depositAmount: editingOrder.deposit_amount ?? undefined,
        balanceAmount: editingOrder.balance_amount ?? undefined,
        status: editingOrder.status,
        orderedAt: editingOrder.ordered_at ? dayjs(editingOrder.ordered_at) : undefined,
        expectedShipAt: editingOrder.expected_ship_at
          ? dayjs(editingOrder.expected_ship_at)
          : undefined,
        shippedAt: editingOrder.shipped_at ? dayjs(editingOrder.shipped_at) : undefined,
        remark: editingOrder.remark ?? undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        customerId: lockCustomerId,
        amount: 0,
        currency: "CNY",
        status: "pending",
      });
    }
  }, [open, editingOrder, lockCustomerId, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (e: unknown) {
      if (e && typeof e === "object" && "errorFields" in e) return;
      const msg = e instanceof Error ? e.message : "提交失败";
      message.error(msg);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText="保存"
      cancelText="取消"
      confirmLoading={confirmLoading}
      width={640}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="客户"
          name="customerId"
          rules={[{ required: true, message: "请选择客户" }]}
        >
          <Select
            placeholder="选择客户"
            disabled={lockCustomerId != null}
            showSearch
            optionFilterProp="label"
            options={customers.map((c) => ({
              value: c.id!,
              label: `${c.name}（${c.company}）`,
            }))}
          />
        </Form.Item>
        <Form.Item label="订单编号（可留空自动生成）" name="orderNo">
          <Input placeholder="留空则系统自动生成" disabled={!!editingOrder} />
        </Form.Item>
        <Form.Item
          label="产品/标的摘要"
          name="productSummary"
          rules={[{ required: true, message: "请输入订单摘要" }]}
        >
          <Input.TextArea rows={2} placeholder="如：产品A × 100件" />
        </Form.Item>
        <Form.Item label="订单金额" name="amount" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} precision={2} />
        </Form.Item>
        <Form.Item label="币种" name="currency" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "CNY", label: "CNY 人民币" },
              { value: "USD", label: "USD 美元" },
              { value: "EUR", label: "EUR 欧元" },
            ]}
          />
        </Form.Item>
        <Form.Item label="贸易条款" name="incoterms">
          <Input placeholder="如 FOB / CIF 等" />
        </Form.Item>
        <Form.Item label="货运方式" name="shippingMethod">
          <Input placeholder="海运 / 空运 / 快递等" />
        </Form.Item>
        <Form.Item label="物流单号" name="logisticsNo">
          <Input placeholder="运单号" />
        </Form.Item>
        <Form.Item label="定金" name="depositAmount">
          <InputNumber min={0} style={{ width: "100%" }} precision={2} />
        </Form.Item>
        <Form.Item label="尾款" name="balanceAmount">
          <InputNumber min={0} style={{ width: "100%" }} precision={2} />
        </Form.Item>
        <Form.Item label="状态" name="status" rules={[{ required: true }]}>
          <Select options={[...ORDER_STATUS_OPTIONS]} />
        </Form.Item>
        <Form.Item label="下单时间" name="orderedAt">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="预计发货" name="expectedShipAt">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="实际发货" name="shippedAt">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
