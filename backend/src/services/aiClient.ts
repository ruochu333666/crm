interface AIAdvice {
  summary: string;
  nextAction: string;
  talkTrack: string;
  riskLevel: "low" | "medium" | "high";
}

function extractJson(text: string): AIAdvice {
  try {
    return JSON.parse(text) as AIAdvice;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as AIAdvice;
    }
    throw new Error("AI 返回内容不是合法 JSON");
  }
}

export async function generateCustomerNextStepAdvice(payload: {
  customerName: string;
  company: string;
  status: string;
  region: string;
  lastFollowups: Array<{
    createdAt: string;
    method: string;
    content: string;
  }>;
  openTasks: Array<{
    title: string;
    dueAt: string;
    status: string;
  }>;
}): Promise<AIAdvice> {
  const enabled = String(process.env.AI_ENABLED || "false") === "true";
  if (!enabled) {
    return {
      summary: "AI 功能未启用，已返回规则兜底建议。",
      nextAction: "建议在24小时内进行电话跟进，确认客户当前意向与决策时间。",
      talkTrack:
        "您好，这里是贵司的客户经理，想跟进一下上次沟通的需求进展，是否方便我们本周安排一次10分钟电话确认关键条款？",
      riskLevel: "medium",
    };
  }

  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const protocol = (process.env.AI_PROTOCOL || "openai").toLowerCase();
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 20000);

  if (!baseUrl || !apiKey || !model) {
    throw new Error("AI 配置不完整，请检查 AI_BASE_URL/AI_API_KEY/AI_MODEL");
  }

  const prompt = `
你是贸易行业CRM的销售教练。请基于给定客户数据，输出“下一步跟进建议”。
必须返回JSON，字段仅包含：
{
  "summary": "字符串，客户现状总结（1-2句）",
  "nextAction": "字符串，下一步动作建议（可执行）",
  "talkTrack": "字符串，建议销售话术",
  "riskLevel": "low|medium|high"
}

客户信息：
${JSON.stringify(payload, null, 2)}
`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const isAnthropic = protocol === "anthropic";
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: isAnthropic
        ? {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
      body: JSON.stringify(
        isAnthropic
          ? {
              model,
              max_tokens: 1024,
              temperature: 0.4,
              system: "你是专业贸易CRM销售助理，输出严格JSON。",
              messages: [{ role: "user", content: prompt }],
            }
          : {
              model,
              messages: [
                { role: "system", content: "你是专业贸易CRM销售助理，输出严格JSON。" },
                { role: "user", content: prompt },
              ],
              temperature: 0.4,
            }
      ),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI请求失败: ${response.status} ${text}`);
    }

    const data = (await response.json()) as
      | {
          choices?: Array<{ message?: { content?: string } }>;
        }
      | {
          content?: Array<{ type?: string; text?: string }>;
        };
    const content = isAnthropic
      ? (data as { content?: Array<{ text?: string }> }).content?.[0]?.text
      : (data as { choices?: Array<{ message?: { content?: string } }> })
          .choices?.[0]?.message?.content;
    if (!content) throw new Error("AI 返回为空");

    const parsed = extractJson(content);
    if (!["low", "medium", "high"].includes(parsed.riskLevel)) {
      parsed.riskLevel = "medium";
    }
    return parsed;
  } catch (error) {
    console.error("[aiClient] 生成建议失败:", error);
    return {
      summary: "AI 调用异常，已返回规则兜底建议。",
      nextAction: "建议先确认客户当前采购时间窗，再同步报价有效期与交期。",
      talkTrack:
        "您好，想确认一下贵司当前采购计划的时间节点，我们可根据您时间安排更新报价与交付方案。",
      riskLevel: "medium",
    };
  } finally {
    clearTimeout(timer);
  }
}

