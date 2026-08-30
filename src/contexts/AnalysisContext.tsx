import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage } from "../../electron/types/electron";

export type HistoryItemType = "code" | "mcq" | "chat";

// 🔬 Analysis State Interface
interface AnalysisState {
  analysis: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentRequestId: string | null;
  chatId?: string;
}

// 💬 Saved Session in History (Supports Code, MCQ, and Chat)
export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  createdAt: number;
  updatedAt: number;
  language?: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = "kira_solver_unified_history";

// 📑 Analysis Context Interface
interface AnalysisContextType {
  analyses: Record<string, AnalysisState>;
  setAnalysisState: (
    view: string,
    state:
      | Partial<AnalysisState>
      | ((prevState: AnalysisState) => Partial<AnalysisState>)
  ) => void;
  clearAnalysis: (view: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  activeTab: HistoryItemType;
  setActiveTab: (tab: HistoryItemType) => void;
  // 🕒 Unified History actions
  history: HistoryItem[];
  saveToHistory: (
    type: HistoryItemType,
    id: string,
    messages: ChatMessage[],
    language?: string
  ) => void;
  loadHistoryItem: (item: HistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  clearAllHistory: () => void;
  startNewSession: (type?: HistoryItemType) => void;
}

// ✨ Create Analysis Context
const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

// 🏷️ Helper to extract a friendly title based on content type
const generateTitle = (
  type: HistoryItemType,
  messages: ChatMessage[],
  language?: string
): string => {
  if (!messages || messages.length === 0) return `${type.toUpperCase()} Analysis`;

  if (type === "chat") {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg && typeof firstUserMsg.content === "string") {
      return (
        firstUserMsg.content.slice(0, 35).trim() +
        (firstUserMsg.content.length > 35 ? "..." : "")
      );
    }
    return "Chat Session";
  }

  if (type === "code") {
    try {
      const fullText = messages.map((m) => m.content).join("");
      const cleaned = fullText.replace(/```json\s*|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.optimized?.thoughts?.[0]) {
        const thought = parsed.optimized.thoughts[0];
        return (
          thought.slice(0, 35).trim() +
          (thought.length > 35 ? "..." : "") +
          ` (${language || "Code"})`
        );
      }
    } catch {
      return `Code Solution (${language || "DSA"})`;
    }
    return `Code Solution (${language || "DSA"})`;
  }

  if (type === "mcq") {
    try {
      const fullText = messages.map((m) => m.content).join("");
      const cleaned = fullText.replace(/```json\s*|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      if (first?.question) {
        return (
          first.question.slice(0, 35).trim() +
          (first.question.length > 35 ? "..." : "")
        );
      }
    } catch {
      return "MCQ Solution";
    }
    return "MCQ Solution";
  }

  return `${type.toUpperCase()} Analysis`;
};

// 📦 AnalysisProvider Component
export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analyses, setAnalyses] = useState<Record<string, AnalysisState>>({});
  const [language, setLanguage] = useState("Python");
  const [activeTab, setActiveTab] = useState<HistoryItemType>("code");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      // Fallback: check legacy chat storage key
      const legacyChat = localStorage.getItem("kira_solver_chat_history");
      if (legacyChat) {
        const legacyItems = JSON.parse(legacyChat);
        return legacyItems.map((item: Record<string, unknown>) => ({
          ...item,
          type: "chat" as HistoryItemType,
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // 💾 Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to storage:", e);
    }
  }, [history]);

  // 🔄 Set analysis state for a view
  const setAnalysisState = useCallback(
    (
      view: string,
      state:
        | Partial<AnalysisState>
        | ((prevState: AnalysisState) => Partial<AnalysisState>)
    ) => {
      setAnalyses((prev) => {
        const currentView = prev[view] || {
          analysis: [],
          isLoading: false,
          error: null,
          currentRequestId: null,
        };
        const newState =
          typeof state === "function" ? state(currentView) : state;
        return {
          ...prev,
          [view]: {
            ...currentView,
            ...newState,
          },
        };
      });
    },
    []
  );

  // 🧹 Clear analysis for a view
  const clearAnalysis = useCallback((view: string) => {
    setAnalyses((prev) => ({
      ...prev,
      [view]: {
        analysis: [],
        isLoading: false,
        error: null,
        currentRequestId: null,
      },
    }));
  }, []);

  // 💾 Save or update any item (Code, MCQ, Chat) in history
  const saveToHistory = useCallback(
    (
      type: HistoryItemType,
      id: string,
      messages: ChatMessage[],
      lang?: string
    ) => {
      if (!id || !messages || messages.length === 0) return;

      setHistory((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === id);
        const title = generateTitle(type, messages, lang);
        const now = Date.now();

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            type,
            title,
            updatedAt: now,
            language: lang || updated[existingIndex].language,
            messages: [...messages],
          };
          return updated.sort((a, b) => b.updatedAt - a.updatedAt);
        }

        const newItem: HistoryItem = {
          id,
          type,
          title,
          createdAt: now,
          updatedAt: now,
          language: lang,
          messages: [...messages],
        };
        return [newItem, ...prev];
      });
    },
    []
  );

  // 📖 Load an existing history item into its respective view
  const loadHistoryItem = useCallback(
    (item: HistoryItem) => {
      setActiveTab(item.type);
      if (item.language) {
        setLanguage(item.language);
      }
      setAnalysisState(item.type, {
        chatId: item.id,
        analysis: [...item.messages],
        isLoading: false,
        error: null,
        currentRequestId: null,
      });
    },
    [setAnalysisState]
  );

  // 🗑️ Delete a single item from history
  const deleteHistoryItem = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((s) => s.id !== id));

      // Reset active view if currently viewing deleted item
      setAnalyses((prev) => {
        const updated = { ...prev };
        for (const view of ["code", "mcq", "chat"]) {
          if (updated[view]?.chatId === id) {
            updated[view] = {
              analysis: [],
              isLoading: false,
              error: null,
              currentRequestId: null,
              chatId: uuidv4(),
            };
          }
        }
        return updated;
      });
    },
    []
  );

  // 🧹 Clear all history
  const clearAllHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("kira_solver_chat_history");
    } catch (e) {
      console.error("Failed to clear history from storage:", e);
    }
  }, []);

  // 🆕 Start a new fresh session
  const startNewSession = useCallback(
    (type: HistoryItemType = activeTab) => {
      setAnalyses((prev) => {
        const current = prev[type];
        if (current?.chatId && current.analysis && current.analysis.length > 0) {
          saveToHistory(type, current.chatId, current.analysis, language);
        }

        return {
          ...prev,
          [type]: {
            analysis: [],
            isLoading: false,
            error: null,
            currentRequestId: null,
            chatId: uuidv4(),
          },
        };
      });
    },
    [activeTab, language, saveToHistory]
  );

  return (
    <AnalysisContext.Provider
      value={{
        analyses,
        setAnalysisState,
        clearAnalysis,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        history,
        saveToHistory,
        loadHistoryItem,
        deleteHistoryItem,
        clearAllHistory,
        startNewSession,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error(
      "useAnalysisContext must be used within an AnalysisProvider"
    );
  }
  return context;
};
