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

  let text: string;
  try {
    text = await response.text();
  } catch {
    throw new Error("Failed to read response from server");
  }

  let data: Response<T>;
  try {
    data = JSON.parse(text) as Response<T>;
  } catch {
    if (!response.ok) {
      throw new Error(`Server error (${response.status}): ${text.trim().slice(0, 200)}`);
    }
    throw new Error(`Invalid JSON response: ${text.trim().slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data.error?.message || `Server error (${response.status})`);
  }
  return data;
}
