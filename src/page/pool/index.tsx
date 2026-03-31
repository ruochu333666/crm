import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MainLayout } from "../../components/MainLayout";
import { poolApi } from "../../api/pool";
import type { Customer, PoolAction } from "../../api/types";

const { Search } = Input;

export default function PoolPage() {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [list, setList] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [logVisible, setLogVisible] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [logItems, setLogItems] = useState<PoolAction[]>([]);
  const [logCustomer, setLogCustomer] = useState<Customer | null>(null);

  const loadPoolCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await poolApi.getPoolCustomers({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
      });
      setList(res.data);
      setPagination((prev) => ({ ...prev, total: res.total }));
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载公海客户失败";
      console.error("[PoolPage] 加载公海客户失败:", error);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText]);

  useEffect(() => {
    void loadPoolCustomers();
  }, [loadPoolCustomers]);

  const handleTake = async (customerId?: number) => {
    if (!customerId) return;
    try {
      await poolApi.take(customerId);
      message.success("捞取成功，客户已进入你的私海");
      await loadPoolCustomers();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "捞取失败";
      console.error("[PoolPage] 捞取客户失败:", error);
      message.error(errMsg);
    }
  };

  const openLogDrawer = async (customer: Customer) => {
    if (!customer.id) return;
    setLogCustomer(customer);
    setLogVisible(true);
    try {
      setLogLoading(true);
      const res = await poolApi.getActions(customer.id);
      setLogItems(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载日志失败";
      console.error("[PoolPage] 加载公海日志失败:", error);
      message.error(errMsg);
    } finally {
      setLogLoading(false);
    }
  };

  const columns: ColumnsType<Customer> = [
    { title: "客户名称", dataIndex: "name", key: "name", width: 160 },
    { title: "联系人", dataIndex: "contact", key: "contact", width: 120 },
    { title: "联系电话", dataIndex: "phone", key: "phone", width: 140 },
    { title: "地区", dataIndex: "region", key: "region", width: 100 },
    {
      title: "客户状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const map = {
          active: { color: "green", text: "活跃" },
          potential: { color: "blue", text: "潜在" },
          inactive: { color: "red", text: "非活跃" },
        };
        const item = map[status as keyof typeof map] || {
          color: "default",
          text: status,
        };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: "入池原因",
      dataIndex: "pool_reason",
      key: "pool_reason",
      width: 120,
      render: (reason?: string | null) => reason || "未记录",
    },
    {
      title: "入池时间",
      dataIndex: "pooled_at",
      key: "pooled_at",
      width: 180,
      render: (v?: string | null) => (v ? String(v).replace("T", " ").slice(0, 19) : "—"),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="确定捞取该客户吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => void handleTake(record.id)}
          >
            <Button type="primary" size="small">
              捞取
            </Button>
          </Popconfirm>
          <Button size="small" onClick={() => void openLogDrawer(record)}>
            查看日志
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ marginBottom: 8 }}>公海管理</h1>
          <p style={{ margin: 0, color: "#666" }}>统一管理未归属客户，支持销售捞取进入私海</p>
        </div>
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Search
              allowClear
              placeholder="搜索客户名称或联系人"
              style={{ width: 260 }}
              onSearch={(v) => {
                setSearchText(v);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            />
            <Button onClick={() => void loadPoolCustomers()} loading={loading}>
              刷新
            </Button>
          </Space>
        </Card>
        <Card>
          <Table
            columns={columns}
            rowKey="id"
            loading={loading}
            dataSource={list}
            scroll={{ x: 1100 }}
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
        <Drawer
          title={
            logCustomer
              ? `公海操作日志 - ${logCustomer.name}`
              : "公海操作日志"
          }
          width={520}
          open={logVisible}
          onClose={() => setLogVisible(false)}
        >
          {logLoading ? (
            <p>加载中...</p>
          ) : logItems.length === 0 ? (
            <p>暂无日志</p>
          ) : (
            <ul style={{ paddingLeft: 16 }}>
              {logItems.map((item) => (
                <li key={item.id} style={{ marginBottom: 12 }}>
                  <div>
                    <strong>{item.action}</strong> -{" "}
                    {item.reason || "无备注"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    时间：
                    {String(item.created_at).replace("T", " ").slice(0, 19)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Drawer>
      </div>
    </MainLayout>
  );
}

