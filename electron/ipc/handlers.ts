import { ipcMain, BrowserWindow } from "electron";
import { handleOpenaiChatCompletion } from "../api/chat";
import { getConfig, saveConfig, fetchAvailableModels } from "../api/config";
import { windowManager } from "../core/windowManager";
import {
  registerTabShortcuts,
  unregisterTabShortcuts,
} from "../features/shortcuts";
import { IPC_CHANNELS } from "../constants/ipcChannels";

/**
 * 📞 Registers all IPC event handlers.
 */
export function registerIpcHandlers(win: BrowserWindow) {
  // 🖥️ Show the main window
  ipcMain.on(IPC_CHANNELS.SHOW_WINDOW, () => {
    const activeWin = windowManager.getWindow();
    if (activeWin) {
      activeWin.show();
      activeWin.focus();
    }
  });

  // 🚪 Close the main window
  ipcMain.on(IPC_CHANNELS.CLOSE_WINDOW, () => {
    const activeWin = windowManager.getWindow();
    if (activeWin) {
      activeWin.close();
    }
  });

  // 📏 Resize the main window
  ipcMain.on(IPC_CHANNELS.RESIZE_WINDOW, (event, { height }) => {
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    if (senderWin) {
      const [width] = senderWin.getSize();
      senderWin.setSize(width, height);
    }
  });

  // 🤖 Handle OpenAI chat completions
  ipcMain.handle(
    IPC_CHANNELS.CHAT_OPENAI_COMPLETION,
    handleOpenaiChatCompletion
  );

  // 🎟️ Handle getting token (Return local mock token)
  ipcMain.handle(IPC_CHANNELS.GET_TOKEN, async () => "local-token");

  // 👤 Handle getting user data (Return guest profile)
  ipcMain.handle(IPC_CHANNELS.GET_USER_DATA, async () => ({
    name: "Guest User",
    email: "guest@local",
    image: null,
  }));

  // 💰 Handle getting credits (Return infinite balance)
  ipcMain.handle(IPC_CHANNELS.GET_CREDITS, async () => 999999);

  // ⚙️ Settings handlers
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
    return getConfig();
  });

  ipcMain.handle(
    IPC_CHANNELS.SAVE_SETTINGS,
    async (_event, settings: { baseURL?: string; apiKey?: string; model?: string }) => {
      return saveConfig(settings);
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.FETCH_MODELS,
    async (_event, { baseURL, apiKey }: { baseURL?: string; apiKey?: string }) => {
      return fetchAvailableModels(baseURL, apiKey);
    }
  );

  // 🎧 Listen for shortcut toggle events
  ipcMain.on(
    IPC_CHANNELS.TOGGLE_SHORTCUTS,
    (_event, { enabled }: { enabled: boolean }) => {
      if (enabled) {
        registerTabShortcuts(win);
      } else {
        unregisterTabShortcuts();
      }
    }
  );
}
