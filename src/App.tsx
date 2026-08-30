import React from "react";
import { Toolbar } from "./components/Toolbar";
import { Tabs } from "./components/Tabs";
import { HeaderLogo } from "./components/HeaderLogo";
import { CodeView } from "./views/CodeView";
import { McqView } from "./views/McqView";
import { ChatView } from "./views/ChatView";
import { useAnalysisContext } from "./contexts/AnalysisContext";
import type { HistoryItemType } from "./contexts/AnalysisContext";

const TABS: readonly HistoryItemType[] = ["code", "mcq", "chat"] as const;

function App() {
  const { analyses, activeTab, setActiveTab } = useAnalysisContext();

  const isAnalysisLoading = analyses.code?.isLoading || analyses.mcq?.isLoading;
  const isChatLoading = analyses.chat?.isLoading;
  const isGenerating = Boolean(isAnalysisLoading || isChatLoading);

  React.useEffect(() => {
    window.electronAPI.showWindow();
  }, []);

  React.useEffect(() => {
    window.electronAPI.toggleShortcuts(!isGenerating);
  }, [isGenerating]);

  // 📑 Tab switching IPC shortcut listener
  React.useEffect(() => {
    const handleSwitchTab = (data: { direction: "next" | "previous" }) => {
      const { direction } = data;
      setActiveTab((current) => {
        const currentIndex = TABS.indexOf(current);
        const nextIndex =
          direction === "next"
            ? (currentIndex + 1) % TABS.length
            : (currentIndex - 1 + TABS.length) % TABS.length;
        return TABS[nextIndex];
      });
    };

    const cleanup = window.electronAPI.onSwitchTab(handleSwitchTab);
    return () => {
      cleanup();
    };
  }, [setActiveTab]);

  // ⌨️ In-window keydown listener for Ctrl + T & Ctrl + Shift + T
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        const direction = e.shiftKey ? "previous" : "next";
        setActiveTab((current) => {
          const currentIndex = TABS.indexOf(current);
          const nextIndex =
            direction === "next"
              ? (currentIndex + 1) % TABS.length
              : (currentIndex - 1 + TABS.length) % TABS.length;
          return TABS[nextIndex];
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setActiveTab]);

  // 📲 Handle manual tab change
  const handleChange = (value: string) => {
    setActiveTab(value as HistoryItemType);
    window.electronAPI.showWindow();
  };

  // 📲 Render corresponding view
  const renderView = () => {
    switch (activeTab) {
      case "code":
        return <CodeView />;
      case "mcq":
        return <McqView />;
      case "chat":
        return <ChatView />;
      default:
        return <CodeView />;
    }
  };

  return (
    <main className="bg-slate-950/80 rounded-lg flex flex-col h-full">
      <header className="flex justify-between items-center p-2 sticky top-0 z-50 bg-slate-950/20 rounded-lg">
        <div className="flex items-center gap-4">
          <HeaderLogo />
        </div>
        <div>
          <Tabs
            selectedValue={activeTab}
            onChange={handleChange}
            isGenerating={isGenerating}
          />
        </div>
        <div>
          <Toolbar />
        </div>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">{renderView()}</div>
    </main>
  );
}

export default App;
