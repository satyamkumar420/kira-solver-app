import { memo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyIcon, CheckIcon } from "./Icons";

interface CodeBlockProps {
  language: string;
  code: string;
}

/**
 * Clean code block component with syntax highlighting and SVG copy button.
 */
export const CodeBlock = memo(({ language, code }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-2">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-[2] text-xs bg-slate-900/90 hover:bg-slate-800 text-white font-medium py-1 px-2.5 rounded-md border border-slate-700/60 transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-md flex items-center gap-1.5"
        title="Copy Code"
      >
        {copied ? (
          <>
            <CheckIcon className="w-3.5 h-3.5 text-green-400" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className="w-3.5 h-3.5 text-slate-300" />
            <span>Copy</span>
          </>
        )}
      </button>

      <SyntaxHighlighter
        PreTag="div"
        language={language}
        style={coldarkDark}
        customStyle={{
          background: "rgba(22, 23, 37, 0.6)",
          padding: "1.25rem",
          borderRadius: "0.5rem",
          margin: 0,
        }}
        wrapLines={true}
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            background: "transparent",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
});
