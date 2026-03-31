import { apiRequest } from "./http";
import type { TaskItem } from "./types";

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  status?: "open" | "done" | "cancelled";
  type?: string;
  priority?: number;
  search?: string;
  dueFrom?: string;
  dueTo?: string;
}

export interface TaskListResponse {
  data: TaskItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTaskPayload {
  customerId: number;
  title: string;
  dueAt: string;
  type?: string;
  source?: string;
  priority?: number;
}

export const tasksApi = {
  async getList(params: TaskListParams): Promise<TaskListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.append("page", String(params.page));
    if (params.pageSize) qs.append("pageSize", String(params.pageSize));
    if (params.status) qs.append("status", params.status);
    if (params.type) qs.append("type", params.type);
    if (params.priority) qs.append("priority", String(params.priority));
    if (params.search) qs.append("search", params.search);
    if (params.dueFrom) qs.append("dueFrom", params.dueFrom);
    if (params.dueTo) qs.append("dueTo", params.dueTo);

    const response = await apiRequest(`/tasks?${qs.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取任务列表失败");
    }
    return response.json();
  },

  async create(payload: CreateTaskPayload): Promise<{ message: string; id: number }> {
    const response = await apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "创建任务失败");
    }
    return response.json();
  },

  async update(
    taskId: number,
    payload: Partial<{
      status: "open" | "done" | "cancelled";
      dueAt: string;
      priority: number;
      title: string;
      result: string;
    }>
  ): Promise<{ message: string }> {
    const response = await apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "更新任务失败");
    }
    return response.json();
  },
};

