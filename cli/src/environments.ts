import { input, confirm } from "@inquirer/prompts";
import { apiFetch } from "./api.ts";
import { envUsage } from "./usage.ts";

type EnvArgs = {
  projectName: string;
  action: string;
  envName?: string;
};

export const handleEnv = async (args: EnvArgs) => {
  const { projectName, action, envName } = args;

  if (action === "create") {
    const name = await input({ message: "Enter environment name:", required: true });
    try {
      const res = await apiFetch<{
        environment: { id: string; name: string; createdAt: string };
      }>(`/projects/${projectName}/environments`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      console.log(`Environment created: ${res.data.environment.name} (ID: ${res.data.environment.id})`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error creating environment: ${error.message}`);
      } else {
        console.error("Unknown error creating environment");
      }
    }
  } else if (action === "list") {
    try {
      const res = await apiFetch<{
        environments: { id: string; name: string; createdAt: string }[];
      }>(`/projects/${projectName}/environments`, { method: "GET" });
      console.log(`Environments for ${projectName}:`);
      res.data.environments.forEach((env) => {
        console.log(`- ${env.name} (ID: ${env.id})`);
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error listing environments: ${error.message}`);
      } else {
        console.error("Unknown error listing environments");
      }
    }
  } else if (action === "update") {
    if (!envName) {
      console.error("Environment name is required.");
      process.exit(1);
    }
    const newName = await input({ message: "Enter new environment name:", required: true });
    try {
      const res = await apiFetch<{
        environment: { id: string; name: string; createdAt: string };
      }>(`/projects/${projectName}/environments/${envName}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      });
      console.log(`Environment updated: ${res.data.environment.name} (ID: ${res.data.environment.id})`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating environment: ${error.message}`);
      } else {
        console.error("Unknown error updating environment");
      }
    }
  } else if (action === "delete") {
    if (!envName) {
      console.error("Environment name is required.");
      process.exit(1);
    }
    const answer = await confirm({ message: `Are you sure you want to delete environment "${envName}"?` });
    if (!answer) {
      console.log("Deletion cancelled.");
      return;
    }
    try {
      const res = await apiFetch<{
        environment: { id: string; name: string; createdAt: string };
      }>(`/projects/${projectName}/environments/${envName}`, {
        method: "DELETE",
      });
      console.log(`Environment deleted: ${res.data.environment.name}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error deleting environment: ${error.message}`);
      } else {
        console.error("Unknown error deleting environment");
      }
    }
  } else {
    envUsage();
    process.exit(1);
  }
};
