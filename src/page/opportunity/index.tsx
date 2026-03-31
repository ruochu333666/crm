import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { MainLayout } from "../../components/MainLayout";
import { customersApi, type Customer } from "../../api/customers";
import { opportunitiesApi } from "../../api/opportunities";
import type { Opportunity } from "../../api/types";
import { useAuthStore } from "../../store/auth";
import type { StageChangePayload } from "../../api/opportunities";

const stageOptions = [
  { label: "初步接触", value: "prospecting" },
  { label: "需求确认", value: "requirements" },
  { label: "报价中", value: "quotation" },
  { label: "谈判中", value: "negotiation" },
  { label: "赢单", value: "won" },
  { label: "输单", value: "lost" },
];

function formatDateTime(v?: string | null) {
  if (!v) return "—";
  return String(v).replace("T", " ").slice(0, 19);
}

export default function OpportunityPage() {
  const { user } = useAuthStore();
  const canRequest = user?.role === "sales" || user?.role === "admin";
  const canCreate = user?.role === "sales" || user?.role === "admin";

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Opportunity[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);

  const [createVisible, setCreateVisible] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createForm] = Form.useForm<{
    customerId: number;
    title: string;
    estimatedAmount?: number;
    expectedCloseAt?: Dayjs;
  }>();

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [requestVisible, setRequestVisible] = useState(false);
  const [requestSaving, setRequestSaving] = useState(false);
  const [requestForm] = Form.useForm<{
    toStage: string;
    reason: string;
  }>();
  const [requestOpportunity, setRequestOpportunity] = useState<Opportunity | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await customersApi.getList({ page: 1, pageSize: 200 });
      setCustomers(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载客户失败";
      console.error("[OpportunityPage] 加载客户失败:", error);
      message.error(errMsg);
    }
  }, []);

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await opportunitiesApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        stage: stageFilter,
        search: searchText || undefined,
      });
      setList(res.data);
      setPagination((prev) => ({ ...prev, total: res.total }));
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载商机失败";
      console.error("[OpportunityPage] 加载商机失败:", error);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, stageFilter]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    void loadOpportunities();
  }, [loadOpportunities]);

  const handleCreate = async (values: {
    customerId: number;
    title: string;
    estimatedAmount?: number;
    expectedCloseAt?: Dayjs;
  }) => {
    if (!canCreate) return;
    try {
      setCreateSaving(true);
      const expectedCloseAt = values.expectedCloseAt
        ? values.expectedCloseAt.format("YYYY-MM-DD HH:mm:ss")
        : null;
      await opportunitiesApi.create({
        customerId: values.customerId,
        title: values.title,
        estimatedAmount:
          typeof values.estimatedAmount === "number"
            ? values.estimatedAmount
            : undefined,
        expectedCloseAt,
      });
      message.success("商机创建成功");
      setCreateVisible(false);
      createForm.resetFields();
      await loadOpportunities();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "创建商机失败";
      console.error("[OpportunityPage] 创建商机失败:", error);
      message.error(errMsg);
    } finally {
      setCreateSaving(false);
    }
  };

  const openStageRequest = (opp: Opportunity) => {
    setRequestOpportunity(opp);
    const initialToStage = stageOptions.find((s) => s.value !== opp.stage)?.value || opp.stage;
    requestForm.setFieldsValue({
      toStage: initialToStage,
      reason: "",
    });
    setRequestVisible(true);
  };

  const submitStageRequest = async (values: {
    toStage: string;
    reason: string;
  }) => {
    if (!requestOpportunity?.id) return;
    try {
      setRequestSaving(true);
      const payload: StageChangePayload = {
        toStage: values.toStage,
        reason: values.reason,
      };
      await opportunitiesApi.requestStageChange(requestOpportunity.id, payload);
      message.success("阶段变更申请已提交");
      setRequestVisible(false);
      await loadOpportunities();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "提交申请失败";
      console.error("[OpportunityPage] 提交申请失败:", error);
      message.error(errMsg);
    } finally {
      setRequestSaving(false);
    }
  };

  const columns: ColumnsType<Opportunity> = useMemo(
    () => [
      { title: "商机标题", dataIndex: "title", key: "title", width: 260 },
      { title: "客户", dataIndex: "customer_name", key: "customer_name", width: 150 },
      {
        title: "阶段",
        dataIndex: "stage",
        key: "stage",
        width: 120,
        render: (stage: string) =>
          stageOptions.find((s) => s.value === stage)?.label || stage,
      },
      {
        title: "负责人",
        dataIndex: "owner_username",
        key: "owner_username",
        width: 110,
      },
      {
        title: "预计金额",
        dataIndex: "estimated_amount",
        key: "estimated_amount",
        width: 140,
        render: (v) => (typeof v === "number" ? v.toLocaleString() : v || "—"),
      },
      {
        title: "预计成交日期",
        dataIndex: "expected_close_at",
        key: "expected_close_at",
        width: 170,
        render: (v) => formatDateTime(v),
      },
      {
        title: "操作",
        key: "action",
        fixed: "right",
        width: 260,
        render: (_, record) => (
          <Space size="small">
            <Button
              size="small"
              disabled={!canRequest}
              onClick={() => openStageRequest(record)}
            >
              申请阶段变更
            </Button>
          </Space>
        ),
      },
    ],
    [canRequest]
  );

  return (
    <MainLayout>
      <div>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ marginBottom: 8 }}>商机管理</h1>
          <p style={{ margin: 0, color: "#666" }}>销售发起阶段变更申请，经理审批后推进阶段</p>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Input.Search
              allowClear
              placeholder="搜索商机标题或客户"
              style={{ width: 260 }}
              onSearch={(v) => {
                setSearchText(v);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            />
            <Select
              allowClear
              placeholder="筛选阶段"
              style={{ width: 180 }}
              value={stageFilter}
              onChange={(v) => {
                setStageFilter(v);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              options={stageOptions}
            />
            <Button type="primary" onClick={() => setCreateVisible(true)} disabled={!canCreate}>
              新建商机
            </Button>
          </Space>
        </Card>

        <Card>
          <Table
            rowKey="id"
            columns={columns}
            loading={loading}
            dataSource={list}
            scroll={{ x: 1200 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
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
          title="新建商机"
          open={createVisible}
          onCancel={() => setCreateVisible(false)}
          onOk={() => void createForm.submit()}
          okText="保存"
          cancelText="取消"
          confirmLoading={createSaving}
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={(values) => void handleCreate(values)}
            initialValues={{ estimatedAmount: 0 }}
          >
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
            <Form.Item
              label="商机标题"
              name="title"
              rules={[{ required: true, message: "请输入标题" }]}
            >
              <Input placeholder="例如：华南某客户进口需求项目" />
            </Form.Item>
            <Form.Item label="预计金额" name="estimatedAmount">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="预计成交日期" name="expectedCloseAt">
              <DatePicker
                showTime
                style={{ width: "100%" }}
                disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="申请阶段变更"
          open={requestVisible}
          onCancel={() => setRequestVisible(false)}
          onOk={() => void requestForm.submit()}
          okText="提交申请"
          cancelText="取消"
          confirmLoading={requestSaving}
        >
          <Form
            form={requestForm}
            layout="vertical"
            onFinish={(values) => void submitStageRequest(values)}
          >
            <Form.Item
              label="目标阶段"
              name="toStage"
              rules={[{ required: true, message: "请选择目标阶段" }]}
            >
              <Select options={stageOptions} />
            </Form.Item>
            <Form.Item
              label="申请原因"
              name="reason"
              rules={[{ required: true, message: "请输入申请原因" }]}
            >
              <Input.TextArea rows={4} placeholder="说明为什么要推进到该阶段" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}

