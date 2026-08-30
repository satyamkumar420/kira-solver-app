import React, { useState, useRef, type ReactNode } from "react";
import useOnClickOutside from "../hooks/useOnClickOutside";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 rounded-lg bg-slate-950/50 shadow-2xl backdrop-blur-lg">
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
