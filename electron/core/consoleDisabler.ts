import { BrowserWindow } from "electron";

/**
 * 🔒 Disables DevTools and browser zoom shortcuts in the given BrowserWindow.
 * @param win The BrowserWindow instance to protect.
 */
export function disableConsole(win: BrowserWindow) {
  win.webContents.on("before-input-event", (event, input) => {
    const isDevToolsShortcut =
      (input.control && input.shift && input.key.toLowerCase() === "i") || // CTRL+SHIFT+I
      (input.control && input.key.toLowerCase() === "i") || // CTRL+I
      (input.meta && input.alt && input.key.toLowerCase() === "i") || // CMD+OPTION+I
      (input.meta && input.key.toLowerCase() === "i") || // CMD+I
      input.key === "F12";

    const isZoomShortcut =
      (input.control || input.meta) &&
      (input.key === "=" ||
        input.key === "+" ||
        input.key === "-" ||
        input.key === "_" ||
        input.key === "0");

    if (isDevToolsShortcut || isZoomShortcut) {
      event.preventDefault();
    }
  });
}
