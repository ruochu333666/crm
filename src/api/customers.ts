import type { Customer } from "./types";
import { apiRequest } from "./http";

export type { Customer } from "./types";

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

    const qs = queryParams.toString();
    const response = await apiRequest(`/customers${qs ? `?${qs}` : ""}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取客户列表失败");
    }

    return response.json();
  },

  getDetail: async (id: number): Promise<{ data: Customer }> => {
    const response = await apiRequest(`/customers/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取客户详情失败");
    }

    return response.json();
  },

  create: async (
    customer: Omit<Customer, "id" | "created_at" | "updated_at">
  ): Promise<{ message: string; id: number }> => {
    const response = await apiRequest("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "创建客户失败");
    }

    return response.json();
  },

  update: async (
    id: number,
    customer: Omit<Customer, "id" | "created_at" | "updated_at">
  ): Promise<{ message: string }> => {
    const response = await apiRequest(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "更新客户失败");
    }

    return response.json();
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiRequest(`/customers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "删除客户失败");
    }

    return response.json();
  },
};
