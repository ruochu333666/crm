import { apiRequest } from "./http";
import type { FollowupRecord, TaskItem } from "./types";

export interface CreateFollowupParams {
  customerId: number;
  method: "phone" | "email" | "meeting" | "im" | "other";
  content: string;
  nextFollowUpAt?: string | null;
}

export interface GetTasksParams {
  status?: "open" | "done" | "cancelled";
  dueTo?: string;
  limit?: number;
}

export const followupsApi = {
  async getByCustomer(customerId: number): Promise<{ data: FollowupRecord[] }> {
    const response = await apiRequest(`/followups?customerId=${customerId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取跟进记录失败");
    }
    return response.json();
  },

  async create(params: CreateFollowupParams): Promise<{ message: string; id: number }> {
    const response = await apiRequest("/followups", {
      method: "POST",
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "新增跟进记录失败");
    }
    return response.json();
  },

  async getTasks(params: GetTasksParams): Promise<{ data: TaskItem[] }> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append("status", params.status);
    if (params.dueTo) searchParams.append("dueTo", params.dueTo);
    if (params.limit) searchParams.append("limit", String(params.limit));

    const qs = searchParams.toString();
    const response = await apiRequest(`/tasks${qs ? `?${qs}` : ""}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取待办失败");
    }
    return response.json();
  },

  async updateTaskStatus(
    taskId: number,
    status: "open" | "done" | "cancelled"
  ): Promise<{ message: string }> {
    const response = await apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "更新待办状态失败");
    }
    return response.json();
  },
};

