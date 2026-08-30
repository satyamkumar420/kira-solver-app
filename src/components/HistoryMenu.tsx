import React, { useState } from "react";
import { useAnalysisContext, type HistoryItemType, type HistoryItem } from "../contexts/AnalysisContext";
import { PlusIcon, TrashIcon, CodeIcon, FileQuestionIcon, ChatIcon } from "./Icons";

/**
 * 🕒 HistoryMenu Component
 * Displays past Code, MCQ, and Chat history sessions with filters and unified theme.
 */
export const HistoryMenu: React.FC = () => {
  const {
    history,
    loadHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
    startNewSession,
    analyses,
    activeTab,
  } = useAnalysisContext();

  const [selectedFilter, setSelectedFilter] = useState<"all" | HistoryItemType>("all");

  const currentId = analyses[activeTab]?.chatId;

  const filteredHistory = history.filter((item) => {
    if (selectedFilter === "all") return true;
    return item.type === selectedFilter;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return `Today, ${timeStr}`;
    }

    return `${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })}, ${timeStr}`;
  };

  const renderTypeBadge = (type: HistoryItemType) => {
    switch (type) {
      case "code":
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
            <CodeIcon className="w-2.5 h-2.5" /> Code
          </span>
        );
      case "mcq":
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            <FileQuestionIcon className="w-2.5 h-2.5" /> MCQ
          </span>
        );
      case "chat":
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
            <ChatIcon className="w-2.5 h-2.5" /> Chat
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/50 text-white p-4 rounded-lg shadow-lg w-96 mt-1 backdrop-blur-sm flex flex-col max-h-[460px]">
      {/* Header with New Session Button */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">History</h3>
          <span className="text-xs bg-slate-900/90 text-slate-400 px-2 py-0.5 rounded-md">
            {history.length}
          </span>
        </div>

        <button
          onClick={() => startNewSession()}
          className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
          title="Start fresh session (Ctrl + R)"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-2 bg-slate-950/40 p-1 rounded-md text-xs">
        {(["all", "code", "mcq", "chat"] as const).map((filter) => {
          const count =
            filter === "all"
              ? history.length
              : history.filter((h) => h.type === filter).length;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`flex-1 py-1 rounded transition-colors text-center capitalize font-medium cursor-pointer ${
                selectedFilter === filter
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {filter} <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto space-y-1 my-1 pr-1">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <ChatIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No history saved</p>
            <p className="text-xs text-slate-500 mt-1">
              Solutions and conversations will be saved here automatically.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredHistory.map((item: HistoryItem) => {
              const isActive = item.id === currentId;
              return (
                <li
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className={`p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-colors ${
                    isActive
                      ? "text-blue-400 bg-slate-900 border border-slate-800"
                      : "text-white hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      {renderTypeBadge(item.type)}
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.updatedAt || item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium truncate text-slate-200">
                      {item.title || "Analysis"}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-xs flex items-center gap-1.5">
            <kbd className="bg-slate-900/90 px-2 py-0.5 rounded text-slate-300">
              CTRL + R
            </kbd>{" "}
            New Session
          </span>
          <button
            onClick={() => clearAllHistory()}
            className="text-red-400 hover:text-red-300 text-xs hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
