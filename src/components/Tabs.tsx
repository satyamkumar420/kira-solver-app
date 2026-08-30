import React from "react";

// 📑 TabOption Component
interface TabOptionProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: (value: string) => void;
  isGenerating: boolean;
}

const TabOption: React.FC<TabOptionProps> = ({
  label,
  value,
  isActive,
  onClick,
  isGenerating,
}) => (
  <div className="relative">
    <button
      onClick={() => !isGenerating && onClick(value)}
      disabled={isGenerating}
      className={`px-4 py-1 rounded-full text-slate-400 transition-colors ${
        isActive
          ? "bg-slate-900/80 text-white"
          : isGenerating
          ? "cursor-not-allowed"
          : "hover:bg-slate-900/80"
      } ${isGenerating ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {label}
    </button>
    {isGenerating && isActive && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/80  text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          Generating
        </div>
      </div>
    )}
  </div>
);

// 🎨 Tabs Component
interface TabsProps {
  selectedValue: string;
  onChange: (value: string) => void;
  isGenerating: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  selectedValue,
  onChange,
  isGenerating,
}) => {
  const tabs = [
    { label: "Code", value: "code" },
    { label: "MCQ", value: "mcq" },
    { label: "Chat", value: "chat" },
  ];

  return (
    <div className="p-2 group">
      <div className="flex items-center space-x-4 bg-gray-900/50 rounded-full p-2">
        {tabs.map((tab) => (
          <TabOption
            key={tab.value}
            label={tab.label}
            value={tab.value}
            isActive={selectedValue === tab.value}
            onClick={onChange}
            isGenerating={isGenerating}
          />
        ))}
      </div>
    </div>
  );
};
