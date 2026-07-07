import { input } from "@inquirer/prompts";
import { readFileSync, writeFileSync } from "node:fs";
import { apiFetch } from "./api.ts";
import { printTable } from "./format.ts";
import { variableUsage } from "./usage.ts";

type VarArgs = {
  projectName: string;
  envName: string;
  action: string;
  file?: string;
};

export const handleVars = async (args: VarArgs) => {
  const { projectName, envName, action, file } = args;

  if (action === "create") {
    if (file) {
      try {
        const content = readFileSync(file, "utf-8");
        const variables = parseEnvFile(content);
        if (variables.length === 0) {
          console.error("No variables found in the file.");
          return;
        }
        const res = await apiFetch<{
          variables: { key: string; value: string }[];
        }>(`/projects/${projectName}/environments/${envName}/variables`, {
          method: "POST",
          body: JSON.stringify({ variables }),
        });
        printTable(
          [{ header: "Key" }, { header: "Value" }],
          res.data.variables.map((v) => ({ key: v.key, value: v.value })),
        );
        console.log(`Created/updated ${res.data.variables.length} variable(s) from file.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error creating variables from file: ${error.message}`);
        } else {
          console.error("Unknown error creating variables from file");
        }
      }
    } else {
      const key = await input({ message: "Enter variable key:", required: true });
      const value = await input({ message: "Enter variable value:" });
      try {
        const res = await apiFetch<{
          variables: { key: string; value: string }[];
        }>(`/projects/${projectName}/environments/${envName}/variables`, {
          method: "POST",
          body: JSON.stringify({ variables: [{ key, value }] }),
        });
        printTable(
          [{ header: "Key" }, { header: "Value" }],
          res.data.variables.map((v) => ({ key: v.key, value: v.value })),
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error creating variable: ${error.message}`);
        } else {
          console.error("Unknown error creating variable");
        }
      }
    }
  } else if (action === "list") {
    try {
      const res = await apiFetch<{
        variables: { key: string; value: string }[];
      }>(`/projects/${projectName}/environments/${envName}/variables`, { method: "GET" });
      printTable(
        [{ header: "Key" }, { header: "Value" }],
        res.data.variables.map((v) => ({ key: v.key, value: v.value })),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error listing variables: ${error.message}`);
      } else {
        console.error("Unknown error listing variables");
      }
    }
  } else if (action === "inject") {
    try {
      const res = await apiFetch<{
        variables: { key: string; value: string }[];
      }>(`/projects/${projectName}/environments/${envName}/variables`, { method: "GET" });
      for (const v of res.data.variables) {
        console.log(`export ${v.key}="${v.value}"`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching variables: ${error.message}`);
      } else {
        console.error("Unknown error fetching variables");
      }
    }
  } else if (action === "fetch") {
    try {
      const res = await apiFetch<{
        variables: { key: string; value: string }[];
      }>(`/projects/${projectName}/environments/${envName}/variables`, { method: "GET" });
      const lines = res.data.variables.map((v) => `${v.key}=${v.value}`);
      const output = lines.join("\n");
      if (file) {
        writeFileSync(file, output + "\n", "utf-8");
        console.log(`Variables written to ${file}`);
      } else {
        console.log(output);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching variables: ${error.message}`);
      } else {
        console.error("Unknown error fetching variables");
      }
    }
  } else {
    variableUsage();
    process.exit(1);
  }
};

function parseEnvFile(content: string): { key: string; value: string }[] {
  const variables: { key: string; value: string }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) {
      variables.push({ key, value });
    }
  }
  return variables;
}
