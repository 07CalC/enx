import { execFile } from "node:child_process";
import { readdir } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve();
const cwd = path.join(projectRoot, "apps/api");
const migrationsDir = path.resolve(cwd, "migrations");

console.log(`Running migrations from ${migrationsDir}`);

const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  const migration = path.join(migrationsDir, file);

  console.log(`→ Running ${file}`);

  await execFileAsync(
    "wrangler",
    ["d1", "execute", "enx", `--file=${migration}`],
    {
      stdio: "inherit",
      cwd: cwd
    },
  );

  console.log(`✓ Applied ${file}`);
}

console.log("✓ All migrations applied");
