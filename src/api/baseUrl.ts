/** 后端 API 根路径（含 /api），由 VITE_API_BASE 配置 */
export const API_BASE = (
  import.meta.env.VITE_API_BASE as string | undefined
)?.replace(/\/$/, "") || "http://localhost:5174/api";
