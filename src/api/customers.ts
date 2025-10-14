const API_BASE = "http://localhost:5174/api";

export interface Customer {
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

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  region?: string;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export const customersApi = {
  // 获取客户列表
  getList: async (
    params: CustomerListParams = {}
  ): Promise<CustomerListResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.region) queryParams.append("region", params.region);

    const response = await fetch(
      `${API_BASE}/customers?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取客户列表失败");
    }

    return response.json();
  },

  // 获取客户详情
  getDetail: async (id: number): Promise<{ data: Customer }> => {
    const response = await fetch(`${API_BASE}/customers/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取客户详情失败");
    }

    return response.json();
  },

  // 创建客户
  create: async (
    customer: Omit<Customer, "id" | "created_at" | "updated_at">
  ): Promise<{ message: string; id: number }> => {
    const response = await fetch(`${API_BASE}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "创建客户失败");
    }

    return response.json();
  },

  // 更新客户
  update: async (
    id: number,
    customer: Omit<Customer, "id" | "created_at" | "updated_at">
  ): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "更新客户失败");
    }

    return response.json();
  },

  // 删除客户
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/customers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "删除客户失败");
    }

    return response.json();
  },
};
