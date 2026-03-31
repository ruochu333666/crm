import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MainLayout } from "../../components/MainLayout";
import { opportunitiesApi } from "../../api/opportunities";
import type { OpportunityStageRequest } from "../../api/types";
import { useAuthStore } from "../../store/auth";

export default function OpportunityRequestsPage() {
  const { user } = useAuthStore();
  const isManager = user?.role === "manager" || user?.role === "admin";

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<OpportunityStageRequest[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<OpportunityStageRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await opportunitiesApi.getStageRequests({
        status: "pending",
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      setList(res.data);
      setPagination((prev) => ({ ...prev, total: res.total }));
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载待审批失败";
      console.error("[OpportunityRequestsPage] 加载待审批失败:", error);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleApprove = async (id: number) => {
    try {
      await opportunitiesApi.approveStageRequest(id);
      message.success("审批通过");
      await loadRequests();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "审批通过失败";
      console.error("[OpportunityRequestsPage] 审批通过失败:", error);
      message.error(errMsg);
    }
  };

  const openReject = (row: OpportunityStageRequest) => {
    setRejectTarget(row);
    setRejectReason(row.reject_reason || "");
    setRejectModalVisible(true);
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      message.error("请填写驳回原因");
      return;
    }
    try {
      setRejectLoading(true);
      await opportunitiesApi.rejectStageRequest(rejectTarget.id, rejectReason.trim());
      message.success("已驳回");
      setRejectModalVisible(false);
      setRejectTarget(null);
      setRejectReason("");
      await loadRequests();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "驳回失败";
      console.error("[OpportunityRequestsPage] 驳回失败:", error);
      message.error(errMsg);
    } finally {
      setRejectLoading(false);
    }
  };

  const columns: ColumnsType<OpportunityStageRequest> = useMemo(
    () => [
      {
        title: "商机",
        dataIndex: "opportunity_title",
        key: "opportunity_title",
        width: 260,
        render: (v) => v || "—",
      },
      {
        title: "客户",
        dataIndex: "customer_name",
        key: "customer_name",
        width: 180,
      },
      {
        title: "从阶段",
        dataIndex: "from_stage",
        key: "from_stage",
        width: 130,
      },
      {
        title: "到阶段",
        dataIndex: "to_stage",
        key: "to_stage",
        width: 130,
      },
      {
        title: "申请人",
        dataIndex: "requested_by_username",
        key: "requested_by_username",
        width: 120,
      },
      {
        title: "申请原因",
        dataIndex: "reason",
        key: "reason",
        render: (v) => v || "—",
      },
      {
        title: "申请时间",
        dataIndex: "requested_at",
        key: "requested_at",
        width: 170,
        render: (v) => String(v).replace("T", " ").slice(0, 19),
      },
      {
        title: "操作",
        key: "action",
        fixed: "right",
        width: 220,
        render: (_, record) => (
          <Space size="small">
            <Button size="small" type="primary" disabled={!isManager} onClick={() => void handleApprove(record.id)}>
              通过
            </Button>
            <Button size="small" danger disabled={!isManager} onClick={() => openReject(record)}>
              驳回
            </Button>
          </Space>
        ),
      },
    ],
    [isManager]
  );

  return (
    <MainLayout>
      <div>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ marginBottom: 8 }}>商机审批</h1>
          <p style={{ margin: 0, color: "#666" }}>
            销售发起阶段变更申请，经理审批后推进商机阶段
          </p>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Tag color={isManager ? "green" : "default"}>{isManager ? "你是审批人" : "仅经理可审批"}</Tag>
          <Button style={{ marginLeft: 12 }} onClick={() => void loadRequests()} loading={loading}>
            刷新
          </Button>
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
                pageSize: pager.pageSize || 20,
              }))
            }
          />
        </Card>

        <Modal
          title="驳回原因"
          open={rejectModalVisible}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectTarget(null);
            setRejectReason("");
          }}
          onOk={() => void submitReject()}
          confirmLoading={rejectLoading}
          okText="确认驳回"
          cancelText="取消"
        >
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入驳回原因（会记录到审批日志）"
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

