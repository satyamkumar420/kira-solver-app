import { app, BrowserWindow } from "electron";
import { windowManager } from "./windowManager";
import {
  registerShortcuts,
  unregisterShortcuts,
  registerTabShortcuts,
} from "../features/shortcuts";
import { registerApiHandlers } from "../api";
import { disableConsole } from "./consoleDisabler";
import { registerIpcHandlers } from "../ipc/handlers";

/**
 * 🚪 Ensures only one instance of the app is running.
 * If another instance is opened, it focuses the existing window.
 */
function handleSingleInstanceLock() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return false;
  }

  app.on("second-instance", () => {
    const win = windowManager.getWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  return true;
}

/**
 * 🎧 Sets up all the application-level event listeners.
 */
function registerAppEventListeners() {
  app.on("window-all-closed", () => {
    // On macOS it's common to stay active until the user quits explicitly
    if (process.platform !== "darwin") {
      unregisterShortcuts();
      app.quit();
    }
  });

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createWindow();
    }
  });
}

/**
 * 🚀 Initializes the application, sets up listeners, and creates the main window.
 */
export function initializeApp() {
  // 🔒 Disable hardware acceleration for enhanced performance & security
  app.disableHardwareAcceleration();

  if (!handleSingleInstanceLock()) {
    return;
  }

  registerAppEventListeners();

  app.whenReady().then(() => {
    const win = windowManager.createWindow();
    disableConsole(win);
    registerShortcuts(win);
    registerTabShortcuts(win);
    registerApiHandlers();
    registerIpcHandlers(win);
  });
}
