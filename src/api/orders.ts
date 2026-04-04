import { apiRequest } from "./http";
import type { Order } from "./types";

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  customerId?: number;
  status?: string;
  search?: string;
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrderBody {
  customerId: number;
  orderNo?: string;
  productSummary: string;
  amount?: number;
  currency?: string;
  incoterms?: string | null;
  shippingMethod?: string | null;
  logisticsNo?: string | null;
  depositAmount?: number | null;
  balanceAmount?: number | null;
  status?: string;
  orderedAt?: string | null;
  expectedShipAt?: string | null;
  shippedAt?: string | null;
  remark?: string | null;
}

export type PatchOrderBody = Partial<CreateOrderBody>;

export const ordersApi = {
  async getList(params: OrderListParams = {}): Promise<OrderListResponse> {
    const q = new URLSearchParams();
    if (params.page) q.append("page", String(params.page));
    if (params.pageSize) q.append("pageSize", String(params.pageSize));
    if (params.customerId) q.append("customerId", String(params.customerId));
    if (params.status) q.append("status", params.status);
    if (params.search) q.append("search", params.search);
    const qs = q.toString();
    const response = await apiRequest(`/orders${qs ? `?${qs}` : ""}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取订单列表失败");
    }
    return response.json();
  },

  async getById(id: number): Promise<{ data: Order }> {
    const response = await apiRequest(`/orders/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取订单失败");
    }
    return response.json();
  },

  async create(body: CreateOrderBody): Promise<{ message: string; id: number; orderNo: string }> {
    const response = await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "创建订单失败");
    }
    return response.json();
  },

  async patch(id: number, body: PatchOrderBody): Promise<{ message: string }> {
    const response = await apiRequest(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "更新订单失败");
    }
    return response.json();
  },

  async remove(id: number): Promise<{ message: string }> {
    const response = await apiRequest(`/orders/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "删除订单失败");
    }
    return response.json();
  },
};
