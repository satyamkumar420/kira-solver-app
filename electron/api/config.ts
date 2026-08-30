import { app } from "electron";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

export interface AppConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

const DEFAULT_CONFIG: AppConfig = {
  baseURL: process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.VITE_API_KEY || process.env.API_KEY || "",
  model: process.env.VITE_AI_MODEL || "gpt-4o",
};

function getSettingsFilePath(): string {
  try {
    const userDataPath = app.getPath("userData");
    return path.join(userDataPath, "kira_settings.json");
  } catch {
    return path.join(process.cwd(), "kira_settings.json");
  }
}

let cachedConfig: AppConfig | null = null;

/**
 * 📖 Loads application configuration from persistent storage or default fallback.
 */
export function getConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const filePath = getSettingsFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(rawData);
      cachedConfig = {
        baseURL: (parsed.baseURL || DEFAULT_CONFIG.baseURL).trim(),
        apiKey: (parsed.apiKey || DEFAULT_CONFIG.apiKey).trim(),
        model: (parsed.model || DEFAULT_CONFIG.model).trim(),
      };
      return cachedConfig;
    }
  } catch (error) {
    console.error("Error reading config file, using defaults:", error);
  }

  cachedConfig = { ...DEFAULT_CONFIG };
  return cachedConfig;
}

/**
 * 💾 Saves updated configuration to persistent storage.
 */
export function saveConfig(updates: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const updated: AppConfig = {
    baseURL: (updates.baseURL !== undefined ? updates.baseURL : current.baseURL).trim(),
    apiKey: (updates.apiKey !== undefined ? updates.apiKey : current.apiKey).trim(),
    model: (updates.model !== undefined ? updates.model : current.model).trim(),
  };

  cachedConfig = updated;

  const filePath = getSettingsFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving config file:", error);
  }

  return updated;
}

/**
 * 🔄 Creates and returns an OpenAI client instance using current configuration.
 */
export function getOpenAIClient(): OpenAI {
  const config = getConfig();
  return new OpenAI({
    baseURL: config.baseURL || "https://api.openai.com/v1",
    apiKey: config.apiKey || "sk-dummy-key-to-prevent-sdk-constructor-error",
  });
}

/**
 * 📡 Fetches available models from OpenAI compatible endpoint.
 */
export async function fetchAvailableModels(
  customBaseURL?: string,
  customApiKey?: string
): Promise<{ success: boolean; models: string[]; error?: string }> {
  const config = getConfig();
  const baseURL = (customBaseURL || config.baseURL || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
  const apiKey = (customApiKey !== undefined ? customApiKey : config.apiKey).trim();

  if (!apiKey) {
    return {
      success: false,
      models: [],
      error: "API Key is required to fetch models.",
    };
  }

  try {
    const client = new OpenAI({
      baseURL,
      apiKey,
    });

    const response = await client.models.list();
    const modelIds: string[] = [];

    for await (const model of response) {
      if (model?.id) {
        modelIds.push(model.id);
      }
    }

    // Sort models alphabetically for easy searching
    modelIds.sort((a, b) => a.localeCompare(b));

    return {
      success: true,
      models: modelIds,
    };
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number };
    console.error("Failed to fetch models:", errorObj);
    return {
      success: false,
      models: [],
      error: errorObj.message || `Failed to fetch models (Status: ${errorObj.status || "Unknown"})`,
    };
  }
}

// 🤖 Centralized API Configuration with dynamic getters
export const API_CONFIG = {
  get baseURL() {
    return getConfig().baseURL;
  },
  get apiKey() {
    return getConfig().apiKey;
  },
  get models() {
    const model = getConfig().model;
    return {
      default: model,
      chat: model,
    };
  },
};

