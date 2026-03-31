import { API_BASE } from "./baseUrl";

function buildHeaders(init?: RequestInit): HeadersInit {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

/** 请求 JSON API，自动附加 Content-Type 与 Bearer Token（若存在） */
export async function apiRequest(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${normalized}`;
  return fetch(url, { ...init, headers: buildHeaders(init) });
}
