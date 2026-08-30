import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import { IPC_CHANNELS } from "../constants/ipcChannels";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]) =>
      ipcRenderer.send(channel, ...args),
    on: (channel: string, func: (...args: unknown[]) => void) => {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once: (channel: string, func: (...args: unknown[]) => void) => {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
  },
  toggleAlwaysOnTop: () => ipcRenderer.send(IPC_CHANNELS.TOGGLE_ALWAYS_ON_TOP),
  toggleContentProtection: () =>
    ipcRenderer.send(IPC_CHANNELS.TOGGLE_CONTENT_PROTECTION),
  showWindow: () => ipcRenderer.send(IPC_CHANNELS.SHOW_WINDOW),
  closeWindow: () => ipcRenderer.send(IPC_CHANNELS.CLOSE_WINDOW),
  resizeWindow: (height: number) =>
    ipcRenderer.send(IPC_CHANNELS.RESIZE_WINDOW, { height }),
  toggleShortcuts: (enabled: boolean) =>
    ipcRenderer.send(IPC_CHANNELS.TOGGLE_SHORTCUTS, { enabled }),
  onClearAll: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.CLEAR_ALL, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CLEAR_ALL, handler);
  },
  onSwitchTab: (
    callback: (data: { direction: "next" | "previous" }) => void
  ) => {
    const handler = (
      _event: IpcRendererEvent,
      data: { direction: "next" | "previous" }
    ) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.SWITCH_TAB, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SWITCH_TAB, handler);
  },
  chat: {
    sendChatMessage: (payload: {
      message: string;
      chatId: string;
      requestId: string;
    }) => ipcRenderer.invoke(IPC_CHANNELS.CHAT_OPENAI_COMPLETION, payload),

    onChunk: (
      callback: (chunk: { content: string; requestId?: string }) => void
    ) => {
      const handler = (
        _event: IpcRendererEvent,
        chunk: { content: string; requestId?: string }
      ) => callback(chunk);
      ipcRenderer.on(IPC_CHANNELS.CHAT_CHUNK, handler);
      return () =>
        ipcRenderer.removeListener(IPC_CHANNELS.CHAT_CHUNK, handler);
    },
    onError: (
      callback: (error: { error: string; requestId?: string }) => void
    ) => {
      const handler = (
        _event: IpcRendererEvent,
        error: { error: string; requestId?: string }
      ) => callback(error);
      ipcRenderer.on(IPC_CHANNELS.CHAT_ERROR, handler);
      return () =>
        ipcRenderer.removeListener(IPC_CHANNELS.CHAT_ERROR, handler);
    },
    onEnd: (callback: (args: { requestId?: string }) => void) => {
      const handler = (
        _event: IpcRendererEvent,
        args: { requestId?: string }
      ) => callback(args);
      ipcRenderer.on(IPC_CHANNELS.CHAT_END, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.CHAT_END, handler);
    },
  },
  getCredits: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CREDITS),
  onCreditsUpdated: (callback: (credits: number) => void) => {
    const handler = (_event: IpcRendererEvent, credits: number) =>
      callback(credits);
    ipcRenderer.on(IPC_CHANNELS.CREDITS_UPDATED, handler);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.CREDITS_UPDATED, handler);
  },
  screenshot: {
    onScreenshot: (
      callback: (data: { path: string; dataUrl: string }) => void
    ) => {
      const handler = (
        _event: IpcRendererEvent,
        data: { path: string; dataUrl: string }
      ) => callback(data);
      ipcRenderer.on(IPC_CHANNELS.SCREENSHOT_TAKEN, handler);
      return () =>
        ipcRenderer.removeListener(IPC_CHANNELS.SCREENSHOT_TAKEN, handler);
    },
    analyzeScreenshots: (
      imagePaths: string[],
      view: "code" | "mcq" | "chat",
      requestId: string,
      language: string
    ) => {
      return ipcRenderer.invoke(IPC_CHANNELS.ANALYZE_SCREENSHOTS, {
        imagePaths,
        view,
        requestId,
        language,
      });
    },
    onAnalyze: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on(IPC_CHANNELS.ANALYZE_SCREENSHOTS, handler);
      return () =>
        ipcRenderer.removeListener(IPC_CHANNELS.ANALYZE_SCREENSHOTS, handler);
    },
  },
  settings: {
    getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
    saveSettings: (settings: { baseURL?: string; apiKey?: string; model?: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
    fetchModels: (params?: { baseURL?: string; apiKey?: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.FETCH_MODELS, params || {}),
  },
});
