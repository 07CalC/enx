import { getConfig } from "./config.ts";

export type Response<T> = {
  data: T;
  error: null | {
    message: string;
    statusCode: number;
  };
}

export const apiFetch = async<T>(endpoint: string, options: RequestInit): Promise<Response<T>> => {
  const baseURL = getConfig().baseURL;
  const apiKey = getConfig().apiKey || process.env.ENX_API_KEY;
  const token = getConfig().token;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Cookie": `enx-token=${token}` } : {}),
    ...(apiKey ? { "x-api-key": apiKey } : {}),
    ...options.headers,
  };
  const response = await globalThis.fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json() as Response<any>;
  if (response.status === 401) {
    throw new Error("Unauthorized. Please login");
  }
  if (!response.ok) {
    throw new Error(data.error?.message || "Unknown error");
  }
  return data;
}
