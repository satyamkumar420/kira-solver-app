import React, { useEffect, useState, useCallback } from "react";
import { CloseIcon, LoadingSpinner } from "./Icons";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisContext } from "../contexts/AnalysisContext";

// 📸 Screenshot Interface
interface Screenshot {
  path: string;
  dataUrl: string;
}

// 🖼️ ScreenshotList Component
const ScreenshotList = ({
  screenshots,
  onRemove,
}: {
  screenshots: Screenshot[];
  onRemove: (index: number) => void;
}) => (
  <div className="grid grid-cols-4 gap-2 mb-4">
    {screenshots.map((screenshot, index) => (
      <div key={index} className="relative group">
        <img
          src={screenshot.dataUrl}
          alt={`Screenshot ${index + 1}`}
          className="w-full h-auto rounded-md shadow-lg"
        />
        <button
          onClick={() => onRemove(index)}
          className="absolute top-1 right-1 bg-slate-800/50 text-white rounded-full p-1 leading-none hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Remove screenshot"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
);

// 🖼️ ScreenshotManager Component
interface ScreenshotManagerProps {
  view: "code" | "mcq" | "chat";
}

export const ScreenshotManager: React.FC<ScreenshotManagerProps> = ({
  view,
}) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const { isLoading, startAnalysis, clearAnalysis } = useAnalysis(view);
  const { language } = useAnalysisContext();

  // 🚀 Analyze Screenshots
  const handleAnalyze = useCallback(() => {
    if (screenshots.length > 0 && !isLoading) {
      startAnalysis(screenshots, language);
      setScreenshots([]); // 🧹 Clear screenshots after starting analysis
    }
  }, [screenshots, isLoading, startAnalysis, language]);

  // 👂 Listen for events
  useEffect(() => {
    const handleScreenshot = (data: Screenshot) => {
      setScreenshots((prev) => (prev.length < 4 ? [...prev, data] : prev));
    };
    const handleAnalysis = () => handleAnalyze();
    const handleClearAll = () => {
      setScreenshots([]);
      clearAnalysis();
    };

    const unsubscribeScreenshot =
      window.electronAPI.screenshot.onScreenshot(handleScreenshot);
    const unsubscribeAnalyze =
      window.electronAPI.screenshot.onAnalyze(handleAnalysis);
    const unsubscribeClearAll = window.electronAPI.onClearAll(handleClearAll);

    return () => {
      unsubscribeScreenshot();
      unsubscribeAnalyze();
      unsubscribeClearAll();
    };
  }, [handleAnalyze, clearAnalysis]);

  const handleRemoveScreenshot = (indexToRemove: number) => {
    setScreenshots(screenshots.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex-shrink-0 p-4">
      {screenshots.length > 0 && (
        <div>
          <ScreenshotList
            screenshots={screenshots}
            onRemove={handleRemoveScreenshot}
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner className="text-indigo-200 animate-spin" />
            ) : (
              "Analyze"
            )}
            <span className="text-xs text-indigo-200">(Ctrl+Enter)</span>
          </button>
        </div>
      )}
    </div>
  );
};
