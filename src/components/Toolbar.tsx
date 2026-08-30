import { useState } from "react";
import { CommandIcon, HistoryIcon, LanguageIcon, SettingsIcon } from "./Icons";
import Shortcuts from "./Shortcuts";
import Dropdown from "./Dropdown";
import { LanguageMenu } from "./LanguageMenu";
import { HistoryMenu } from "./HistoryMenu";
import { SettingsModal } from "./SettingsModal";

// The main toolbar component
export const Toolbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="p-2">
      <div className="flex items-center space-x-4 bg-gray-900/50 rounded-full px-4 py-2 pt-3">
        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="AI & Model Settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>

        {/* Language Menu Button */}
        <Dropdown
          trigger={
            <button
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Change Language"
            >
              <LanguageIcon className="w-6 h-6" />
            </button>
          }
        >
          <LanguageMenu />
        </Dropdown>

        {/* Command / Shortcuts Button */}
        <Dropdown
          trigger={
            <button
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <CommandIcon className="w-6 h-6" />
            </button>
          }
        >
          <Shortcuts />
        </Dropdown>

        {/* Chat History Button */}
        <Dropdown
          trigger={
            <button
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Chat History"
            >
              <HistoryIcon className="w-6 h-6" />
            </button>
          }
        >
          <HistoryMenu />
        </Dropdown>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

