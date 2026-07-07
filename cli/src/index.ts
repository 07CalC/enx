#!/usr/bin/env node

import { handleAuth } from "./auth.ts";
import { handleProjects } from "./projects.ts";
import { handleEnv } from "./environments.ts";
import { handleVars } from "./variables.ts";
import { handleApiKeys } from "./api-keys.ts";
import { setConfig } from "./config.ts";
import { usage } from "./usage.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
  usage()
  process.exit(1);
}

if (args[0] === "login" || args[0] === "signup" || args[0] === "logout") {
  await handleAuth(args);
  process.exit(0);
}

if (args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
  usage();
  process.exit(0);
}

if (args[0] === "config") {
  if (args[1] === "set" && args[2] === "url") {
    if (!args[3]) {
      console.error("Usage: enx config set url <url>");
      process.exit(1);
    }
    setConfig({ baseURL: args[3] });
    console.log(`API URL set to ${args[3]}`);
    process.exit(0);
  }
  if (args[1] === "set" && args[2] === "api-key") {
    if (!args[3]) {
      console.error("Usage: enx config set api-key <key>");
      process.exit(1);
    }
    setConfig({ apiKey: args[3] });
    console.log("API key saved to config.");
    process.exit(0);
  }
  console.error("Usage: enx config set url <url> | enx config set api-key <key>");
  process.exit(1);
}

if (args[0] === "api-key") {
  await handleApiKeys(args.slice(1));
  process.exit(0);
}

if (args[0] === "project") {
  await handleProjects(args.slice(1));
  process.exit(0);
}

function getOption(args: string[], name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

if (args.length >= 2 && args[1] === "env") {
  await handleEnv({ projectName: args[0]!, action: args[2] ?? "" });
  process.exit(0);
}

if (args.length >= 3 && args[2] === "var") {
  await handleVars({
    projectName: args[0]!,
    envName: args[1]!,
    action: args[3] ?? "",
    file: getOption(args.slice(3), "file"),
  });
  process.exit(0);
}

if (args.length >= 3 && ["update", "delete"].includes(args[2]!)) {
  await handleEnv({
    projectName: args[0]!,
    envName: args[1]!,
    action: args[2]!,
  });
  process.exit(0);
}

usage();
process.exit(1);
