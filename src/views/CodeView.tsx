import { useMemo } from "react";
import { useAnalysisContext } from "../contexts/AnalysisContext";
import { CodeBlock } from "../components/CodeBlock";
import { ScreenshotManager } from "../components/ScreenshotManager";
import {
  LoadingSpinner,
  BrainIcon,
  CodeIcon,
  ZapIcon,
  ClockIcon,
  LayersIcon,
} from "../components/Icons";
import { CodeRender } from "../components/MarkdownRenderer";

// Define the structure for a single solution
interface Solution {
  thoughts: string[];
  code: string;
  time_complexity: string;
  space_complexity: string;
}

// Define the structure for the analysis result
interface CodeAnalysis {
  brute_force: Solution;
  optimized: Solution;
}

// Reusable component to display a single solution
const SolutionView = ({
  solution,
  title,
  language,
}: {
  solution: Solution;
  title: string;
  language: string;
}) => (
  <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/40">
    <h2 className="text-xl font-bold mb-4 text-indigo-400">{title}</h2>
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-blue-400 flex items-center gap-1.5">
          <BrainIcon className="w-4 h-4 text-blue-400" />
          <span>Thoughts</span>
        </h3>
        <ul className="list-disc list-inside space-y-1 pl-2">
          {solution.thoughts.map((thought, i) => (
            <li key={i}>
              <CodeRender text={thought} className="bg-slate-900" />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-blue-400 flex items-center gap-1.5">
          <CodeIcon className="w-4 h-4 text-blue-400" />
          <span>Code</span>
        </h3>
        <CodeBlock language={language.toLowerCase()} code={solution.code} />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-blue-400 flex items-center gap-1.5">
          <ZapIcon className="w-4 h-4 text-blue-400" />
          <span>Complexity Analysis</span>
        </h3>
        <ul className="list-none space-y-1.5 pl-2">
          <li className="flex items-center gap-2">
            <span className="font-medium text-slate-300 flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5 text-slate-400" /> Time:
            </span>{" "}
            <CodeRender
              text={solution.time_complexity}
              className="bg-slate-900"
            />
          </li>
          <li className="flex items-center gap-2">
            <span className="font-medium text-slate-300 flex items-center gap-1">
              <LayersIcon className="w-3.5 h-3.5 text-slate-400" /> Space:
            </span>{" "}
            <CodeRender
              text={solution.space_complexity}
              className="bg-slate-900"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// CodeView Component
export const CodeView = () => {
  const { analyses, language } = useAnalysisContext();
  const { analysis, isLoading, error } = analyses.code || {};

  const fullContent = useMemo(
    () => analysis?.map((msg) => msg.content).join("") || "",
    [analysis]
  );

  const parsedAnalysis = useMemo<CodeAnalysis | null>(() => {
    if (!fullContent || isLoading) return null;
    try {
      const cleanedAnalysis = fullContent.replace(/```json\s*|```/g, "").trim();
      return JSON.parse(cleanedAnalysis);
    } catch (e) {
      console.error("Failed to parse analysis JSON:", e);
      return null;
    }
  }, [fullContent, isLoading]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto p-4">
        <h1 className="text-base font-semibold text-white mb-2 border-b border-slate-700 pb-2">
          Code Solver
        </h1>
        {isLoading && (!analysis || analysis.length === 0) && (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <LoadingSpinner className="animate-spin h-8 w-8 mx-auto text-indigo-200" />
              <p className="mt-2 text-slate-400 text-sm">Analyzing Screenshots...</p>
            </div>
          </div>
        )}
        {parsedAnalysis && !isLoading && (
          <div className="space-y-6 text-slate-200">
            {/* Render Brute-Force Solution */}
            {parsedAnalysis.brute_force && (
              <SolutionView
                solution={parsedAnalysis.brute_force}
                title="Brute-Force Solution"
                language={language}
              />
            )}

            {/* Render Optimized Solution */}
            {parsedAnalysis.optimized && (
              <SolutionView
                solution={parsedAnalysis.optimized}
                title="Optimized Solution"
                language={language}
              />
            )}
          </div>
        )}
        {!isLoading && (!analysis || analysis.length === 0) && (
          <p className="text-slate-400 text-center mt-4 text-sm">
            Solve DSA or coding interview problems by taking a screenshot{" "}
            <kbd className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 text-xs">
              CTRL + H
            </kbd>
          </p>
        )}
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>
      <ScreenshotManager view="code" />
    </div>
  );
};
