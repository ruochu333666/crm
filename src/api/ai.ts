import { apiRequest } from "./http";

export interface CustomerNextStepAdvice {
  summary: string;
  nextAction: string;
  talkTrack: string;
  riskLevel: "low" | "medium" | "high";
}

export const aiApi = {
  async getCustomerNextStep(customerId: number): Promise<{ data: CustomerNextStepAdvice }> {
    const response = await apiRequest("/ai/customer-next-step", {
      method: "POST",
      body: JSON.stringify({ customerId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取AI建议失败");
    }
    return response.json();
  },
};

