import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { unregisterShortcuts } from "../features/shortcuts";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const WINDOW_CONFIG = {
  width: 900,
  height: 800,
} as const;

/**
 * 🧑‍💼 Manages the application's main window.
 */
class WindowManager {
  private win: BrowserWindow | null = null;

  /**
   * 🪟 Creates and configures the main browser window.
   * @returns {BrowserWindow} The created browser window instance.
   */
  public createWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: WINDOW_CONFIG.width,
      height: WINDOW_CONFIG.height,
      useContentSize: true,
      hasShadow: false,
      transparent: true,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      icon: path.join(__dirname, "../assets/logo.ico"),
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    this.win.setMenu(null);
    this.win.setMenuBarVisibility(false);
    this.win.setAlwaysOnTop(true, "screen-saver");
    this.win.setContentProtection(true);

    // 🔒 Lock zoom levels so UI never expands or scales
    this.win.webContents.setVisualZoomLevelLimits(1, 1);
    this.win.webContents.setZoomFactor(1.0);
    this.win.webContents.on("zoom-changed", (event) => {
      event.preventDefault();
    });

    // Load the index.html of the app.
    if (process.env.VITE_DEV_SERVER_URL) {
      this.win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      const indexPath = path.join(app.getAppPath(), "dist", "index.html");
      this.win.loadFile(indexPath);
    }

    this.win.on("closed", () => {
      this.win = null;
      unregisterShortcuts();
    });

    return this.win;
  }

  /**
   * 🎯 Returns the active BrowserWindow instance.
   * @returns {BrowserWindow | null} The window instance or null if it doesn't exist.
   */
  public getWindow(): BrowserWindow | null {
    return this.win;
  }
}

export const windowManager = new WindowManager();
