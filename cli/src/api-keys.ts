import { input, confirm } from "@inquirer/prompts";
import { apiFetch } from "./api.ts";
import { printTable } from "./format.ts";
import { apiKeyUsage } from "./usage.ts";

export const handleApiKeys = async (args: string[]) => {
  if (args.length === 0) {
    apiKeyUsage();
    process.exit(1);
  }

  if (args[0] === "create") {
    const name = await input({ message: "Enter API key name:", required: true });
    try {
      const res = await apiFetch<{
        apiKey: { name: string; prefix: string; key: string };
      }>("/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      printTable(
        [{ header: "Name" }, { header: "Prefix" }, { header: "Key" }],
        [{ name: res.data.apiKey.name, prefix: res.data.apiKey.prefix, key: res.data.apiKey.key }],
      );
      console.log(`Make sure to copy the key now. You won't be able to see it again.`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error creating API key: ${error.message}`);
      } else {
        console.error("Unknown error creating API key");
      }
    }
  } else if (args[0] === "list") {
    try {
      const res = await apiFetch<{
        apiKeys: { id: string; name: string; prefix: string; createdAt: string; lastUsedAt: string | null }[];
      }>("/api-keys", { method: "GET" });
      if (res.data.apiKeys.length === 0) {
        console.log("No API keys found.");
        return;
      }
      printTable(
        [{ header: "ID" }, { header: "Name" }, { header: "Prefix" }, { header: "Created" }, { header: "Last Used" }],
        res.data.apiKeys.map((k) => ({
          id: k.id,
          name: k.name,
          prefix: k.prefix,
          createdAt: k.createdAt,
          lastUsedAt: k.lastUsedAt ?? "never",
        })),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error listing API keys: ${error.message}`);
      } else {
        console.error("Unknown error listing API keys");
      }
    }
  } else if (args[0] === "delete") {
    const id = await input({ message: "Enter API key ID to delete:", required: true });
    const answer = await confirm({ message: `Are you sure you want to delete this API key?` });
    if (!answer) {
      console.log("Deletion cancelled.");
      return;
    }
    try {
      const res = await apiFetch<{
        apiKey: { id: string; name: string; prefix: string };
      }>(`/api-keys/${id}`, { method: "DELETE" });
      printTable(
        [{ header: "ID" }, { header: "Name" }, { header: "Prefix" }],
        [{ id: res.data.apiKey.id, name: res.data.apiKey.name, prefix: res.data.apiKey.prefix }],
      );
      console.log("API key deleted.");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error deleting API key: ${error.message}`);
      } else {
        console.error("Unknown error deleting API key");
      }
    }
  } else {
    apiKeyUsage();
    process.exit(1);
  }
};
