import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { MainLayout } from "../../components/MainLayout";
import { tasksApi } from "../../api/tasks";
import { customersApi } from "../../api/customers";
import type { Customer, TaskItem } from "../../api/types";

interface CreateTaskFormValues {
  customerId: number;
  title: string;
  dueAt: Dayjs;
  type?: string;
  priority?: number;
}

export default function TaskPage() {
  const [list, setList] = useState<TaskItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done" | "cancelled">("all");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm<CreateTaskFormValues>();

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setList(res.data);
      setPagination((prev) => ({ ...prev, total: res.total }));
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载任务失败";
      console.error("[TaskPage] 加载任务失败:", error);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await customersApi.getList({ page: 1, pageSize: 200 });
      setCustomers(res.data);
    } catch (error) {
      console.error("[TaskPage] 加载客户失败:", error);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const handleCreateTask = async (values: CreateTaskFormValues) => {
    try {
      setSaving(true);
      await tasksApi.create({
        customerId: values.customerId,
        title: values.title,
        dueAt: values.dueAt.toISOString(),
        type: values.type || "followup",
        priority: values.priority || 2,
      });
      message.success("任务创建成功");
      setCreateVisible(false);
      form.resetFields();
      await loadTasks();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "创建任务失败";
      console.error("[TaskPage] 创建任务失败:", error);
      message.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (taskId: number, status: "done" | "open" | "cancelled") => {
    try {
      await tasksApi.update(taskId, { status });
      message.success("任务状态已更新");
      await loadTasks();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "更新状态失败";
      console.error("[TaskPage] 更新任务状态失败:", error);
      message.error(errMsg);
    }
  };

  const columns: ColumnsType<TaskItem> = [
    { title: "任务标题", dataIndex: "title", key: "title", width: 220 },
    { title: "客户", dataIndex: "customer_name", key: "customer_name", width: 140 },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (value?: string) => value || "followup",
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      width: 90,
      render: (v: number) => (v === 1 ? "高" : v === 3 ? "低" : "中"),
    },
    {
      title: "截止时间",
      dataIndex: "due_at",
      key: "due_at",
      width: 170,
      render: (v: string) => String(v).replace("T", " ").slice(0, 19),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: TaskItem["status"]) => {
        const map = {
          open: { color: "blue", text: "待处理" },
          done: { color: "green", text: "已完成" },
          cancelled: { color: "default", text: "已取消" },
        };
        const item = map[status];
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => void updateStatus(record.id, "done")}>
            完成
          </Button>
          <Button size="small" onClick={() => void updateStatus(record.id, "open")}>
            重新打开
          </Button>
          <Button size="small" danger onClick={() => void updateStatus(record.id, "cancelled")}>
            取消
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ marginBottom: 8 }}>任务管理</h1>
          <p style={{ margin: 0, color: "#666" }}>管理销售跟进任务，追踪执行状态</p>
        </div>
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Input.Search
              allowClear
              placeholder="搜索任务标题或客户"
              style={{ width: 260 }}
              onSearch={(value) => {
                setSearchText(value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            />
            <Select
              value={statusFilter}
              style={{ width: 140 }}
              onChange={(value) => {
                setStatusFilter(value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              options={[
                { label: "全部状态", value: "all" },
                { label: "待处理", value: "open" },
                { label: "已完成", value: "done" },
                { label: "已取消", value: "cancelled" },
              ]}
            />
            <Button type="primary" onClick={() => setCreateVisible(true)}>
              新建任务
            </Button>
            <Button onClick={() => void loadTasks()} loading={loading}>
              刷新
            </Button>
          </Space>
        </Card>
        <Card>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={(pager) =>
              setPagination((prev) => ({
                ...prev,
                current: pager.current || 1,
                pageSize: pager.pageSize || 10,
              }))
            }
          />
        </Card>

        <Modal
          title="新建任务"
          open={createVisible}
          onCancel={() => setCreateVisible(false)}
          onOk={() => void form.submit()}
          okText="保存"
          cancelText="取消"
          confirmLoading={saving}
        >
          <Form form={form} layout="vertical" onFinish={(values) => void handleCreateTask(values)}>
            <Form.Item
              label="关联客户"
              name="customerId"
              rules={[{ required: true, message: "请选择客户" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={customers.map((c) => ({
                  label: `${c.name}（${c.contact}）`,
                  value: c.id,
                }))}
              />
            </Form.Item>
            <Form.Item label="任务标题" name="title" rules={[{ required: true, message: "请输入任务标题" }]}>
              <Input placeholder="请输入任务标题" />
            </Form.Item>
            <Form.Item
              label="任务类型"
              name="type"
              initialValue="followup"
              rules={[{ required: true, message: "请选择任务类型" }]}
            >
              <Select
                options={[
                  { label: "跟进任务", value: "followup" },
                  { label: "报价跟进", value: "quotation" },
                  { label: "回款跟进", value: "payment" },
                  { label: "拜访任务", value: "visit" },
                ]}
              />
            </Form.Item>
            <Form.Item label="优先级" name="priority" initialValue={2}>
              <InputNumber min={1} max={3} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="截止时间"
              name="dueAt"
              rules={[{ required: true, message: "请选择截止时间" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} disabledDate={(d) => d.isBefore(dayjs().startOf("day"))} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}

