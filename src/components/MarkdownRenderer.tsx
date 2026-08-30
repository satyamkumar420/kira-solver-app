import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import "katex/dist/katex.min.css";
import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
  children: string;
}

/**
 * 🎨 Renders markdown content with syntax highlighting, GFM, and LaTeX support.
 * @param {MarkdownRendererProps} props - The component props.
 * @returns {JSX.Element} The rendered markdown.
 */
export const MarkdownRenderer = memo(({ children }: MarkdownRendererProps) => {
  const components = useMemo(
    () => ({
      code({
        className,
        children,
        ...props
      }: {
        className?: string;
        children?: React.ReactNode;
      }) {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");
        return match ? (
          <CodeBlock language={match[1]} code={codeString} {...props} />
        ) : (
          <code
            className={`${className} whitespace-pre-wrap break-all`}
            {...props}
          >
            {children}
          </code>
        );
      },
    }),
    []
  );

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});

export const CodeRender = memo(
  ({ text, className }: { text: string; className?: string }) => {
    const texts = text.split(/(`[^`]+`)/g);

    return (
      <>
        {texts.map((text, i) =>
          text.startsWith("`") && text.endsWith("`") ? (
            <code
              key={i}
              className={`text-slate-200 rounded-md px-1.5 py-0.5 mx-0.5 font-mono text-sm whitespace-pre-wrap break-all ${className}`}
            >
              {text.slice(1, -1)}
            </code>
          ) : (
            <span key={i}>{text}</span>
          )
        )}
      </>
    );
  }
);
