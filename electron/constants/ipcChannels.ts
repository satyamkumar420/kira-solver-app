/**
 * 📡 Centralized IPC Channel Constants
 * Ensures type safety and avoids magic string mismatches between Main and Renderer processes.
 */
export const IPC_CHANNELS = {
  // Window controls
  SHOW_WINDOW: "show-window",
  CLOSE_WINDOW: "close-window",
  RESIZE_WINDOW: "resize-window",
  TOGGLE_ALWAYS_ON_TOP: "toggle-always-on-top",
  TOGGLE_CONTENT_PROTECTION: "toggle-content-protection",
  TOGGLE_SHORTCUTS: "toggle-shortcuts",

  // Global events
  CLEAR_ALL: "clear-all",
  SWITCH_TAB: "switch-tab",

  // Chat & AI Completions
  CHAT_COMPLETION: "chat:completion",
  CHAT_OPENAI_COMPLETION: "chat:openai-completion",
  CHAT_CHUNK: "chat:completion-chunk",
  CHAT_ERROR: "chat:completion-error",
  CHAT_END: "chat:completion-end",

  // Screenshots & Vision Analysis
  SCREENSHOT_TAKEN: "screenshot-taken",
  ANALYZE_SCREENSHOTS: "analyze-screenshots",

  // Settings & Configuration
  GET_SETTINGS: "settings:get",
  SAVE_SETTINGS: "settings:save",
  FETCH_MODELS: "settings:fetch-models",

  // Credits & Profile
  GET_CREDITS: "get-credits",
  CREDITS_UPDATED: "credits-updated",
  GET_TOKEN: "get-token",
  GET_USER_DATA: "get-user-data",
  START_AUTH: "start-auth",
  LOGOUT: "logout",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
