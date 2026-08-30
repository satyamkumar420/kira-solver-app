import { desktopCapturer, screen } from "electron";
import { join } from "path";
import { tmpdir } from "os";
import { writeFile } from "fs";

/**
 * 📸 Takes a screenshot of the entire screen.
 * @returns {Promise<string>} A promise that resolves with the path to the saved screenshot.
 */
export async function takeScreenshot(): Promise<string> {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width, height },
  });

  const primarySource = sources.find(
    (source) => source.display_id === String(primaryDisplay.id)
  );

  if (!primarySource) {
    throw new Error("Primary display not found.");
  }

  const screenshotPath = join(tmpdir(), `screenshot-${Date.now()}.png`);

  return new Promise((resolve, reject) => {
    writeFile(screenshotPath, primarySource.thumbnail.toPNG(), (error) => {
      if (error) {
        return reject(error);
      }
      resolve(screenshotPath);
    });
  });
}
