#!/usr/bin/env node

import { handleProjects } from "./projects.ts";
import { projectUsage, usage } from "./usage.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
  usage()
  process.exit(1);
}

if (args[0] === "project") {
  await handleProjects(args.slice(1));
  process.exit(0);
}
