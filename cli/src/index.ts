#!/usr/bin/env node

import { Command } from "commander";
import { loadConfig, saveConfig } from "./config.js";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  listVariables,
  createVariables,
  updateVariable,
  deleteVariable,
  listApiKeys,
  createApiKey,
  deleteApiKey,
} from "./client.js";

const program = new Command();

program
  .name("enx")
  .description("CLI for enx — environment variable manager")
  .version("0.0.0");

program
  .command("login")
  .description("Save API endpoint and API key")
  .argument("<apiUrl>", "API base URL (e.g. https://enx.example.com)")
  .argument("<apiKey>", "API key")
  .action((apiUrl: string, apiKey: string) => {
    saveConfig({ apiUrl: apiUrl.replace(/\/$/, ""), apiKey });
    console.log("Saved credentials.");
  });

program
  .command("whoami")
  .description("Show current API endpoint")
  .action(() => {
    const config = loadConfig();
    console.log(`API URL: ${config.apiUrl}`);
    console.log(`API Key: ${config.apiKey ? config.apiKey.substring(0, 12) + "..." : "not set"}`);
  });

// ---- Projects ----

const projectsCmd = program.command("projects").description("Manage projects");

projectsCmd
  .command("list")
  .description("List all projects")
  .action(async () => {
    try {
      const { projects } = await listProjects();
      if (projects.length === 0) {
        console.log("No projects found.");
        return;
      }
      for (const p of projects) {
        console.log(`${p.name}  (created: ${p.createdAt})`);
      }
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

projectsCmd
  .command("create")
  .description("Create a project")
  .argument("<name>", "Project name")
  .action(async (name: string) => {
    try {
      const { project } = await createProject(name);
      console.log(`Created project: ${project.name} (${project.id})`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

projectsCmd
  .command("rename")
  .description("Rename a project")
  .argument("<name>", "Current project name")
  .argument("<newName>", "New project name")
  .action(async (name: string, newName: string) => {
    try {
      const { project } = await updateProject(name, newName);
      console.log(`Renamed to: ${project.name}`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

projectsCmd
  .command("delete")
  .description("Delete a project")
  .argument("<name>", "Project name")
  .action(async (name: string) => {
    try {
      const { project } = await deleteProject(name);
      console.log(`Deleted project: ${project.name}`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

// ---- Environments ----

const envsCmd = program.command("environments").description("Manage environments");

envsCmd
  .command("list")
  .description("List environments in a project")
  .argument("<project>", "Project name")
  .action(async (project: string) => {
    try {
      const { environments } = await listEnvironments(project);
      if (environments.length === 0) {
        console.log("No environments found.");
        return;
      }
      for (const e of environments) {
        console.log(`${e.name}  (created: ${e.createdAt})`);
      }
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

envsCmd
  .command("create")
  .description("Create an environment in a project")
  .argument("<project>", "Project name")
  .argument("<name>", "Environment name")
  .action(async (project: string, name: string) => {
    try {
      const { environment } = await createEnvironment(project, name);
      console.log(`Created environment: ${environment.name} (${environment.id})`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

envsCmd
  .command("rename")
  .description("Rename an environment")
  .argument("<project>", "Project name")
  .argument("<name>", "Current environment name")
  .argument("<newName>", "New environment name")
  .action(async (project: string, name: string, newName: string) => {
    try {
      const { environment } = await updateEnvironment(project, name, newName);
      console.log(`Renamed to: ${environment.name}`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

envsCmd
  .command("delete")
  .description("Delete an environment")
  .argument("<project>", "Project name")
  .argument("<name>", "Environment name")
  .action(async (project: string, name: string) => {
    try {
      const { environment } = await deleteEnvironment(project, name);
      console.log(`Deleted environment: ${environment.name}`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

// ---- Variables ----

const varsCmd = program.command("variables").description("Manage variables");

varsCmd
  .command("list")
  .description("List variables in an environment")
  .argument("<project>", "Project name")
  .argument("<environment>", "Environment name")
  .action(async (project: string, env: string) => {
    try {
      const { variables } = await listVariables(project, env);
      if (variables.length === 0) {
        console.log("No variables found.");
        return;
      }
      for (const row of variables) {
        console.log(`${row.variables.key}=${row.variables.value}  (id: ${row.variables.id})`);
      }
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

varsCmd
  .command("set")
  .description("Set a variable (creates or updates by key)")
  .argument("<project>", "Project name")
  .argument("<environment>", "Environment name")
  .argument("<key>", "Variable key")
  .argument("<value>", "Variable value")
  .action(async (project: string, env: string, key: string, value: string) => {
    try {
      const { variables } = await listVariables(project, env);
      const existing = variables.find((r) => r.variables.key === key);

      if (existing) {
        await updateVariable(project, env, existing.variables.id, { value });
        console.log(`Updated: ${key}=${value}`);
      } else {
        const { variables: created } = await createVariables(project, env, [{ key, value }]);
        console.log(`Created: ${created[0].key}=${created[0].value}  (id: ${created[0].id})`);
      }
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

varsCmd
  .command("delete")
  .description("Delete a variable by key")
  .argument("<project>", "Project name")
  .argument("<environment>", "Environment name")
  .argument("<key>", "Variable key")
  .action(async (project: string, env: string, key: string) => {
    try {
      const { variables } = await listVariables(project, env);
      const existing = variables.find((r) => r.variables.key === key);

      if (!existing) {
        console.error(`Variable "${key}" not found.`);
        process.exit(1);
      }

      await deleteVariable(project, env, existing.variables.id);
      console.log(`Deleted: ${key}`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

// ---- API Keys ----

const apiKeysCmd = program.command("api-keys").description("Manage API keys");

apiKeysCmd
  .command("list")
  .description("List API keys")
  .action(async () => {
    try {
      const { apiKeys } = await listApiKeys();
      if (apiKeys.length === 0) {
        console.log("No API keys found.");
        return;
      }
      for (const k of apiKeys) {
        const lastUsed = k.lastUsedAt ? `last used: ${k.lastUsedAt}` : "never used";
        console.log(`${k.name}  ${k.prefix}  (${lastUsed})  [${k.id}]`);
      }
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

apiKeysCmd
  .command("create")
  .description("Create an API key")
  .argument("<name>", "Key name")
  .action(async (name: string) => {
    try {
      const { apiKey } = await createApiKey(name);
      console.log(`Created API key: ${apiKey.name}`);
      console.log(`Key: ${apiKey.key}`);
      console.log(`Prefix: ${apiKey.prefix}`);
      console.log("Make sure to copy the key now — it won't be shown again.");
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

apiKeysCmd
  .command("delete")
  .description("Delete an API key")
  .argument("<id>", "API key ID")
  .action(async (id: string) => {
    try {
      const { apiKey } = await deleteApiKey(id);
      console.log(`Deleted API key: ${apiKey.name}`);
    } catch (e: any) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });

program.parse();
