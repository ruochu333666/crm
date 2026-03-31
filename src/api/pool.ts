import { apiRequest } from "./http";
import type { Customer, PoolAction, PoolRule } from "./types";

export interface PoolListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  region?: string;
  poolReason?: string;
}

export interface PoolListResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export const poolApi = {
  async getPoolCustomers(params: PoolListParams): Promise<PoolListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.pageSize) query.append("pageSize", String(params.pageSize));
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.region) query.append("region", params.region);
    if (params.poolReason) query.append("poolReason", params.poolReason);

    const response = await apiRequest(`/pool/customers?${query.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取公海客户失败");
    }
    return response.json();
  },

  async take(customerId: number): Promise<{ message: string }> {
    const response = await apiRequest("/pool/take", {
      method: "POST",
      body: JSON.stringify({ customerId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "捞取客户失败");
    }
    return response.json();
  },

  async toPool(customerId: number, reason: string): Promise<{ message: string }> {
    const response = await apiRequest("/pool/to-pool", {
      method: "POST",
      body: JSON.stringify({ customerId, reason }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "转入公海失败");
    }
    return response.json();
  },

  async getActions(customerId?: number): Promise<{ data: PoolAction[] }> {
    const query = new URLSearchParams();
    if (customerId) query.append("customerId", String(customerId));
    const response = await apiRequest(`/pool/actions?${query.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取公海日志失败");
    }
    return response.json();
  },

  async getRules(): Promise<{ data: PoolRule }> {
    const response = await apiRequest("/pool/rules");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取公海规则失败");
    }
    return response.json();
  },

  async updateRules(payload: PoolRule): Promise<{ message: string }> {
    const response = await apiRequest("/pool/rules", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "更新公海规则失败");
    }
    return response.json();
  },

  async runRecycle(): Promise<{
    message: string;
    data: {
      recycledCount: number;
      byInactiveDays: number;
      byTimeoutNoFollowup: number;
    };
  }> {
    const response = await apiRequest("/pool/recycle/run", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "执行回收任务失败");
    }
    return response.json();
  },
};

