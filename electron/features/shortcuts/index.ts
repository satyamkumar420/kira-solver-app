import { globalShortcut, BrowserWindow, screen, app } from "electron";
import { takeScreenshot } from "./screenshot";
import { readFile } from "fs/promises";
import { IPC_CHANNELS } from "../../constants/ipcChannels";
import { WINDOW_CONFIG } from "../../core/windowManager";

/**
 * 🪟 Moves the window in the given direction strictly maintaining 900x800 dimensions.
 */
const moveWindow = (
  win: BrowserWindow,
  direction: "up" | "down" | "left" | "right"
) => {
  if (!win || win.isDestroyed()) return;

  const step = 50; // 📜 Pixels to move with each key press
  const [currentX, currentY] = win.getPosition();
  const currentScreen = screen.getDisplayNearestPoint({
    x: currentX,
    y: currentY,
  });
  const { workArea } = currentScreen;

  const visibleMargin = 0.1; // 🖼️ 10% of the window should be visible

  let newX = currentX;
  let newY = currentY;

  switch (direction) {
    case "up":
      newY -= step;
      break;
    case "down":
      newY += step;
      break;
    case "left":
      newX -= step;
      break;
    case "right":
      newX += step;
      break;
  }

  // 🔒 Boundary checks to keep the window visible on screen
  const minVisibleWidth = WINDOW_CONFIG.width * visibleMargin;
  const minVisibleHeight = WINDOW_CONFIG.height * visibleMargin;

  newX = Math.max(workArea.x - WINDOW_CONFIG.width + minVisibleWidth, newX);
  newX = Math.min(workArea.x + workArea.width - minVisibleWidth, newX);
  newY = Math.max(workArea.y - WINDOW_CONFIG.height + minVisibleHeight, newY);
  newY = Math.min(workArea.y + workArea.height - minVisibleHeight, newY);

  const targetX = Math.round(newX);
  const targetY = Math.round(newY);

  // 🎯 Strictly lock coordinates and dimensions
  win.setBounds({
    x: targetX,
    y: targetY,
    width: WINDOW_CONFIG.width,
    height: WINDOW_CONFIG.height,
  });
  win.setContentSize(WINDOW_CONFIG.width, WINDOW_CONFIG.height);
};

const toggleWindow = (win: BrowserWindow) => {
  if (!win || win.isDestroyed()) return;
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
  }
};

export const registerShortcuts = (win: BrowserWindow) => {
  globalShortcut.unregisterAll();
  globalShortcut.register("CommandOrControl+Up", () => moveWindow(win, "up"));
  globalShortcut.register("CommandOrControl+Down", () =>
    moveWindow(win, "down")
  );
  globalShortcut.register("CommandOrControl+Left", () =>
    moveWindow(win, "left")
  );
  globalShortcut.register("CommandOrControl+Right", () =>
    moveWindow(win, "right")
  );
  globalShortcut.register("CommandOrControl+B", () => toggleWindow(win));
  globalShortcut.register("CommandOrControl+Q", () => app.quit());
  globalShortcut.register("CommandOrControl+R", () => {
    if (!win || win.isDestroyed()) return;
    win.webContents.send(IPC_CHANNELS.CLEAR_ALL);
  });
  globalShortcut.register("CommandOrControl+H", async () => {
    try {
      if (!win || win.isDestroyed()) return;
      const screenshotPath = await takeScreenshot();
      const imageBuffer = await readFile(screenshotPath);
      const imageBase64 = imageBuffer.toString("base64");
      win.webContents.send(IPC_CHANNELS.SCREENSHOT_TAKEN, {
        path: screenshotPath,
        dataUrl: `data:image/png;base64,${imageBase64}`,
      });
    } catch (error) {
      console.error("Failed to take screenshot:", error);
    }
  });
  globalShortcut.register("CommandOrControl+Enter", () => {
    if (!win || win.isDestroyed()) return;
    win.webContents.send(IPC_CHANNELS.ANALYZE_SCREENSHOTS);
  });
};

/**
 * 🔄 Registers global shortcuts for switching between tabs.
 */
export const registerTabShortcuts = (mainWindow: BrowserWindow) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const switchNext = () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.SWITCH_TAB, { direction: "next" });
    }
  };

  const switchPrevious = () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.SWITCH_TAB, {
        direction: "previous",
      });
    }
  };

  globalShortcut.register("CommandOrControl+Tab", switchNext);
  globalShortcut.register("CommandOrControl+T", switchNext);
  globalShortcut.register("CommandOrControl+Shift+Tab", switchPrevious);
  globalShortcut.register("CommandOrControl+Shift+T", switchPrevious);
};

/**
 * 🗑️ Unregisters global shortcuts for switching between tabs.
 */
export const unregisterTabShortcuts = () => {
  globalShortcut.unregister("CommandOrControl+Tab");
  globalShortcut.unregister("CommandOrControl+T");
  globalShortcut.unregister("CommandOrControl+Shift+Tab");
  globalShortcut.unregister("CommandOrControl+Shift+T");
};

export const unregisterShortcuts = () => {
  globalShortcut.unregisterAll();
};
