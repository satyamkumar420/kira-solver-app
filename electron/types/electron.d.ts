// Define the type for the API exposed by the preload script
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
  images?: string[];
}

export interface IElectronAPI {
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]) => void;
    on: (channel: string, func: (...args: unknown[]) => void) => () => void;
    once: (channel: string, func: (...args: unknown[]) => void) => void;
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };
  toggleAlwaysOnTop: () => void;
  toggleContentProtection: () => void;
  showWindow: () => void;
  closeWindow: () => void;
  resizeWindow: (height: number) => void;
  toggleShortcuts: (enabled: boolean) => void;
  onClearAll: (callback: () => void) => () => void;
  onSwitchTab: (
    callback: (data: { direction: "next" | "previous" }) => void
  ) => () => void;
  chat: {
    sendChatMessage: (payload: {
      message: string;
      chatId: string;
      requestId: string;
    }) => Promise<void>;
    onChunk: (
      callback: (chunk: { content: string; requestId?: string }) => void
    ) => () => void;
    onError: (
      callback: (error: { error: string; requestId?: string }) => void
    ) => () => void;
    onEnd: (callback: (args: { requestId?: string }) => void) => () => void;
  };
  getCredits: () => Promise<number | null>;
  onCreditsUpdated: (callback: (credits: number) => void) => () => void;
  screenshot: {
    onScreenshot: (
      callback: (data: { path: string; dataUrl: string }) => void
    ) => () => void;
    analyzeScreenshots: (
      imagePaths: string[],
      view: "code" | "mcq" | "chat",
      requestId: string,
      language: string
    ) => Promise<void>;
    onAnalyze: (callback: () => void) => () => void;
  };
  settings: {
    getSettings: () => Promise<{ baseURL: string; apiKey: string; model: string }>;
    saveSettings: (settings: {
      baseURL?: string;
      apiKey?: string;
      model?: string;
    }) => Promise<{ baseURL: string; apiKey: string; model: string }>;
    fetchModels: (params?: {
      baseURL?: string;
      apiKey?: string;
    }) => Promise<{ success: boolean; models: string[]; error?: string }>;
  };
}

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void;
        on: (channel: string, func: (...args: unknown[]) => void) => () => void;
        once: (channel: string, func: (...args: unknown[]) => void) => void;
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      };
    };
    electronAPI: IElectronAPI;
  }
}
