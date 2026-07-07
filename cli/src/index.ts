#!/usr/bin/env node

import { handleAuth } from "./auth.ts";
import { handleProjects } from "./projects.ts";
import { usage } from "./usage.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
  usage()
  process.exit(1);
}

if (args[0] === "login" || args[0] === "signup") {
  await handleAuth(args);
  process.exit(0);
}

if (args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
  usage();
  process.exit(0);
}

await handleProjects(args);
process.exit(0);
