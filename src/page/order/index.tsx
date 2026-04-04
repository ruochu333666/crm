import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { MainLayout } from "../../components/MainLayout";
import {
  OrderFormModal,
  ORDER_STATUS_OPTIONS,
  type OrderFormModalValues,
} from "../../components/OrderFormModal";
import { ordersApi } from "../../api/orders";
import { customersApi } from "../../api/customers";
import type { Customer, Order } from "../../api/types";
import styles from "./index.module.less";
import {
  orderFormToCreateBody,
  orderFormToPatchBody,
} from "../../utils/orderFormPayload";

function statusLabel(status: string): string {
  const o = ORDER_STATUS_OPTIONS.find((x) => x.value === status);
  return o?.label ?? status;
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    draft: "default",
    pending: "processing",
    producing: "blue",
    shipped: "cyan",
    delivered: "geekblue",
    completed: "success",
    cancelled: "error",
  };
  return map[status] ?? "default";
}

export default function OrderPage() {
  const [list, setList] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText || undefined,
        status: statusFilter || undefined,
      });
      setList(res.data);
      setPagination((p) => ({ ...p, total: res.total }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载订单失败";
      console.error("[OrderPage] 加载订单失败:", e);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await customersApi.getList({ page: 1, pageSize: 500 });
      setCustomers(res.data);
    } catch (e) {
      console.error("[OrderPage] 加载客户失败:", e);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Order) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleModalSubmit = async (v: OrderFormModalValues) => {
    try {
      setSaving(true);
      if (editing) {
        await ordersApi.patch(editing.id, orderFormToPatchBody(v));
        message.success("订单已更新");
      } else {
        await ordersApi.create(orderFormToCreateBody(v));
        message.success("订单已创建");
      }
      setModalOpen(false);
      setEditing(null);
      await loadList();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存失败";
      console.error("[OrderPage] 保存订单失败:", e);
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ordersApi.remove(id);
      message.success("已删除");
      await loadList();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "删除失败";
      message.error(msg);
    }
  };

  const columns: ColumnsType<Order> = [
    { title: "订单号", dataIndex: "order_no", key: "order_no", width: 160 },
    {
      title: "客户",
      key: "customer",
      width: 180,
      render: (_, row) => row.customer_name || `客户 #${row.customer_id}`,
    },
    {
      title: "摘要",
      dataIndex: "product_summary",
      key: "product_summary",
      ellipsis: true,
    },
    {
      title: "金额",
      key: "amount",
      width: 120,
      render: (_, row) => `${row.currency} ${Number(row.amount).toLocaleString()}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s: string) => (
        <Tag color={statusColor(s)}>{statusLabel(s)}</Tag>
      ),
    },
    {
      title: "物流单号",
      dataIndex: "logistics_no",
      key: "logistics_no",
      width: 140,
      ellipsis: true,
      render: (t: string | null) => t || "—",
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      render: (t: string) =>
        t ? String(t).replace("T", " ").slice(0, 19) : "—",
    },
    {
      title: "操作",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, row) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(row)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该订单？"
            onConfirm={() => void handleDelete(row.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className={styles.page}>
        <Card title="订单管理">
          <Space wrap style={{ marginBottom: 16 }}>
            <Input
              placeholder="搜索订单号、摘要、客户名"
              allowClear
              style={{ width: 260 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() =>
                setPagination((p) => ({ ...p, current: 1 }))
              }
              suffix={<SearchOutlined />}
            />
            <Select
              placeholder="订单状态"
              allowClear
              style={{ width: 140 }}
              value={statusFilter || undefined}
              onChange={(v) => {
                setStatusFilter(v || "");
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              options={ORDER_STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
            >
              新建订单
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void loadList()}
            >
              刷新
            </Button>
          </Space>
          <Table<Order>
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={list}
            scroll={{ x: 1100 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize: pageSize || 10, total: pagination.total }),
            }}
          />
        </Card>
      </div>
      <OrderFormModal
        open={modalOpen}
        title={editing ? "编辑订单" : "新建订单"}
        confirmLoading={saving}
        customers={customers}
        editingOrder={editing}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleModalSubmit}
      />
    </MainLayout>
  );
}
