import { loadConfig } from "./config.js";

type ApiResponse<T> = {
  data: T | null;
  error: { message: string; statusCode: number } | null;
};

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const config = loadConfig();
  if (!config.apiKey) {
    throw new Error("Not authenticated. Run `enx login` first.");
  }

  const url = `${config.apiUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json: ApiResponse<T> = await res.json();

  if (json.error) {
    throw new Error(`${json.error.message} (${json.error.statusCode})`);
  }

  return json.data as T;
}

function get<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

function del<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

export type Project = { id: string; userId: string; name: string; createdAt: string };

export function listProjects(): Promise<{ projects: Project[] }> {
  return get("/projects");
}

export function createProject(name: string): Promise<{ project: Project }> {
  return post("/projects", { name });
}

export function getProject(name: string): Promise<{ project: Project }> {
  return get(`/projects/${encodeURIComponent(name)}`);
}

export function updateProject(name: string, newName: string): Promise<{ project: Project }> {
  return patch(`/projects/${encodeURIComponent(name)}`, { name: newName });
}

export function deleteProject(name: string): Promise<{ project: Project }> {
  return del(`/projects/${encodeURIComponent(name)}`);
}

export type Environment = { id: string; projectId: string; name: string; createdAt: string };

export function listEnvironments(projectName: string): Promise<{ environments: Environment[] }> {
  return get(`/projects/${encodeURIComponent(projectName)}/environments`);
}

export function createEnvironment(projectName: string, name: string): Promise<{ environment: Environment }> {
  return post(`/projects/${encodeURIComponent(projectName)}/environments`, { name });
}

export function getEnvironment(projectName: string, envName: string): Promise<{ environment: Environment }> {
  return get(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}`);
}

export function updateEnvironment(projectName: string, envName: string, newName: string): Promise<{ environment: Environment }> {
  return patch(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}`, { name: newName });
}

export function deleteEnvironment(projectName: string, envName: string): Promise<{ environment: Environment }> {
  return del(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}`);
}

export type Variable = { id: string; environmentId: string; key: string; value: string; createdAt: string };
export type VariableRow = { variables: Variable; environments: Environment | null; projects: Project | null };

export function listVariables(projectName: string, envName: string): Promise<{ variables: VariableRow[] }> {
  return get(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}/variables`);
}

export function createVariables(projectName: string, envName: string, vars: { key: string; value: string }[]): Promise<{ variables: Variable[] }> {
  return post(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}/variables`, vars);
}

export function getVariable(projectName: string, envName: string, id: string): Promise<{ variable: Variable }> {
  return get(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}/variables/${id}`);
}

export function updateVariable(projectName: string, envName: string, id: string, updates: { key?: string; value?: string }): Promise<{ variable: Variable }> {
  return patch(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}/variables/${id}`, updates);
}

export function deleteVariable(projectName: string, envName: string, id: string): Promise<{ variable: Variable }> {
  return del(`/projects/${encodeURIComponent(projectName)}/environments/${encodeURIComponent(envName)}/variables/${id}`);
}

export type ApiKey = { id: string; name: string; prefix: string; createdAt: string; lastUsedAt: string | null };
export type CreatedApiKey = { name: string; prefix: string; key: string };

export function listApiKeys(): Promise<{ apiKeys: ApiKey[] }> {
  return get("/api-keys");
}

export function createApiKey(name: string): Promise<{ apiKey: CreatedApiKey }> {
  return post("/api-keys", { name });
}

export function deleteApiKey(id: string): Promise<{ apiKey: { id: string; name: string; prefix: string } }> {
  return del(`/api-keys/${id}`);
}
