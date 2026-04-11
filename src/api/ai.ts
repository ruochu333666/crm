import { apiRequest } from "./http";

export interface CustomerNextStepAdvice {
  summary: string;
  nextAction: string;
  talkTrack: string;
  riskLevel: "low" | "medium" | "high";
}

export interface AIStatus {
  enabled: boolean;
  protocol: string;
  hasBaseUrl: boolean;
  hasApiKey: boolean;
  hasModel: boolean;
  ready: boolean;
}

export const aiApi = {
  async getStatus(): Promise<{ data: AIStatus }> {
    const response = await apiRequest("/ai/status");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取 AI 状态失败");
    }
    return response.json();
  },

  async getCustomerNextStep(customerId: number): Promise<{ data: CustomerNextStepAdvice }> {
    const response = await apiRequest("/ai/customer-next-step", {
      method: "POST",
      body: JSON.stringify({ customerId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取 AI 建议失败");
    }
    return response.json();
  },
};
