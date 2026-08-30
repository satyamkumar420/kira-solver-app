import React, { useState, useEffect } from "react";
import {
  SettingsIcon,
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckIcon,
  SparklesIcon,
  LoadingSpinner,
} from "./Icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_VISION_MODELS = [
  { id: "gpt-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", provider: "OpenAI" },
  { id: "gemini-2.5-flash", provider: "Google / Router" },
  { id: "google/gemini-2.5-flash", provider: "OpenRouter" },
  { id: "anthropic/claude-3.5-sonnet", provider: "OpenRouter" },
  { id: "qwen/qwen-2.5-vl-72b-instruct", provider: "OpenRouter / Groq" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [baseURL, setBaseURL] = useState("https://api.openai.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o");

  const [showApiKey, setShowApiKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Load existing settings when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setStatusMessage(null);
    if (window.electronAPI?.settings) {
      window.electronAPI.settings
        .getSettings()
        .then((cfg) => {
          if (cfg) {
            if (cfg.baseURL) setBaseURL(cfg.baseURL);
            if (cfg.apiKey) setApiKey(cfg.apiKey);
            if (cfg.model) setModel(cfg.model);
          }
        })
        .catch((err) => {
          console.error("Failed to load settings:", err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchModels = async () => {
    if (!apiKey.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter an API Key first before fetching models.",
      });
      return;
    }

    setIsFetchingModels(true);
    setStatusMessage(null);

    try {
      if (window.electronAPI?.settings) {
        const res = await window.electronAPI.settings.fetchModels({
          baseURL: baseURL.trim(),
          apiKey: apiKey.trim(),
        });

        if (res.success && res.models && res.models.length > 0) {
          setAvailableModels(res.models);
          setStatusMessage({
            type: "success",
            text: `Successfully fetched ${res.models.length} models! Select from the list or type custom.`,
          });
        } else {
          setAvailableModels([]);
          setStatusMessage({
            type: "error",
            text: res.error || "Failed to fetch models from endpoint. You can manually enter your model name below.",
          });
        }
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || "Failed to connect to endpoint.";
      setStatusMessage({
        type: "error",
        text: `${errorMsg} (You can still enter a custom model manually)`,
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSave = async () => {
    if (!model.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please select or type a model name.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (window.electronAPI?.settings) {
        await window.electronAPI.settings.saveSettings({
          baseURL: baseURL.trim(),
          apiKey: apiKey.trim(),
          model: model.trim(),
        });

        setStatusMessage({
          type: "success",
          text: "Settings saved successfully! Ready to solve problems.",
        });

        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || "Failed to save settings.";
      setStatusMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setBaseURL("https://api.openai.com/v1");
    setModel("gpt-4o");
    setStatusMessage({
      type: "info",
      text: "Reset to OpenAI defaults. Remember to save.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                OpenAI-Compatible AI Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure your API Base URL, API Key, and Vision Model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Important Vision Notice Box */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs leading-relaxed">
            <AlertTriangleIcon className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">
                ⚠️ Important / महत्वपूर्ण नोट:
              </span>{" "}
              Please select or enter a <strong>Vision-capable model</strong> (such as{" "}
              <code className="bg-amber-950/70 text-amber-300 px-1 py-0.5 rounded border border-amber-800/40">
                gpt-4o
              </code>
              ,{" "}
              <code className="bg-amber-950/70 text-amber-300 px-1 py-0.5 rounded border border-amber-800/40">
                gpt-4o-mini
              </code>
              ,{" "}
              <code className="bg-amber-950/70 text-amber-300 px-1 py-0.5 rounded border border-amber-800/40">
                gemini-2.5-flash
              </code>
              ,{" "}
              <code className="bg-amber-950/70 text-amber-300 px-1 py-0.5 rounded border border-amber-800/40">
                claude-3.5-sonnet
              </code>
              , or{" "}
              <code className="bg-amber-950/70 text-amber-300 px-1 py-0.5 rounded border border-amber-800/40">
                qwen-vl
              </code>
              ) so Kira Solver can read and solve questions from screenshots.
            </div>
          </div>

          {/* Base URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              API Base URL
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Supports OpenAI, OpenRouter (
              <code className="text-slate-300">https://openrouter.ai/api/v1</code>
              ), Groq, DeepSeek, Local Ollama, ByNara, or any OpenAI-compatible provider.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full pl-3.5 pr-11 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                title={showApiKey ? "Hide API Key" : "Show API Key"}
              >
                {showApiKey ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Model Selection & Auto-fetch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">
                Model Name / Selection
              </label>
              <button
                type="button"
                onClick={handleFetchModels}
                disabled={isFetchingModels}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 disabled:text-slate-500 transition-colors cursor-pointer"
                title="Fetch available models from your API provider"
              >
                {isFetchingModels ? (
                  <LoadingSpinner className="w-3.5 h-3.5" />
                ) : (
                  <RefreshCwIcon className="w-3.5 h-3.5" />
                )}
                <span>{isFetchingModels ? "Fetching..." : "Auto-fetch Models"}</span>
              </button>
            </div>

            {/* If models were fetched, show dropdown */}
            {availableModels.length > 0 && (
              <div className="space-y-1">
                <select
                  value={availableModels.includes(model) ? model : "custom"}
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      setModel(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="custom">-- Choose from fetched models ({availableModels.length}) --</option>
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Model Input (Always editable right here) */}
            <div className="space-y-1">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. gpt-4o, gemini-2.5-flash, etc."
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-400">
                You can directly type or edit any custom model ID here.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Quick Vision Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_VISION_MODELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setModel(item.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      model === item.id
                        ? "bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <span className="font-mono">{item.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : statusMessage.type === "error"
                  ? "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  : "bg-blue-500/10 border border-blue-500/30 text-blue-300"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckIcon className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : statusMessage.type === "error" ? (
                <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              ) : (
                <SparklesIcon className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
          >
            Reset to Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="w-3.5 h-3.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
