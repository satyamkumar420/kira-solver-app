import React from "react";

const shortcuts = [
  { command: "Move Window", keys: "CTRL + Arrow Keys" },
  { command: "Close Window", keys: "CTRL + Q" },
  { command: "Show & Hide Window", keys: "CTRL + B" },
  { command: "Switch Tabs (Next)", keys: "CTRL + T" },
  { command: "Switch Tabs (Prev)", keys: "CTRL + SHIFT + T" },
  { command: "New Session / Clear", keys: "CTRL + R" },
  { command: "Take Screenshot", keys: "CTRL + H" },
  { command: "Analyze Screenshots", keys: "CTRL + ENTER" },
];

const Shortcuts: React.FC = () => {
  return (
    <div className="bg-slate-900/50 text-white p-4 rounded-lg shadow-lg w-96 mt-1 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4">Keyboard Shortcuts</h3>
      <ul>
        {shortcuts.map((shortcut, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span>{shortcut.command}</span>
            <kbd className="bg-slate-900/90 px-2 py-1 rounded-md text-sm">
              {shortcut.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Shortcuts;
