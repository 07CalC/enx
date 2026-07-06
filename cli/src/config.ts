import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".config", "enx");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

type Config = {
  apiUrl: string;
  apiKey: string;
};

function defaultConfig(): Config {
  return { apiUrl: "http://localhost:8787", apiKey: "" };
}

export function loadConfig(): Config {
  try {
    if (!existsSync(CONFIG_PATH)) return defaultConfig();
    const data = readFileSync(CONFIG_PATH, "utf-8");
    return { ...defaultConfig(), ...JSON.parse(data) };
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
