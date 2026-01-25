import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  message,
  Popconfirm,
  Tag,
  Card,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { MainLayout } from "../../components/MainLayout";
import { CustomerForm } from "./components/CustomerForm";
import { CustomerDetail } from "./components/CustomerDetail";
import { customersApi } from "../../api/customers";

// 本地定义 Customer 类型
interface Customer {
  id?: number;
  name: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  region: string;
  status: "active" | "potential" | "inactive";
  industry?: string;
  address?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
}
import styles from "./index.module.less";

const { Search } = Input;
const { Option } = Select;

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 模态框状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // 表格列配置
  const columns = [
    {
      title: "客户名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "联系人",
      dataIndex: "contact",
      key: "contact",
      width: 120,
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
      width: 140,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusMap = {
          active: { color: "green", text: "活跃" },
          potential: { color: "blue", text: "潜在" },
          inactive: { color: "red", text: "非活跃" },
        };
        const config = statusMap[status as keyof typeof statusMap] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "地区",
      dataIndex: "region",
      key: "region",
      width: 100,
    },
    {
      title: "最后联系",
      dataIndex: "lastContact",
      key: "lastContact",
      width: 120,
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个客户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理函数
  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsAddModalVisible(true);
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditModalVisible(true);
  };

  const handleViewDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await customersApi.delete(id);
      setCustomers(customers.filter((c) => c.id !== id));
      message.success("删除成功");
    } catch (error: any) {
      message.error(error.message || "删除失败");
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleRefresh = () => {
    loadCustomers();
  };

  // 加载客户数据
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customersApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        status: statusFilter === "all" ? "" : statusFilter,
        region: regionFilter === "all" ? "" : regionFilter,
      });

      setCustomers(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error: any) {
      message.error(error.message || "加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current,
    pagination.pageSize,
    regionFilter,
    searchText,
    statusFilter,
  ]);

  // 当分页、筛选、搜索变化时加载数据
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // 过滤数据（前端过滤，实际项目中应该用后端过滤）
  const filteredCustomers = customers;

  const handleTableChange = (pager: any) => {
    setPagination((prev) => ({
      ...prev,
      current: pager.current,
      pageSize: pager.pageSize,
    }));
  };

  return (
    <MainLayout>
      <div className={styles.customerPage}>
        {/* 页面标题 */}
        <div className={styles.pageHeader}>
          <h1>客户管理</h1>
          <p>统一管理客户信息，提升销售效率</p>
        </div>

        {/* 操作栏 */}
        <Card className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增客户
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </div>

          <div className={styles.toolbarRight}>
            <Space>
              <Search
                placeholder="搜索客户名称或联系人"
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />

              <Select
                placeholder="状态筛选"
                style={{ width: 120 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">全部状态</Option>
                <Option value="active">活跃</Option>
                <Option value="potential">潜在</Option>
                <Option value="inactive">非活跃</Option>
              </Select>

              <Select
                placeholder="地区筛选"
                style={{ width: 120 }}
                value={regionFilter}
                onChange={setRegionFilter}
              >
                <Option value="all">全部地区</Option>
                <Option value="华东">华东</Option>
                <Option value="华南">华南</Option>
                <Option value="华北">华北</Option>
                <Option value="西南">西南</Option>
              </Select>
            </Space>
          </div>
        </Card>

        {/* 客户列表 */}
        <Card className={styles.tableCard}>
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 新增客户模态框 */}
        <Modal
          title="新增客户"
          open={isAddModalVisible}
          onCancel={() => setIsAddModalVisible(false)}
          footer={null}
          width={600}
        >
          <CustomerForm
            customer={null}
            onSuccess={() => {
              setIsAddModalVisible(false);
              message.success("新增成功");
              loadCustomers();
            }}
            onCancel={() => setIsAddModalVisible(false)}
          />
        </Modal>

        {/* 编辑客户模态框 */}
        <Modal
          title="编辑客户"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={600}
        >
          <CustomerForm
            customer={selectedCustomer}
            onSuccess={() => {
              setIsEditModalVisible(false);
              message.success("编辑成功");
              loadCustomers();
            }}
            onCancel={() => setIsEditModalVisible(false)}
          />
        </Modal>

        {/* 客户详情模态框 */}
        <Modal
          title="客户详情"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          <CustomerDetail customer={selectedCustomer} />
        </Modal>
      </div>
    </MainLayout>
  );
}
