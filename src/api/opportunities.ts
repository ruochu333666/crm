import { apiRequest } from "./http";
import type { Opportunity, OpportunityStageRequest } from "./types";

export type StageChangePayload = {
  toStage: string;
  reason: string;
};

export const opportunitiesApi = {
  async getList(params: {
    page?: number;
    pageSize?: number;
    stage?: string;
    search?: string;
  }): Promise<{ data: Opportunity[]; total: number; page: number; pageSize: number }> {
    const qs = new URLSearchParams();
    if (params.page) qs.append("page", String(params.page));
    if (params.pageSize) qs.append("pageSize", String(params.pageSize));
    if (params.stage) qs.append("stage", params.stage);
    if (params.search) qs.append("search", params.search);
    const response = await apiRequest(`/opportunities?${qs.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取商机列表失败");
    }
    return response.json();
  },

  async create(payload: {
    customerId: number;
    title: string;
    estimatedAmount?: number;
    expectedCloseAt?: string | null;
  }): Promise<{ message: string; id: number }> {
    const response = await apiRequest("/opportunities", {
      method: "POST",
      body: JSON.stringify({
        customerId: payload.customerId,
        title: payload.title,
        estimatedAmount: payload.estimatedAmount,
        expectedCloseAt: payload.expectedCloseAt,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "创建商机失败");
    }
    return response.json();
  },

  async requestStageChange(opportunityId: number, payload: StageChangePayload): Promise<{ message: string }> {
    const response = await apiRequest(`/opportunities/${opportunityId}/stage-change`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "提交阶段变更申请失败");
    }
    return response.json();
  },

  async getStageRequests(params: { status?: string; page?: number; pageSize?: number }): Promise<{
    data: OpportunityStageRequest[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const qs = new URLSearchParams();
    if (params.status) qs.append("status", params.status);
    if (params.page) qs.append("page", String(params.page));
    if (params.pageSize) qs.append("pageSize", String(params.pageSize));
    const response = await apiRequest(`/opportunities/stage-requests?${qs.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取待审批列表失败");
    }
    return response.json();
  },

  async approveStageRequest(requestId: number): Promise<{ message: string }> {
    const response = await apiRequest(`/opportunities/stage-requests/${requestId}/approve`, {
      method: "PUT",
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "审批通过失败");
    }
    return response.json();
  },

  async rejectStageRequest(requestId: number, rejectReason: string): Promise<{ message: string }> {
    const response = await apiRequest(`/opportunities/stage-requests/${requestId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectReason }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "审批驳回失败");
    }
    return response.json();
  },
};

