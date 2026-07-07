import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";

export const CONFIG_FILE_PATH = `${homedir()}/.config/enx/config.json`

const defaultConfig = {
  baseURL: "http://localhost:8787",
}

type Config = {
  baseURL: string;
  token?: string;
  apiKey?: string;
}

const readConfig = (): Config => {
  try {
    const configFile = readFileSync(CONFIG_FILE_PATH, "utf-8");
    return JSON.parse(configFile) as Config;
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return defaultConfig;
    } else {
      throw error;
    }
  }
}

const writeConfig = (config: Config) => {
  const configDir = `${homedir()}/.config/enx`;
  try {
    mkdirSync(configDir, { recursive: true });
    writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing config file:", error);
  }
}

export const getConfig = (): Config => {
  return readConfig();
}

export const setConfig = (newConfig: Partial<Config>) => {
  const currentConfig = readConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  writeConfig(updatedConfig);
}
