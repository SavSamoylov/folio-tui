import { join } from "path";
import { FOLIO_DIR } from "./fs";

export interface Config {
  theme: string;
}

const CONFIG_PATH = join(FOLIO_DIR, "config.json");

export async function loadConfig(): Promise<Config> {
  try {
    const text = await Bun.file(CONFIG_PATH).text();
    return { theme: "default", ...JSON.parse(text) };
  } catch {
    const defaults: Config = { theme: "default" };
    await saveConfig(defaults);
    return defaults;
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}
